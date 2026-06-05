import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (dbUser?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admin accounts cannot be self-deleted' }, { status: 403 });
    }

    // Delete from Prisma (cascades applications, saved jobs, resume, company if employer)
    await prisma.user.delete({ where: { id: user.id } });
    // Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/candidate/account]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
