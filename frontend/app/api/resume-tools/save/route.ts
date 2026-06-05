import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { resumeBuilderData?: unknown };
    if (!body.resumeBuilderData) {
      return NextResponse.json({ error: 'resumeBuilderData is required' }, { status: 400 });
    }

    // Merge resumeBuilderData into the existing parsedData without overwriting other fields
    const existing = await prisma.resume.findUnique({
      where:  { userId: user.id },
      select: { parsedData: true },
    });
    const current = (existing?.parsedData as Record<string, unknown>) ?? {};

    await prisma.resume.upsert({
      where:  { userId: user.id },
      update: { parsedData: { ...current, resumeBuilderData: body.resumeBuilderData } },
      create: { userId: user.id, fileUrl: '', parsedData: { resumeBuilderData: body.resumeBuilderData } },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/resume-tools/save]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
