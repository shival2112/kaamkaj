import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCandidateUserId } from '@/lib/candidate-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await resolveCandidateUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [applications, savedJobs, interviews] = await Promise.all([
      prisma.application.count({ where: { candidateId: userId } }),
      prisma.savedJob.count({ where: { userId } }),
      prisma.application.count({ where: { candidateId: userId, status: 'SHORTLISTED' } }),
    ]);

    console.log('[GET /api/candidate/stats] userId:', userId, '→ apps:', applications, 'saved:', savedJobs, 'shortlisted:', interviews);
    return NextResponse.json({ applications, savedJobs, interviews });
  } catch (error) {
    console.error('[GET /api/candidate/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
