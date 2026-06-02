import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/mailer';
import { applicationConfirmationHtml } from '@/lib/emailTemplates/applicationConfirmation';
import { newApplicantAlertHtml } from '@/lib/emailTemplates/newApplicantAlert';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ── Resolve candidate via Supabase (email/password / OAuth) ────────────────
    let candidateId: string | null = null;
    let candidateName  = 'Candidate';
    let candidateEmail: string | null = null;

    const supabase = await createServerSupabaseClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (sbUser) {
      const role = (sbUser.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase();
      if (role !== 'CANDIDATE') {
        return NextResponse.json({ error: 'Only candidates can apply' }, { status: 403 });
      }

      let dbUser = await prisma.user.findUnique({
        where: { id: sbUser.id },
        select: { id: true, name: true, email: true },
      });
      if (!dbUser) {
        const name = (sbUser.user_metadata?.name as string) ?? sbUser.email?.split('@')[0] ?? 'Candidate';
        dbUser = await prisma.user.create({
          data: { id: sbUser.id, email: sbUser.email!, name, role: 'CANDIDATE' },
          select: { id: true, name: true, email: true },
        });
      }
      candidateId    = dbUser.id;
      candidateName  = dbUser.name;
      candidateEmail = dbUser.email;
    }

    // ── Fallback: NextAuth session (phone OTP candidates) ─────────────────────
    if (!candidateId) {
      const session = await auth();
      if (session?.user) {
        const role = (session.user.role as string ?? '').toUpperCase();
        if (role === 'EMPLOYER') {
          return NextResponse.json({ error: 'Only candidates can apply' }, { status: 403 });
        }
        const phoneUserId = session.user.id as string;
        const phone       = (session.user as { phone?: string }).phone ?? phoneUserId;
        const bridgeEmail = `${phone}@phone.kaamkaaj.internal`;
        const dbUser = await prisma.user.upsert({
          where:  { id: phoneUserId },
          update: {},
          create: { id: phoneUserId, email: bridgeEmail, name: session.user.name ?? 'Candidate', role: 'CANDIDATE' },
          select: { id: true, name: true, email: true },
        });
        candidateId    = dbUser.id;
        candidateName  = dbUser.name;
        candidateEmail = dbUser.email;
      }
    }

    if (!candidateId) {
      console.log('[apply] 401 – no session for job', params.id);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Profile completeness check ─────────────────────────────────────────────
    const resume = await prisma.resume.findUnique({
      where:  { userId: candidateId },
      select: { parsedData: true },
    });
    const profileData = resume?.parsedData as { profileCompleted?: boolean } | null;
    if (!profileData?.profileCompleted) {
      return NextResponse.json(
        { error: 'Please complete your profile before applying to jobs.', code: 'PROFILE_INCOMPLETE' },
        { status: 403 }
      );
    }

    // ── Find job ───────────────────────────────────────────────────────────────
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: {
          include: { owner: { select: { email: true, name: true } } },
        },
      },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // ── Duplicate check ────────────────────────────────────────────────────────
    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: params.id, candidateId } },
    });
    if (existing) {
      console.log('[apply] already applied – returning existing application');
      return NextResponse.json({ error: 'Already applied', application: existing }, { status: 409 });
    }

    // ── Create application ─────────────────────────────────────────────────────
    const application = await prisma.application.create({
      data: { jobId: params.id, candidateId },
    });
    console.log('[apply] created application', application.id, '| job:', params.id, '| candidate:', candidateId);

    // ── Send emails (non-blocking) ─────────────────────────────────────────────
    const applicantsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/employer/dashboard`;
    const emailTasks: Promise<unknown>[] = [];
    if (candidateEmail) {
      emailTasks.push(
        sendEmail({
          to: candidateEmail,
          subject: `Application submitted — ${job.title} at ${job.company.name}`,
          html: applicationConfirmationHtml(candidateName, job.title, job.company.name, application.appliedAt),
        })
      );
    }
    if (job.company.owner?.email) {
      emailTasks.push(
        sendEmail({
          to: job.company.owner.email,
          subject: `New applicant for ${job.title}`,
          html: newApplicantAlertHtml(candidateName, job.title, applicantsUrl),
        })
      );
    }
    Promise.all(emailTasks).catch(err => console.error('[apply] email error:', err));

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/apply]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Also check NextAuth
      const session = await auth();
      if (!session?.user?.id) return NextResponse.json({ applied: false });
      const existing = await prisma.application.findUnique({
        where: { jobId_candidateId: { jobId: params.id, candidateId: session.user.id as string } },
      });
      return NextResponse.json({ applied: !!existing });
    }
    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: params.id, candidateId: user.id } },
    });
    return NextResponse.json({ applied: !!existing });
  } catch {
    return NextResponse.json({ applied: false });
  }
}
