import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ user: null });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  
  if (!session.isLoggedIn) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
    },
  });
}
