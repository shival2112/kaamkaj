import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const job = await prisma.job.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const { count } = await prisma.jobReport.deleteMany({ where: { jobId: params.id } });
    return NextResponse.json({ ok: true, dismissed: count });
  } catch (error) {
    console.error('[DELETE /api/admin/jobs/[id]/reports]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
