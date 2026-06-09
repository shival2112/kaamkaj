import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { JobType, JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, unauth: true };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return { admin: dbUser?.role === 'ADMIN' ? user : null, unauth: false };
}

export async function GET(request: Request) {
  try {
    const { admin, unauth } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: unauth ? 'Unauthorized' : 'Forbidden' }, { status: unauth ? 401 : 403 });

    const { searchParams } = new URL(request.url);
    const q          = searchParams.get('q')?.trim() || undefined;
    const page       = Math.max(1, Number(searchParams.get('page') || 1));
    const typeParam  = searchParams.get('type')?.toUpperCase();
    const statusParam = searchParams.get('status')?.toUpperCase();

    const validTypes    = Object.values(JobType);
    const validStatuses = Object.values(JobStatus);
    const typeFilter   = typeParam   && validTypes.includes(typeParam as JobType)    ? (typeParam as JobType)     : undefined;
    const statusFilter = statusParam && validStatuses.includes(statusParam as JobStatus) ? (statusParam as JobStatus) : undefined;

    const where: Record<string, unknown> = {
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter   && { type:   typeFilter }),
      ...(q && {
        OR: [
          { title:    { contains: q, mode: 'insensitive' as const } },
          { location: { contains: q, mode: 'insensitive' as const } },
          { company:  { name: { contains: q, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { name: true, industry: true } },
          _count:  { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.job.count({ where }),
    ]);

    // Attach report counts (raw query — job_reports table added after last prisma generate)
    const jobIds = jobs.map(j => j.id);
    let reportCounts: Record<string, number> = {};
    if (jobIds.length) {
      const rows = await prisma.$queryRaw<{ job_id: string; cnt: bigint }[]>(
        Prisma.sql`SELECT job_id, COUNT(*)::int AS cnt FROM job_reports WHERE job_id = ANY(${jobIds}::uuid[]) GROUP BY job_id`
      );
      reportCounts = Object.fromEntries(rows.map(r => [r.job_id, Number(r.cnt)]));
    }

    const enriched = jobs.map(j => ({ ...j, reportCount: reportCounts[j.id] ?? 0 }));

    return NextResponse.json({ jobs: enriched, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
