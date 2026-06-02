import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employerUserId = await resolveEmployerUserId();
    if (!employerUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify candidate exists
    const candidate = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id:     true,
        name:   true,
        email:  true,
        avatar: true,
        phone:  true,
        resume: {
          select: {
            fileUrl:    true,
            parsedData: true,
            updatedAt:  true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Only return applications to this employer's jobs (data isolation)
    const company = await prisma.company.findUnique({
      where: { ownerId: employerUserId },
      select: { id: true },
    });

    const applications = company
      ? await prisma.application.findMany({
          where: {
            candidateId: params.id,
            job: { companyId: company.id },
          },
          select: {
            id:        true,
            status:    true,
            appliedAt: true,
            job:       { select: { id: true, title: true } },
          },
          orderBy: { appliedAt: 'desc' },
        })
      : [];

    // Extract all onboarding fields from resume parsedData
    const parsedData = candidate.resume?.parsedData as {
      skills?: string[];
      headline?: string;
      bio?: string;
      location?: string;
      experienceLevel?: string;
    } | null;

    return NextResponse.json({
      id:              candidate.id,
      name:            candidate.name,
      email:           candidate.email,
      avatar:          candidate.avatar,
      phone:           candidate.phone,
      resumeUrl:       candidate.resume?.fileUrl && candidate.resume.fileUrl !== ''
                         ? candidate.resume.fileUrl
                         : null,
      skills:          parsedData?.skills          ?? [],
      headline:        parsedData?.headline         ?? null,
      bio:             parsedData?.bio              ?? null,
      location:        parsedData?.location         ?? null,
      experienceLevel: parsedData?.experienceLevel  ?? null,
      applications,
    });
  } catch (error) {
    console.error('[GET /api/employer/candidates/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
