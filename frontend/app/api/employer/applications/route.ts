import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) return NextResponse.json({ applications: [], total: 0 });

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId') || undefined;
    const page  = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = 20;

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      select: { id: true },
    });
    const jobIds = jobs.map(j => j.id);

    const where = {
      jobId: jobId ? jobId : { in: jobIds },
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true } },
          candidate: { select: { id: true, name: true, email: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({ applications, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/employer/applications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
