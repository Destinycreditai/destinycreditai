import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.letterTemplate.findMany({
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, content, disclaimer, enabled = true } = await request.json();
    
    // Validate required fields
    if (!category || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category and content are required' 
      }, { status: 400 });
    }
    
    const template = await prisma.letterTemplate.create({
      data: { category, content, disclaimer, enabled }
    });
    
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}