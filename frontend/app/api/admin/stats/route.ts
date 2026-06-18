import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';



export async function GET() {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalJobs, activeJobs, totalApplications, newUsersToday] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.application.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    ]);

    return NextResponse.json({ totalUsers, totalJobs, activeJobs, totalApplications, newUsersToday });
  } catch (error) {
    console.error('[GET /api/admin/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

