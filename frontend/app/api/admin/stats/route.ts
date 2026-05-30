import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, unauth: true };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return { admin: dbUser?.role === 'ADMIN' ? user : null, unauth: false };
}

export async function GET() {
  try {
    const { admin, unauth } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: unauth ? 'Unauthorized' : 'Forbidden' }, { status: unauth ? 401 : 403 });

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
