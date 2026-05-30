import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface ParsedData { skills?: string[] }

function computeMatch(resumeSkills: string[], jobSkills: string[]) {
  if (!jobSkills.length) return { score: 0, matchedSkills: [] as string[], missingSkills: [] as string[] };

  const norm = resumeSkills.map(s => s.toLowerCase().trim());
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSkills) {
    const s = skill.toLowerCase().trim();
    if (norm.some(r => r.includes(s) || s.includes(r))) matched.push(skill);
    else missing.push(skill);
  }

  return {
    score: Math.round((matched.length / jobSkills.length) * 100),
    matchedSkills: matched,
    missingSkills: missing,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { jobId?: string };
    if (!body.jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });

    const [resume, job] = await Promise.all([
      prisma.resume.findUnique({ where: { userId: user.id }, select: { parsedData: true } }),
      prisma.job.findUnique({ where: { id: body.jobId }, select: { title: true, skills: true } }),
    ]);

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const resumeSkills = ((resume?.parsedData as ParsedData)?.skills) ?? [];
    const { score, matchedSkills, missingSkills } = computeMatch(resumeSkills, job.skills);

    return NextResponse.json({
      score,
      matchedSkills,
      missingSkills,
      jobTitle: job.title,
      resumeSkillCount: resumeSkills.length,
    });
  } catch (error) {
    console.error('[POST /api/candidate/resume/analyze]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
