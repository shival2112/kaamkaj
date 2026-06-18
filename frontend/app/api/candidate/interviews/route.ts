import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const meetings = await prisma.meeting.findMany({
      where: {
        userId: user.id,
        status: 'scheduled',
      },
      include: {
        job: { select: { id: true, title: true, company: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Find the next upcoming interview by combining date + time strings
    const now = new Date();
    const upcoming = meetings
      .map(m => ({
        ...m,
        scheduledAt: new Date(`${m.date}T${m.time.includes(':') ? m.time : m.time + ':00'}`),
      }))
      .filter(m => m.scheduledAt > now)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    return NextResponse.json({ interviews: upcoming, next: upcoming[0] ?? null });
  } catch (error) {
    console.error('[GET /api/candidate/interviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
