import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      userName, 
      userAddress, 
      creditorName, 
      accountNumber, 
      disputeReason, 
      bureau,
      letterType,
      userId,
      documentIds, // Array of uploaded document IDs to reference
      documentContent // Optional: pre-extracted document content
    } = await request.json();

    // Get AI prompts from database
    const promptsData = await prisma.aIPrompt.findMany({ where: { enabled: true } });
    const prompts = promptsData.reduce((acc: any, prompt: any) => {
      acc[prompt.type] = prompt.content;
      return acc;
    }, {});

    const systemPrompt = prompts.system || `You are an AI assistant that helps create educational credit dispute letters. CRITICAL COMPLIANCE RULES:
    - Use ONLY conditional language ("if inaccurate", "may be inconsistent")
    - NEVER guarantee deletion or outcomes
    - NEVER provide legal advice
    - Focus on education and information verification
    - All content must be educational only`;
    
    const compliancePrompt = `MANDATORY COMPLIANCE:
    - Use phrases like "if this information is inaccurate" or "should this be found inconsistent"
    - REFUSE any requests for guaranteed deletion
    - REFUSE legal strategy advice
    - Emphasize educational purpose only
    - Include verification language only`;
    
    const fullSystemPrompt = `${systemPrompt}\n\n${compliancePrompt}\n\nCreate a ${letterType} letter that is strictly educational and compliant.`;

    // Fetch document content if document IDs are provided
    let documentAnalysis = '';
    if (documentIds && documentIds.length > 0) {
      const documents = await prisma.uploadedFile.findMany({
        where: { id: { in: documentIds } },
        include: { user: true }
      });
      
      if (documents.length > 0) {
        documentAnalysis = `\n\nUPLOADED DOCUMENTS FOR REFERENCE:\n`;
        documents.forEach((doc, index) => {
          documentAnalysis += `Document ${index + 1}: ${doc.filename} (${doc.fileType})\n`;
        });
        documentAnalysis += `\nPlease analyze the uploaded documents (credit reports, statements, etc.) and identify:\n`;
        documentAnalysis += `- Any missing information that should be present\n`;
        documentAnalysis += `- Inconsistent information across documents\n`;
        documentAnalysis += `- Potential inaccuracies that may need verification\n`;
        documentAnalysis += `- Account details that may be incomplete or incorrect\n`;
        documentAnalysis += `\nUse this analysis to create a more informed educational letter that references specific items from the documents when appropriate.`;
      }
    }
    
    // Use provided document content if available
    if (documentContent) {
      documentAnalysis += `\n\nDOCUMENT CONTENT ANALYSIS:\n${documentContent}\n`;
      documentAnalysis += `\nPlease review the above document content and identify any missing, inconsistent, or potentially inaccurate information that should be addressed in the educational letter.`;
    }

    const userPrompt = `Create a credit ${letterType} letter with these details:
    - User: ${userName}
    - Address: ${userAddress}
    - Creditor: ${creditorName}
    - Account: ${accountNumber}
    - Reason: ${disputeReason}
    - Bureau: ${bureau}
    ${documentAnalysis}
    
    Make it professional, educational, and compliant with credit reporting laws.
    ${documentAnalysis ? 'Reference specific information from the uploaded documents when identifying potential issues, but use conditional language (e.g., "if this information is inaccurate" or "should this be found inconsistent").' : ''}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const generatedLetter = completion.choices[0]?.message?.content || 'Failed to generate letter';
    
    // Get disclaimer from database
    const disclaimerData = await prisma.disclaimer.findFirst({ 
      where: { type: 'letters', enabled: true } 
    });
    const disclaimer = disclaimerData?.content || 'This letter is for educational purposes only and does not constitute legal advice.';
    
    const finalLetter = `${generatedLetter}\n\n---\nEDUCATIONAL DISCLAIMER: ${disclaimer}`;

    // Ensure user exists or create default user
    let user = await prisma.user.findFirst({ where: { email: 'demo@example.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: userName || 'Demo User', email: 'demo@example.com', role: 'USER' }
      });
    }
    
    // If userId provided, verify it exists, otherwise use default user
    let finalUserId = user.id;
    if (userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: String(userId) } });
      if (existingUser) {
        finalUserId = existingUser.id;
      }
    }
    
    // Validate required fields before saving
    if (!bureau || !creditorName || !letterType || !finalLetter) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: bureau, creditorName, letterType, and content are required' 
      }, { status: 400 });
    }
    
    await prisma.creditLetter.create({
      data: {
        userId: finalUserId,
        bureau,
        creditorName,
        accountNumber: accountNumber || null,
        letterType,
        tone: 'professional',
        content: finalLetter
      }
    });

    return NextResponse.json({ 
      success: true,
      data: { letter: finalLetter }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
}