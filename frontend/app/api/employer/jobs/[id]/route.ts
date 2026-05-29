import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { JobStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json() as { status: string };
    const validStatuses = Object.values(JobStatus) as string[];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: { status: body.status as JobStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await prisma.job.update({ where: { id: params.id }, data: { status: 'CLOSED' } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
