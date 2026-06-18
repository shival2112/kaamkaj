import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';
import { sendEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'] as const;
type AppStatus = typeof VALID_STATUSES[number];

function hireConfirmationHtml(candidateName: string, jobTitle: string, companyName: string) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
      <div style="background:#5B5BD6;padding:32px 40px">
        <h1 style="color:#fff;margin:0;font-size:22px">Congratulations, ${candidateName}!</h1>
      </div>
      <div style="padding:32px 40px">
        <p style="color:#374151;font-size:16px;line-height:1.6">
          We are thrilled to inform you that you have been <strong>selected</strong> for the position of
          <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
        </p>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          Our HR team will be in touch shortly with the offer letter and next steps.
          We look forward to having you on board!
        </p>
        <p style="color:#6B7280;font-size:14px;margin-top:32px">
          — The ${companyName} Hiring Team via KaamKaaj
        </p>
      </div>
    </div>
  `;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const app = await prisma.application.findUnique({
      where: { id: params.id },
      select: {
        id: true, status: true,
        job: { select: { title: true, companyId: true, company: { select: { name: true } } } },
        candidate: { select: { id: true, name: true, email: true } },
      },
    });

    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (app.job.companyId !== ctx.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as {
      status?: string;
      assignToSelf?: boolean;
      notes?: string;
    };

    const updateData: Record<string, unknown> = {};

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status.toUpperCase() as AppStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = body.status.toUpperCase();
    }

    if (body.assignToSelf === true)  updateData.assignedRecruiterId = ctx.userId;
    if (body.assignToSelf === false) updateData.assignedRecruiterId = null;
    if (body.notes !== undefined)    updateData.employerNotes = body.notes;

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log status change
    if (body.status) {
      await prisma.applicationStatusLog.create({
        data: {
          applicationId: params.id,
          status: updated.status,
          changedBy: ctx.userId,
        },
      });
    }

    // Send hire confirmation email to candidate
    if (body.status?.toUpperCase() === 'HIRED') {
      sendEmail({
        to: app.candidate.email,
        subject: `Congratulations! You've been hired at ${app.job.company.name}`,
        html: hireConfirmationHtml(
          app.candidate.name,
          app.job.title,
          app.job.company.name,
        ),
      }).catch(err => console.error('[hire-email]', err));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/recruiter/applications/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
