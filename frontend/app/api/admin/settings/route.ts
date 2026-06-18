import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const DEFAULTS: Record<string, string> = {
  announcement_active:       'false',
  announcement_text:         '',
  announcement_color:        'blue',
  hero_tagline:              '',
  platform_notice:           '',
  maintenance_mode:          'false',
  max_applications_per_day:  '10',
};


// GET — public: any page can read settings for rendering
export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[GET /api/admin/settings]', error);
    return NextResponse.json(DEFAULTS);
  }
}

// PATCH — admin only: upsert one or more settings
export async function PATCH(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as Record<string, string>;
    const allowed = new Set(Object.keys(DEFAULTS));

    const ops = Object.entries(body)
      .filter(([k]) => allowed.has(k))
      .map(([key, value]) =>
        prisma.siteSetting.upsert({
          where:  { key },
          create: { key, value, updatedBy: admin.id },
          update: { value, updatedBy: admin.id },
        }),
      );

    await Promise.all(ops);

    const rows = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[PATCH /api/admin/settings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
