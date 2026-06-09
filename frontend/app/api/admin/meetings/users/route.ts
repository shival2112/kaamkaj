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

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role')?.toUpperCase();

    const where = role && ['CANDIDATE', 'EMPLOYER'].includes(role)
      ? { role: role as 'CANDIDATE' | 'EMPLOYER' }
      : { role: { in: ['CANDIDATE', 'EMPLOYER'] as ('CANDIDATE' | 'EMPLOYER')[] } };

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      take: 500,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[GET /api/admin/meetings/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
