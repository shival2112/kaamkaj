import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// In-memory dedup store: "userId:jobId" → timestamp of last view
// Resets on cold-start (serverless), good enough for abuse prevention
const recentViews = new Map<string, number>();
const VIEW_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour per user per job

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Resolve viewer identity — either Supabase or NextAuth session
    let viewerId: string | null = null;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      viewerId = user.id;
    } else {
      const session = await auth();
      if (session?.user?.id) viewerId = session.user.id as string;
    }

    // Also accept an anonymous fingerprint from the client (IP + UA hash)
    // so guests still count but can't spam
    const body = await request.json().catch(() => ({})) as { fp?: string };
    const key = viewerId ?? body.fp ?? null;

    if (!key) {
      // Completely anonymous with no fingerprint — ignore silently
      return NextResponse.json({ ok: true });
    }

    const dedupKey = `${key}:${params.id}`;
    const lastView = recentViews.get(dedupKey) ?? 0;

    if (Date.now() - lastView < VIEW_COOLDOWN_MS) {
      // Already counted this view within the hour — skip DB write
      return NextResponse.json({ ok: true });
    }

    recentViews.set(dedupKey, Date.now());

    // Prune old entries to prevent unbounded memory growth
    if (recentViews.size > 10000) {
      const cutoff = Date.now() - VIEW_COOLDOWN_MS;
      Array.from(recentViews.entries()).forEach(([k, ts]) => {
        if (ts < cutoff) recentViews.delete(k);
      });
    }

    await prisma.job.update({
      where: { id: params.id },
      data:  { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
