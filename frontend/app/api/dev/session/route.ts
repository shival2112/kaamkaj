import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Survives HMR (module reloads during hot-reload reuse the global) but
// changes on every fresh `npm run dev` (new Node.js process = new global).
declare global {
  // eslint-disable-next-line no-var
  var __devServerSessionId: string | undefined;
}

if (!globalThis.__devServerSessionId) {
  globalThis.__devServerSessionId = Date.now().toString();
}

export async function GET() {
  // Hard 404 in production — this route must never be reachable live.
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json({ sessionId: globalThis.__devServerSessionId });
}
