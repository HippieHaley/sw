// Middleware temporarily disabled to diagnose 508 errors
// The middleware will be re-enabled once the root cause is identified

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Empty matcher = middleware never runs
export const config = {
  matcher: [],
};
