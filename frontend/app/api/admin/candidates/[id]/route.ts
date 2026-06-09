import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (dbUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const candidate = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        resume: { select: { fileUrl: true, parsedData: true, updatedAt: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const parsedData = candidate.resume?.parsedData as {
      skills?: string[]; headline?: string; bio?: string;
      location?: string; experienceLevel?: string;
    } | null;

    return NextResponse.json({
      candidate: {
        id:              candidate.id,
        name:            candidate.name,
        email:           candidate.email,
        phone:           candidate.phone,
        avatar:          candidate.avatar,
        resumeUrl:       candidate.resume?.fileUrl || null,
        skills:          parsedData?.skills          ?? [],
        headline:        parsedData?.headline         ?? null,
        bio:             parsedData?.bio              ?? null,
        location:        parsedData?.location         ?? null,
        experienceLevel: parsedData?.experienceLevel  ?? null,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/candidates/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
