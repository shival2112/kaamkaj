import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { JobType, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) return NextResponse.json({ jobs: [], total: 0 });

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs, total: jobs.length, company });
  } catch (error) {
    console.error('[GET /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (user.user_metadata?.role as string ?? '').toUpperCase();
    if (role !== 'EMPLOYER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as {
      title: string; type: string; location: string;
      experienceLevel: string; salaryMin?: number; salaryMax?: number;
      vacancies?: number; skills?: string[]; description: string;
    };

    const { title, type, location, experienceLevel, salaryMin, salaryMax, vacancies = 1, skills = [], description } = body;

    if (!title?.trim() || !location?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'title, location and description are required' }, { status: 400 });
    }

    const validTypes = Object.values(JobType) as string[];
    const validLevels = Object.values(ExperienceLevel) as string[];
    if (!validTypes.includes(type)) return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
    if (!validLevels.includes(experienceLevel)) return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 });

    // Get or auto-create company for this employer
    let company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) {
      const displayName = (user.user_metadata?.name as string) ?? user.email?.split('@')[0] ?? 'Employer';
      company = await prisma.company.create({
        data: {
          name: `${displayName}'s Company`,
          ownerId: user.id,
        },
      });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        companyId: company.id,
        location: location.trim(),
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        type: type as JobType,
        experienceLevel: experienceLevel as ExperienceLevel,
        status: 'ACTIVE',
        vacancies,
        skills: skills.filter(Boolean),
        expiresAt,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
