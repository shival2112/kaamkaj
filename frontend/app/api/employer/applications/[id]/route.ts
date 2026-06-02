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

    const body = await request.json() as { status: string };
    const validStatuses = Object.values(ApplicationStatus) as string[];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status: body.status as ApplicationStatus },
    });
    console.log('[PATCH /api/employer/applications/:id] status →', body.status, 'for application', params.id);

    // Notify candidate on meaningful status changes
    const notifyStatuses: string[] = ['SHORTLISTED', 'REJECTED'];
    if (notifyStatuses.includes(body.status) && application.candidate?.email) {
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
