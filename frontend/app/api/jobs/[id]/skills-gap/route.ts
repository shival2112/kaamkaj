/**
 * GET /api/jobs/[id]/skills-gap
 *
 * Returns a skills gap analysis for the authenticated candidate vs. the job's
 * required skills. Response includes matched skills, missing skills, and a
 * match percentage.
 *
 * Returns 200 with { matched: [], missing: [], pct: 0, authenticated: false }
 * when the user is not logged in (so the caller can decide whether to prompt login).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, '').trim();
}

function skillsMatch(a: string, b: string): boolean {
  const na = normalise(a);
  const nb = normalise(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where:  { id: params.id },
      select: { skills: true, title: true },
    });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (job.skills.length === 0) {
      return NextResponse.json({ matched: [], missing: [], pct: 100, authenticated: false, note: 'No skills required' });
    }

    // Try to get authenticated candidate's skills
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ matched: [], missing: job.skills, pct: 0, authenticated: false });
    }

    const resume = await prisma.resume.findUnique({
      where:  { userId: user.id },
      select: { parsedData: true },
    });

    const candidateSkills: string[] = ((resume?.parsedData as { skills?: string[] } | null)?.skills) ?? [];

    const matched: string[] = [];
    const missing: string[] = [];

    for (const required of job.skills) {
      const has = candidateSkills.some(cs => skillsMatch(cs, required));
      (has ? matched : missing).push(required);
    }

    const pct = Math.round((matched.length / job.skills.length) * 100);

    return NextResponse.json({ matched, missing, pct, authenticated: true, totalRequired: job.skills.length });
  } catch (error) {
    console.error('[GET /api/jobs/[id]/skills-gap]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
