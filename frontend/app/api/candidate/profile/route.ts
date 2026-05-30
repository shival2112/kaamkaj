import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, createdAt: true },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) {
    console.error('[GET /api/candidate/profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { name?: string; phone?: string };
    const { name, phone } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name  !== undefined && { name:  name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() || null }),
      },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
    });

    // Sync name into Supabase auth metadata so Navbar shows the updated name
    if (name !== undefined) {
      await supabase.auth.updateUser({ data: { name: name.trim() } });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/candidate/profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
