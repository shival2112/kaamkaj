/**
 * POST /api/employer/bulk-message
 *
 * Sends a custom email to all shortlisted (or filtered) candidates for a job.
 *
 * Body: {
 *   jobId:   string            — required; must belong to this employer
 *   subject: string            — email subject
 *   message: string            — email body (plain text, will be wrapped in HTML)
 *   status?: ApplicationStatus — filter by status (default: SHORTLISTED)
 * }
 *
 * Returns { sent: number, skipped: number, recipients: string[] }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { sendEmail } from '@/lib/mailer';
import { ApplicationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

function buildMessageHtml(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  message: string,
): string {
  const paragraphs = message
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<p style="margin:0 0 12px">${l}</p>`)
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#111827">
      <h2 style="color:#5B5BD6;margin-bottom:4px">${companyName}</h2>
      <p style="color:#6B7280;margin-top:0">Regarding: <strong>${jobTitle}</strong></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
      <p>Hi ${candidateName},</p>
      ${paragraphs}
      <p style="margin-top:24px">Best regards,<br><strong>${companyName}</strong></p>
    </div>`;
}

export async function POST(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const body = await request.json() as {
      jobId?: string;
      subject?: string;
      message?: string;
      status?: string;
    };

    if (!body.jobId)    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    if (!body.subject?.trim()) return NextResponse.json({ error: 'subject is required' }, { status: 400 });
    if (!body.message?.trim()) return NextResponse.json({ error: 'message is required' }, { status: 400 });

    // Verify job belongs to this employer
    const job = await prisma.job.findFirst({
      where: { id: body.jobId, companyId: company.id },
      select: { id: true, title: true },
    });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const validStatuses = Object.values(ApplicationStatus) as string[];
    const statusFilter  = body.status && validStatuses.includes(body.status.toUpperCase())
      ? (body.status.toUpperCase() as ApplicationStatus)
      : 'SHORTLISTED' as ApplicationStatus;

    const applications = await prisma.application.findMany({
      where:   { jobId: body.jobId, status: statusFilter },
      include: { candidate: { select: { name: true, email: true } } },
    });

    let sent    = 0;
    let skipped = 0;
    const recipients: string[] = [];

    for (const app of applications) {
      const email = app.candidate.email;
      if (!email || email.includes('@phone.kaamkaaj.internal')) { skipped++; continue; }

      try {
        await sendEmail({
          to:      email,
          subject: body.subject!.trim(),
          html:    buildMessageHtml(app.candidate.name, job.title, company.name, body.message!.trim()),
        });
        sent++;
        recipients.push(email);
        console.log(`[bulk-message] sent to ${email} for job ${job.id}`);
      } catch (err) {
        console.error(`[bulk-message] failed for ${email}:`, err);
        skipped++;
      }
    }

    return NextResponse.json({ sent, skipped, recipients, total: applications.length });
  } catch (error) {
    console.error('[POST /api/employer/bulk-message]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
