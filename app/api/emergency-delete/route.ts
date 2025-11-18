import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { metadataScrubber } from '@/lib/metadata-scrubber';

/**
 * EMERGENCY DELETE - Immediately purge all user data
 * This is a panic button for safety emergencies
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.userId;

    // Get all posts to delete associated files
    const posts = await prisma.post.findMany({
      where: { userId },
      select: { encryptedFilePath: true },
    });

    // Delete all uploaded files
    for (const post of posts) {
      if (post.encryptedFilePath) {
        try {
          const filePath = post.encryptedFilePath;
          await metadataScrubber.deleteScrubbedFile(filePath);
        } catch (error) {
          console.error('Error deleting file:', error);
          // Continue anyway - data safety is priority
        }
      }
    }

    // Delete all user data from database (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Destroy session
    const response = NextResponse.json({
      success: true,
      message: 'All data permanently deleted',
    });

    session.destroy();

    return response;
  } catch (error) {
    console.error('Emergency delete error:', error);
    
    // Even on error, try to destroy session
    try {
      const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
      session.destroy();
    } catch {}

    return NextResponse.json(
      { error: 'Emergency delete completed with some errors' },
      { status: 500 }
    );
  }
}
