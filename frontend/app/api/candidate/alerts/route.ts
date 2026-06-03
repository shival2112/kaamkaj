import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface JobAlert {
  id: string;
  keywords: string;
  location: string;
  createdAt: string;
}

async function getResumeData(userId: string) {
  const resume = await prisma.resume.findUnique({
    where: { userId },
    select: { id: true, parsedData: true },
  });
  return resume;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resume = await getResumeData(user.id);
    const data   = (resume?.parsedData as Record<string, unknown>) ?? {};
    const alerts = (data.jobAlerts as JobAlert[]) ?? [];

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('[GET /api/candidate/alerts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { keywords?: string; location?: string };
    const keywords = body.keywords?.trim() ?? '';
    const location = body.location?.trim() ?? '';

    if (!keywords && !location) {
      return NextResponse.json({ error: 'Provide at least keywords or a location.' }, { status: 400 });
    }

    const resume = await getResumeData(user.id);
    const data   = (resume?.parsedData as Record<string, unknown>) ?? {};
    const alerts = (data.jobAlerts as JobAlert[]) ?? [];

    if (alerts.length >= 5) {
      return NextResponse.json({ error: 'Maximum 5 job alerts allowed.' }, { status: 400 });
    }

    const newAlert: JobAlert = {
      id:        crypto.randomUUID(),
      keywords,
      location,
      createdAt: new Date().toISOString(),
    };

    const updatedAlerts = [newAlert, ...alerts];

    const upsertDataPost = { ...data, jobAlerts: updatedAlerts } as unknown as Prisma.InputJsonValue;
    await prisma.resume.upsert({
      where:  { userId: user.id },
      update: { parsedData: upsertDataPost },
      create: { userId: user.id, fileUrl: '', parsedData: upsertDataPost },
    });

    return NextResponse.json({ alert: newAlert }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/candidate/alerts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    if (!alertId) return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });

    const resume = await getResumeData(user.id);
    const data   = (resume?.parsedData as Record<string, unknown>) ?? {};
    const alerts = ((data.jobAlerts as JobAlert[]) ?? []).filter(a => a.id !== alertId);

    const upsertDataDel = { ...data, jobAlerts: alerts } as unknown as Prisma.InputJsonValue;
    await prisma.resume.upsert({
      where:  { userId: user.id },
      update: { parsedData: upsertDataDel },
      create: { userId: user.id, fileUrl: '', parsedData: upsertDataDel },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/candidate/alerts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
