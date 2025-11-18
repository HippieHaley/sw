import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { writeFile, mkdir } from 'fs/promises';
import { metadataScrubber } from '@/lib/metadata-scrubber';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Save to temp directory first
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = path.join(process.cwd(), 'temp');
    await mkdir(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `temp_${Date.now()}_${file.name}`);
    await writeFile(tempPath, buffer);

    // Scrub metadata
    const result = await metadataScrubber.scrubFile(tempPath, file.type);

    // Clean up temp file
    await metadataScrubber.cleanup(tempPath);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to process file', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filePath: result.scrubbedPath,
      originalMetadata: result.originalMetadata,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
