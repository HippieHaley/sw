import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  filePath: z.string().optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(['draft', 'scheduled']).default('draft'),
  platformIds: z.array(z.string()).optional(),
});

// Get all posts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { userId: session.userId },
      include: {
        platformPosts: {
          include: {
            platform: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Decrypt post data
    const decryptedPosts = posts.map(post => ({
      id: post.id,
      title: decrypt(post.encryptedTitle),
      description: post.encryptedDescription ? decrypt(post.encryptedDescription) : null,
      filePath: post.encryptedFilePath ? decrypt(post.encryptedFilePath) : null,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      platformPosts: post.platformPosts.map(pp => ({
        id: pp.id,
        platformName: pp.platform.platformName,
        status: pp.status,
        postedAt: pp.postedAt,
        errorMessage: pp.errorMessage,
      })),
    }));

    return NextResponse.json({ posts: decryptedPosts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const data = postSchema.parse(body);

    // Encrypt sensitive data
    const encryptedTitle = encrypt(data.title);
    const encryptedDescription = data.description ? encrypt(data.description) : null;
    const encryptedFilePath = data.filePath ? encrypt(data.filePath) : null;

    const post = await prisma.post.create({
      data: {
        userId: session.userId,
        encryptedTitle,
        encryptedDescription,
        encryptedFilePath,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        status: data.status,
      },
    });

    // Create platform posts if specified
    if (data.platformIds && data.platformIds.length > 0) {
      await prisma.platformPost.createMany({
        data: data.platformIds.map(platformId => ({
          postId: post.id,
          platformId,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: data.title,
        scheduledFor: post.scheduledFor,
        status: post.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
