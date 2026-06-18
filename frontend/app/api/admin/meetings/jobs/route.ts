import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const jobs = await prisma.job.findMany({
      where:   { status: JobStatus.ACTIVE },
      select:  { id: true, title: true },
      orderBy: { title: 'asc' },
      take:    500,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[GET /api/admin/meetings/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

