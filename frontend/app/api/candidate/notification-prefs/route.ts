import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export interface NotifPrefs {
  emailOnStatusChange: boolean;
  emailOnInterview:    boolean;
  emailOnNewJobs:      boolean;
}

const DEFAULTS: NotifPrefs = {
  emailOnStatusChange: true,
  emailOnInterview:    true,
  emailOnNewJobs:      false,
};

type ParsedData = { notifPrefs?: Partial<NotifPrefs>; [key: string]: unknown };

async function resolveUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await resolveUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resume = await prisma.resume.findUnique({
    where: { userId: user.id },
    select: { parsedData: true },
  });

  const stored = (resume?.parsedData as ParsedData)?.notifPrefs ?? {};
  const prefs: NotifPrefs = { ...DEFAULTS, ...stored };
  return NextResponse.json({ prefs });
}

export async function PATCH(request: Request) {
  const user = await resolveUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Partial<NotifPrefs>;
  const allowed: (keyof NotifPrefs)[] = ['emailOnStatusChange', 'emailOnInterview', 'emailOnNewJobs'];
  const update: Partial<NotifPrefs> = {};
  for (const key of allowed) {
    if (typeof body[key] === 'boolean') update[key] = body[key];
  }

  const resume = await prisma.resume.findUnique({ where: { userId: user.id } });
  const existing = (resume?.parsedData as ParsedData) ?? {};
  const merged = { ...existing, notifPrefs: { ...(existing.notifPrefs ?? {}), ...update } };

  if (resume) {
    await prisma.resume.update({ where: { userId: user.id }, data: { parsedData: merged } });
  } else {
    await prisma.resume.create({ data: { userId: user.id, fileUrl: '', parsedData: merged } });
  }

  return NextResponse.json({ prefs: { ...DEFAULTS, ...(merged.notifPrefs as Partial<NotifPrefs>) } });
}
