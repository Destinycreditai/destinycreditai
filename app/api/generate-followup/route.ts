import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userName, creditorName, day = 30 } = await request.json();

    // Get AI prompts from database
    const promptsData = await prisma.aIPrompt.findMany({ where: { enabled: true } });
    const prompts = promptsData.reduce((acc: any, prompt: any) => {
      acc[prompt.type] = prompt.content;
      return acc;
    }, {});

    const systemPrompt = prompts.system || `You are an AI assistant that helps create educational follow-up letters. CRITICAL COMPLIANCE RULES:
    - Use ONLY conditional language ("if inaccurate", "may be inconsistent")
    - NEVER guarantee deletion or outcomes
    - NEVER provide legal advice
    - Focus on education and information verification
    - All content must be educational only
    - Follow-ups should request status updates, not demand action`;
    
    const userPrompt = `Create a follow-up letter for day ${day} regarding a credit dispute with these details:
    - User: ${userName}
    - Creditor: ${creditorName}
    - Day: ${day}
    
    Make it professional, educational, and compliant. Use conditional language like "if inaccurate" and "may be inconsistent".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const generatedLetter = completion.choices[0]?.message?.content || 'Failed to generate follow-up letter';
    
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
    
    const existing = await prisma.followUpLetter.findFirst({
      where: {
        userId: String(user.id),
        day: Number(day),
      },
    });

    if (existing) {
      await prisma.followUpLetter.update({
        where: { id: existing.id },
        data: {
          content: finalLetter,
        },
      });
    } else {
      await prisma.followUpLetter.create({
        data: {
          userId: String(user.id),
          day: Number(day),
          content: finalLetter,
        },
      });
    }

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