import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
      },
    });

    if (!post || post.userId !== session.userId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get Twitter platform connection
    const platform = await prisma.platform.findUnique({
      where: {
        userId_platformName: {
          userId: session.userId,
          platformName: 'twitter',
        },
      },
    });

    if (!platform || !platform.encryptedAccessToken) {
      return NextResponse.json(
        { error: 'Twitter not connected. Please connect your account first.' },
        { status: 400 }
      );
    }

    // Decrypt tokens
    const accessToken = decrypt(platform.encryptedAccessToken);
    const refreshToken = platform.encryptedRefreshToken 
      ? decrypt(platform.encryptedRefreshToken) 
      : undefined;

    // Initialize Twitter client
    const client = new TwitterApi(accessToken);

    // Decrypt post content
    const CryptoJS = require('crypto-js');
    const key = process.env.ENCRYPTION_KEY!;
    const title = CryptoJS.AES.decrypt(post.encryptedTitle, key).toString(CryptoJS.enc.Utf8);
    const description = post.encryptedDescription 
      ? CryptoJS.AES.decrypt(post.encryptedDescription, key).toString(CryptoJS.enc.Utf8)
      : '';

    // Build tweet text
    let tweetText = title;
    if (description) {
      tweetText += `\n\n${description}`;
    }
    
    // Add custom hashtags if configured
    if (platform.customHashtags) {
      tweetText += `\n\n${platform.customHashtags}`;
    }

    // Limit to 280 characters
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...';
    }

    // Post to Twitter
    const tweet = await client.v2.tweet(tweetText);

    // Create platform post record
    await prisma.platformPost.create({
      data: {
        postId: post.id,
        platformId: platform.id,
        externalId: tweet.data.id,
        status: 'posted',
        postedAt: new Date(),
      },
    });

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      tweetId: tweet.data.id,
      tweetUrl: `https://twitter.com/${platform.externalUsername}/status/${tweet.data.id}`,
    });
  } catch (error: any) {
    console.error('Twitter post error:', error);
    
    // Handle rate limit
    if (error.code === 429 || error.rateLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You have used your monthly quota.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to post to Twitter' },
      { status: 500 }
    );
  }
}
