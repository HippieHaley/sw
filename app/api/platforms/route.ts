import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { encryptObject, decryptObject } from '@/lib/encryption';
import { z } from 'zod';

const platformSchema = z.object({
  platformName: z.string().min(1),
  config: z.record(z.any()),
  customHashtags: z.string().optional(),
});

// Get all platforms for user
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const platforms = await prisma.platform.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        platformName: true,
        encryptedConfig: true,
        customHashtags: true,
        isActive: true,
        externalUsername: true,
        createdAt: true,
      },
    });

    // Decrypt config (if exists, for legacy API key platforms)
    const decryptedPlatforms = platforms.map(p => ({
      id: p.id,
      platformName: p.platformName,
      config: p.encryptedConfig ? decryptObject(p.encryptedConfig) : null,
      customHashtags: p.customHashtags,
      isActive: p.isActive,
      externalUsername: p.externalUsername,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ platforms: decryptedPlatforms });
  } catch (error) {
    console.error('Get platforms error:', error);
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}

// Add new platform
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const data = platformSchema.parse(body);

    // Encrypt config
    const encryptedConfig = encryptObject(data.config);

    const platform = await prisma.platform.create({
      data: {
        userId: session.userId,
        platformName: data.platformName,
        encryptedConfig,
        customHashtags: data.customHashtags || null,
      },
    });

    return NextResponse.json({
      success: true,
      platform: {
        id: platform.id,
        platformName: platform.platformName,
        customHashtags: platform.customHashtags,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Create platform error:', error);
    return NextResponse.json({ error: 'Failed to create platform' }, { status: 500 });
  }
}
