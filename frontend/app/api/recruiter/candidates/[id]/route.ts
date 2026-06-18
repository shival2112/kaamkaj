import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const candidate = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, createdAt: true, isVerified: true,
        resume: {
          select: {
            fileUrl: true, parsedData: true, createdAt: true, updatedAt: true,
          },
        },
        applications: {
          where: { job: { companyId: ctx.companyId } },
          orderBy: { appliedAt: 'desc' },
          select: {
            id: true, status: true, appliedAt: true, updatedAt: true,
            coverLetter: true, resumeUrl: true,
            employerNotes: true, rejectionReason: true, rating: true,
            assignedRecruiterId: true,
            job: { select: { id: true, title: true, type: true, location: true } },
            statusLogs: {
              orderBy: { changedAt: 'desc' },
              take: 10,
              select: { status: true, changedAt: true, changedBy: true },
            },
          },
        },
        meetingsAsParticipant: {
          orderBy: { date: 'desc' },
          take: 20,
          select: {
            id: true, round: true, date: true, time: true, mode: true,
            link: true, interviewer: true, status: true,
            feedbackOutcome: true, feedbackRating: true, feedbackNotes: true,
            scheduledByUser: { select: { id: true, name: true } },
            job: { select: { id: true, title: true } },
            evaluation: {
              select: {
                id: true, recommendation: true,
                techScore: true, commScore: true, problemScore: true,
                cultureFit: true, experienceScore: true,
                strengths: true, improvements: true,
                sharedWithEmployer: true,
              },
            },
          },
        },
        _count: { select: { applications: true, savedJobs: true } },
      },
    });

    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('[GET /api/recruiter/candidates/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
