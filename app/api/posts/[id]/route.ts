import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { encrypt, decrypt } from '@/lib/encryption';
import { metadataScrubber } from '@/lib/metadata-scrubber';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import('@/lib/prisma');
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
      include: {
        platformPosts: {
          include: {
            platform: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Decrypt post data
    const decryptedPost = {
      id: post.id,
      title: decrypt(post.encryptedTitle),
      description: post.encryptedDescription ? decrypt(post.encryptedDescription) : null,
      filePath: post.encryptedFilePath ? decrypt(post.encryptedFilePath) : null,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      platformPosts: post.platformPosts,
    };

    return NextResponse.json({ post: decryptedPost });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import('@/lib/prisma');
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify ownership
    const existingPost = await prisma.post.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Encrypt updated fields
    const updateData: any = {};
    if (data.title) updateData.encryptedTitle = encrypt(data.title);
    if (data.description !== undefined) {
      updateData.encryptedDescription = data.description ? encrypt(data.description) : null;
    }
    if (data.scheduledFor !== undefined) {
      updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
    }
    if (data.status) updateData.status = data.status;

    const post = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import('@/lib/prisma');
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify ownership and get file path
    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete associated file
    if (post.encryptedFilePath) {
      try {
        const filePath = decrypt(post.encryptedFilePath);
        await metadataScrubber.deleteScrubbedFile(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete post (cascade will delete platform posts)
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
