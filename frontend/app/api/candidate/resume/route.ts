import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
      select: { id: true, fileUrl: true, parsedData: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('[GET /api/candidate/resume]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { fileUrl?: string };
    if (!body.fileUrl || typeof body.fileUrl !== 'string') {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    // Must be an https URL on our own Supabase Storage origin — rejects
    // javascript:/data: URIs and arbitrary cross-origin links from being stored
    // and later rendered as a raw <a href> on the candidate's own profile page.
    const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let isValidUrl = false;
    try {
      const parsed = new URL(body.fileUrl);
      isValidUrl = parsed.protocol === 'https:' && (!supabaseOrigin || parsed.origin === new URL(supabaseOrigin).origin);
    } catch {
      isValidUrl = false;
    }
    if (!isValidUrl) {
      return NextResponse.json({ error: 'fileUrl must be a valid https URL on the storage origin' }, { status: 400 });
    }

    const resume = await prisma.resume.upsert({
      where: { userId: user.id },
      update: { fileUrl: body.fileUrl },
      create: { userId: user.id, fileUrl: body.fileUrl },
      select: { id: true, fileUrl: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ resume }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/candidate/resume]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { skills?: string[] };
    if (!Array.isArray(body.skills)) {
      return NextResponse.json({ error: 'skills must be an array' }, { status: 400 });
    }

    const existing = await prisma.resume.findUnique({
      where: { userId: user.id },
      select: { parsedData: true },
    });
    const currentData = (existing?.parsedData as Record<string, unknown>) ?? {};

    const resume = await prisma.resume.upsert({
      where: { userId: user.id },
      update: { parsedData: { ...currentData, skills: body.skills } },
      create: { userId: user.id, fileUrl: '', parsedData: { skills: body.skills } },
      select: { id: true, parsedData: true },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('[PATCH /api/candidate/resume]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.resume.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/candidate/resume]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
