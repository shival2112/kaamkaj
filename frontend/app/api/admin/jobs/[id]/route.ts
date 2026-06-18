import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: { select: { name: true, industry: true, website: true } },
        applications: { select: { status: true } },
        reports: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
            reporter: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const appsByStatus = job.applications.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {});

    const { applications, ...rest } = job;
    void applications; // consumed above
    return NextResponse.json({ ...rest, appsByStatus });
  } catch (error) {
    console.error('[GET /api/admin/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as { status?: string; isUrgent?: boolean };

    const data: { status?: JobStatus; isUrgent?: boolean } = {};

    if (body.status !== undefined) {
      const validStatuses = Object.values(JobStatus) as string[];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      data.status = body.status as JobStatus;
    }

    if (body.isUrgent !== undefined) {
      data.isUrgent = Boolean(body.isUrgent);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const updated = await prisma.job.update({
      where: { id: params.id },
      data,
      select: { id: true, status: true, isUrgent: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const job = await prisma.job.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    await prisma.job.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
