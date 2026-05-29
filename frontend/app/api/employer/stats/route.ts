import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) return NextResponse.json({ activeListings: 0, totalApplicants: 0, shortlisted: 0, filled: 0 });

    const [activeListings, jobs] = await Promise.all([
      prisma.job.count({ where: { companyId: company.id, status: 'ACTIVE' } }),
      prisma.job.findMany({ where: { companyId: company.id }, select: { id: true } }),
    ]);

    const jobIds = jobs.map(j => j.id);

    const [totalApplicants, shortlisted, filled] = await Promise.all([
      prisma.application.count({ where: { jobId: { in: jobIds } } }),
      prisma.application.count({ where: { jobId: { in: jobIds }, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { jobId: { in: jobIds }, status: 'HIRED' } }),
    ]);

    return NextResponse.json({ activeListings, totalApplicants, shortlisted, filled });
  } catch (error) {
    console.error('[GET /api/employer/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
