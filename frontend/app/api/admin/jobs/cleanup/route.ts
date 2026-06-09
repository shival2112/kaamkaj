import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return dbUser?.role === 'ADMIN' ? user : null;
}

export async function POST() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Close ACTIVE jobs with no applications that haven't been updated in 90+ days
    const stale = await prisma.job.findMany({
      where: {
        status:       'ACTIVE',
        updatedAt:    { lt: cutoff },
        applications: { none: {} },
      },
      select: { id: true },
    });

    if (stale.length === 0) {
      return NextResponse.json({ closed: 0 });
    }

    const ids = stale.map(j => j.id);
    const result = await prisma.job.updateMany({
      where:  { id: { in: ids } },
      data:   { status: 'CLOSED' },
    });

    return NextResponse.json({ closed: result.count });
  } catch (error) {
    console.error('[POST /api/admin/jobs/cleanup]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
