import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGES = 4;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images allowed` }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Create uploads directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Directory might already exist, ignore error
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds 5MB limit: ${file.name}` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${randomUUID()}.${ext}`;
      const filepath = join(uploadDir, filename);

      // Convert file to buffer and write to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Return URL
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
