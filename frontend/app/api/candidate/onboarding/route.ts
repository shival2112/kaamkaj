import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      name?: string;
      phone?: string;
      headline?: string;
      bio?: string;
      location?: string;
      skills?: string[];
      experienceLevel?: string;
    };

    const { name, phone, headline, bio, location, skills = [], experienceLevel } = body;

    if (!phone?.trim())    return NextResponse.json({ error: 'Phone number is required' },  { status: 400 });
    if (!headline?.trim()) return NextResponse.json({ error: 'Headline is required' },       { status: 400 });
    if (!location?.trim()) return NextResponse.json({ error: 'Location is required' },       { status: 400 });

    // 1. Update User — name and phone
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        phone: phone.trim(),
      },
    });

    // 2. Sync name into Supabase auth metadata
    if (name?.trim()) {
      await supabase.auth.updateUser({ data: { name: name.trim() } });
    }

    // 3. Upsert Resume — merge new profile fields into parsedData
    const existing = await prisma.resume.findUnique({
      where:  { userId: user.id },
      select: { parsedData: true },
    });
    const currentData = (existing?.parsedData as Record<string, unknown>) ?? {};

    await prisma.resume.upsert({
      where:  { userId: user.id },
      update: {
        parsedData: {
          ...currentData,
          headline:        headline.trim(),
          bio:             bio?.trim() ?? '',
          location:        location.trim(),
          skills:          skills.filter(Boolean),
          experienceLevel: experienceLevel ?? 'FRESHER',
          profileCompleted: true,
        },
      },
      create: {
        userId:  user.id,
        fileUrl: '',
        parsedData: {
          headline:        headline.trim(),
          bio:             bio?.trim() ?? '',
          location:        location.trim(),
          skills:          skills.filter(Boolean),
          experienceLevel: experienceLevel ?? 'FRESHER',
          profileCompleted: true,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/candidate/onboarding]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET — returns current profile completion status + prefill data
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where:  { id: user.id },
      select: { name: true, phone: true, email: true },
    });

    const resume = await prisma.resume.findUnique({
      where:  { userId: user.id },
      select: { parsedData: true },
    });

    const data = (resume?.parsedData as Record<string, unknown>) ?? {};

    return NextResponse.json({
      name:             dbUser?.name  ?? '',
      email:            dbUser?.email ?? '',
      phone:            dbUser?.phone ?? '',
      headline:         (data.headline        as string)   ?? '',
      bio:              (data.bio             as string)   ?? '',
      location:         (data.location        as string)   ?? '',
      skills:           (data.skills          as string[]) ?? [],
      experienceLevel:  (data.experienceLevel as string)   ?? 'FRESHER',
      profileCompleted: (data.profileCompleted as boolean) ?? false,
    });
  } catch (error) {
    console.error('[GET /api/candidate/onboarding]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
