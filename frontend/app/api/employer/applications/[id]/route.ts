import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { ApplicationStatus } from '@prisma/client';
import { sendEmail } from '@/lib/mailer';
import { applicationStatusUpdateHtml } from '@/lib/emailTemplates/applicationStatusUpdate';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    // Verify this application belongs to one of this employer's jobs
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job:       { select: { companyId: true, title: true } },
        candidate: { select: { email: true, name: true } },
      },
    });
    if (!application || application.job.companyId !== company.id) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json() as { status?: string; notes?: string; rating?: number; rejectionReason?: string };

    if (!body.status && body.notes === undefined && body.rating === undefined && body.rejectionReason === undefined) {
      return NextResponse.json({ error: 'Provide status, notes, rating, or rejectionReason' }, { status: 400 });
    }

    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating))) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }

    if (body.status) {
      const validStatuses = Object.values(ApplicationStatus) as string[];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status as ApplicationStatus }),
        ...(body.notes !== undefined && { employerNotes: body.notes }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.rejectionReason !== undefined && { rejectionReason: body.rejectionReason || null }),
      },
    });

    // Append to status history whenever status changes
    if (body.status) {
      prisma.applicationStatusLog.create({
        data: {
          applicationId: params.id,
          status:        body.status as ApplicationStatus,
          changedBy:     userId,
        },
      }).catch(err => console.error('[status-log] failed to create log:', err));
    }

    const what = body.status ? `status → ${body.status}` : body.rating !== undefined ? `rating → ${body.rating}` : 'notes updated';
    console.log('[PATCH /api/employer/applications/:id] updated application', params.id, what);

    // Notify candidate on meaningful status changes
    const notifyStatuses: string[] = ['SHORTLISTED', 'REJECTED'];
    if (body.status && notifyStatuses.includes(body.status) && application.candidate?.email) {
      sendEmail({
        to: application.candidate.email,
        subject: `Update on your application — ${application.job.title}`,
        html: applicationStatusUpdateHtml(
          application.candidate.name,
          application.job.title,
          company.name,
          body.status,
        ),
      }).catch(err => console.error('[application status update] email failed:', err));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/employer/applications/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
