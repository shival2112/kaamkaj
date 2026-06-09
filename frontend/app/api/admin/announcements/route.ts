import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const KEYS = ['announcement_active', 'announcement_text', 'announcement_color'] as const;

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return dbUser?.role === 'ADMIN' ? user : null;
}

async function getAnnouncement() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...KEYS] } } });
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    active: map['announcement_active'] === 'true',
    text:   map['announcement_text']   ?? '',
    color:  map['announcement_color']  ?? 'blue',
  };
}

// Public read — used by AnnouncementBanner on every page
export async function GET() {
  try {
    const data = await getAnnouncement();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin only — create / replace announcement
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as { active?: boolean; text?: string; color?: string };
    await upsertAnnouncement(body, admin.id);
    return NextResponse.json(await getAnnouncement(), { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin only — partial update
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as { active?: boolean; text?: string; color?: string };
    await upsertAnnouncement(body, admin.id);
    return NextResponse.json(await getAnnouncement());
  } catch (error) {
    console.error('[PATCH /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function upsertAnnouncement(
  body: { active?: boolean; text?: string; color?: string },
  userId: string
) {
  const updates: { key: string; value: string }[] = [];
  if (body.active !== undefined)
    updates.push({ key: 'announcement_active', value: String(body.active) });
  if (body.text !== undefined)
    updates.push({ key: 'announcement_text', value: body.text });
  if (body.color !== undefined)
    updates.push({ key: 'announcement_color', value: body.color });

  await Promise.all(
    updates.map(u =>
      prisma.siteSetting.upsert({
        where: { key: u.key },
        update: { value: u.value, updatedBy: userId },
        create: { key: u.key, value: u.value, updatedBy: userId },
      })
    )
  );
}
