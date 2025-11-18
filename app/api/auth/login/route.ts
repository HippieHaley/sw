import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/lib/auth';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { prisma } = await import('@/lib/prisma');
  try {
    const body = await request.json();
    console.log('Login attempt for username:', body.username);
    const { username, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found, verifying password...');
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully');

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });

    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    session.userId = user.id;
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Login failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
