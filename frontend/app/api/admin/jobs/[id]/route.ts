import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, unauth: true };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return { admin: dbUser?.role === 'ADMIN' ? user : null, unauth: false };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, unauth } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: unauth ? 'Unauthorized' : 'Forbidden' }, { status: unauth ? 401 : 403 });

    const body = await request.json() as { status: string };
    const validStatuses = Object.values(JobStatus) as string[];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: { status: body.status as JobStatus },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
