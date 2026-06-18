import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const groups = await prisma.application.groupBy({
      by: ['referredBy'],
      where: { referredBy: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    if (groups.length === 0) {
      return NextResponse.json({ referrers: [], total: 0 });
    }

    const referrerIds = groups.map(g => g.referredBy!);
    const users = await prisma.user.findMany({
      where: { id: { in: referrerIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const referrers = groups.map(g => ({
      userId: g.referredBy!,
      referralCount: g._count.id,
      user: userMap.get(g.referredBy!) ?? null,
    }));

    return NextResponse.json({ referrers, total: referrers.length });
  } catch (error) {
    console.error('[GET /api/admin/referrers]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

