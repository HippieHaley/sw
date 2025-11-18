import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      platformName, 
      accessToken, 
      refreshToken, 
      expiresAt,
      externalUserId,
      externalUsername
    } = body;

    if (!platformName || !accessToken) {
      return NextResponse.json(
        { error: 'Platform name and access token are required' },
        { status: 400 }
      );
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    // Save or update platform connection
    const platform = await prisma.platform.upsert({
      where: {
        userId_platformName: {
          userId: session.userId,
          platformName: platformName.toLowerCase(),
        },
      },
      update: {
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: expiresAt ? new Date(expiresAt) : null,
        externalUserId,
        externalUsername,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platformName: platformName.toLowerCase(),
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: expiresAt ? new Date(expiresAt) : null,
        externalUserId,
        externalUsername,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      platform: {
        id: platform.id,
        platformName: platform.platformName,
        externalUsername: platform.externalUsername,
        isActive: platform.isActive,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to save OAuth connection' },
      { status: 500 }
    );
  }
}
