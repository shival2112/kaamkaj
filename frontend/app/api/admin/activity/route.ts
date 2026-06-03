import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (user.user_metadata?.role as string ?? '').toUpperCase();
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [recentUsers, recentJobs, recentApps] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, name: true, role: true, createdAt: true },
      }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, title: true, status: true, createdAt: true,
          company: { select: { name: true } },
        },
      }),
      prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        take: 20,
        select: {
          id: true, appliedAt: true,
          candidate: { select: { name: true } },
          job:       { select: { title: true } },
        },
      }),
    ]);

    type Event = {
      id: string; type: string; icon: string;
      summary: string; detail: string; timestamp: string;
    };

    const events: Event[] = [
      ...recentUsers.map(u => ({
        id:        `user-${u.id}`,
        type:      'user_registered',
        icon:      'user',
        summary:   `${u.name} joined`,
        detail:    `New ${u.role.toLowerCase()} registered`,
        timestamp: u.createdAt.toISOString(),
      })),
      ...recentJobs.map(j => ({
        id:        `job-${j.id}`,
        type:      'job_posted',
        icon:      'briefcase',
        summary:   j.title,
        detail:    `Posted by ${j.company.name} · ${j.status}`,
        timestamp: j.createdAt.toISOString(),
      })),
      ...recentApps.map(a => ({
        id:        `app-${a.id}`,
        type:      'application_submitted',
        icon:      'send',
        summary:   `${a.candidate.name} applied`,
        detail:    `Application for "${a.job.title}"`,
        timestamp: a.appliedAt.toISOString(),
      })),
    ];

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ events: events.slice(0, 50) });
  } catch (error) {
    console.error('[GET /api/admin/activity]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
