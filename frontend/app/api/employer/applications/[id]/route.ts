import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ApplicationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    // Verify this application belongs to one of this employer's jobs
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { job: { select: { companyId: true } } },
    });
    if (!application || application.job.companyId !== company.id) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json() as { status: string };
    const validStatuses = Object.values(ApplicationStatus) as string[];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status: body.status as ApplicationStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/employer/applications/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
