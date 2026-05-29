import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (user.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase();
    if (role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Only candidates can apply' }, { status: 403 });
    }

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: params.id, candidateId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already applied', application: existing }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: { jobId: params.id, candidateId: user.id },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/apply]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ applied: false });

    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: params.id, candidateId: user.id } },
    });
    return NextResponse.json({ applied: !!existing });
  } catch {
    return NextResponse.json({ applied: false });
  }
}
