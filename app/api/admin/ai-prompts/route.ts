import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prompts = await prisma.aIPrompt.findMany();
    return NextResponse.json({ success: true, data: prompts });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, content, enabled = true } = await request.json();
    
    // Validate required fields
    if (!type || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type and content are required' 
      }, { status: 400 });
    }
    
    const prompt = await prisma.aIPrompt.create({
      data: { type, content, enabled }
    });
    
    return NextResponse.json({ success: true, data: prompt });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}