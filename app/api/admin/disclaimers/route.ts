import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const disclaimers = await prisma.disclaimer.findMany({
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ success: true, data: disclaimers });
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
    
    const disclaimer = await prisma.disclaimer.create({
      data: { type, content, enabled }
    });
    
    return NextResponse.json({ success: true, data: disclaimer });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}