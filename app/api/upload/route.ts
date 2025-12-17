import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type: string = data.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}_${timestamp}.${extension}`;
    
    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    const url = `/uploads/${filename}`;
    
    // Save to database (create demo user if needed)
    let user = await prisma.user.findFirst({ where: { email: 'demo@example.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'demo@example.com', role: 'user' }
      });
    }
    
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        filename,
        filepath: url,
        fileType: file.type,
        uploadedBy: user.id
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      url,
      filename,
      size: file.size,
      type: file.type,
      id: uploadedFile.id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}