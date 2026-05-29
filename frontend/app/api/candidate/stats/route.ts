import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [applications, savedJobs, interviews] = await Promise.all([
      prisma.application.count({ where: { candidateId: user.id } }),
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.application.count({
        where: { candidateId: user.id, status: 'SHORTLISTED' },
      }),
    ]);

    return NextResponse.json({ applications, savedJobs, interviews });
  } catch (error) {
    console.error('[GET /api/candidate/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
