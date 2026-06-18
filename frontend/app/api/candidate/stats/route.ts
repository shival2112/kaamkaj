import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCandidateUserId } from '@/lib/candidate-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await resolveCandidateUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [applications, savedJobs, interviews, dbUser, resume] = await Promise.all([
      prisma.application.count({ where: { candidateId: userId } }),
      prisma.savedJob.count({ where: { userId } }),
      prisma.application.count({ where: { candidateId: userId, status: 'SHORTLISTED' } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true, avatar: true } }),
      prisma.resume.findUnique({ where: { userId }, select: { fileUrl: true, parsedData: true } }),
    ]);

    const pd = resume?.parsedData as Record<string, unknown> | null ?? {};
    let completenessScore = 0;
    if (dbUser?.name)                               completenessScore += 20;
    if (dbUser?.phone)                              completenessScore += 10;
    if (dbUser?.avatar)                             completenessScore += 10;
    if (pd.bio && String(pd.bio).trim().length > 0) completenessScore += 15;
    if (pd.headline && String(pd.headline).trim().length > 0) completenessScore += 15;
    if (Array.isArray(pd.skills) && (pd.skills as unknown[]).length > 0) completenessScore += 20;
    if (pd.experienceLevel)                         completenessScore += 10;

    console.log('[GET /api/candidate/stats] userId:', userId, '→ apps:', applications, 'saved:', savedJobs, 'shortlisted:', interviews, 'completeness:', completenessScore);
    return NextResponse.json({ applications, savedJobs, interviews, completenessScore });
  } catch (error) {
    console.error('[GET /api/candidate/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
