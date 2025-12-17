import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const uploads = await prisma.uploadedFile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    return NextResponse.json({ success: true, data: uploads });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    // Create filepath (in production, save to cloud storage)
    const filename = file.name;
    const filepath = `/uploads/${Date.now()}_${filename}`;
    
    // Get or create default user
    let user = await prisma.user.findFirst({ where: { email: 'demo@example.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Demo User', email: 'demo@example.com', role: 'USER' }
      });
    }
    
    const upload = await prisma.uploadedFile.create({
      data: { 
        filename, 
        filepath, 
        fileType: fileType || 'document', 
        uploadedBy: user.id 
      }
    });
    
    return NextResponse.json({ success: true, data: upload });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}