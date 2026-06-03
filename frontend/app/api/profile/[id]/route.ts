import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id, role: 'CANDIDATE' },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
        resume: { select: { parsedData: true, fileUrl: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const data = (user.resume?.parsedData as Record<string, unknown>) ?? {};

    // Only expose profile if it has been completed via onboarding
    const profileCompleted = (data.profileCompleted as boolean) ?? false;

    return NextResponse.json({
      id:              user.id,
      name:            user.name,
      avatar:          user.avatar ?? null,
      createdAt:       user.createdAt,
      headline:        (data.headline        as string)   ?? '',
      bio:             (data.bio             as string)   ?? '',
      location:        (data.location        as string)   ?? '',
      skills:          (data.skills          as string[]) ?? [],
      experienceLevel: (data.experienceLevel as string)   ?? 'FRESHER',
      hasResume:       !!user.resume?.fileUrl,
      profileCompleted,
    });
  } catch (error) {
    console.error('[GET /api/profile/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
