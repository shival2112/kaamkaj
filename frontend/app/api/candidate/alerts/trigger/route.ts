/**
 * POST /api/candidate/alerts/trigger
 *
 * Matches all candidates' saved job alerts against jobs created in the
 * last N hours and sends a digest email for each candidate who has matches.
 *
 * Intended to be called from a cron-like mechanism (e.g. Vercel Cron, external
 * scheduler, or manually by an admin) rather than on every request.
 *
 * Protected by a shared secret so only authorised callers can invoke it.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface JobAlert {
  id: string;
  keywords: string;
  location: string;
}

interface MatchedJob {
  id: string;
  title: string;
  location: string;
  company: { name: string };
}

function alertMatchesJob(alert: JobAlert, job: MatchedJob): boolean {
  const kw = alert.keywords.toLowerCase().trim();
  const loc = alert.location.toLowerCase().trim();
  const titleHit = kw ? job.title.toLowerCase().includes(kw) : true;
  const locHit   = loc ? job.location.toLowerCase().includes(loc) : true;
  return titleHit && locHit;
}

function buildDigestHtml(candidateName: string, jobs: MatchedJob[], appUrl: string): string {
  const rows = jobs.map(j => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
        <a href="${appUrl}/jobs/${j.id}" style="color:#5B5BD6;font-weight:600;text-decoration:none">${j.title}</a>
        <div style="font-size:12px;color:#6B7280;margin-top:2px">${j.company.name} · ${j.location}</div>
      </td>
    </tr>`).join('');

  return `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#111827">
      <h2 style="color:#5B5BD6">New Jobs Matching Your Alerts</h2>
      <p>Hi ${candidateName}, here are <strong>${jobs.length}</strong> new job${jobs.length !== 1 ? 's' : ''} that match your saved alerts:</p>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <p style="margin-top:24px">
        <a href="${appUrl}/jobs" style="background:#5B5BD6;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Browse All Jobs
        </a>
      </p>
      <p style="font-size:12px;color:#9CA3AF;margin-top:24px">
        You're receiving this because you set up job alerts on KaamKaaj.
        <a href="${appUrl}/dashboard/alerts" style="color:#5B5BD6">Manage alerts</a>
      </p>
    </div>`;
}

export async function POST(request: Request) {
  // Verify caller secret
  const secret = request.headers.get('x-trigger-secret');
  if (secret !== process.env.ALERTS_TRIGGER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const hoursBack = Math.min(168, Math.max(1, Number(searchParams.get('hours') ?? 24)));
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  try {
    // Fetch recent active jobs
    const recentJobs = await prisma.job.findMany({
      where:   { status: JobStatus.ACTIVE, createdAt: { gte: since } },
      include: { company: { select: { name: true } } },
    }) as unknown as MatchedJob[];

    if (recentJobs.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, reason: 'No recent jobs' });
    }

    // Fetch all resumes that have jobAlerts
    const resumes = await prisma.resume.findMany({
      include: { user: { select: { name: true, email: true } } },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kaamkaaj.vercel.app';
    let sent = 0;
    let skipped = 0;

    for (const resume of resumes) {
      const data = resume.parsedData as Record<string, unknown> | null;
      const alerts = (data?.jobAlerts as JobAlert[] | undefined) ?? [];
      if (alerts.length === 0) { skipped++; continue; }

      // Check notification preference
      const notifPrefs = (data?.notifPrefs as { emailOnNewJobs?: boolean } | undefined);
      if (notifPrefs?.emailOnNewJobs === false) { skipped++; continue; }

      // Match alerts against recent jobs (deduplicate)
      const matchedIds = new Set<string>();
      const matched: MatchedJob[] = [];
      for (const alert of alerts) {
        for (const job of recentJobs) {
          if (!matchedIds.has(job.id) && alertMatchesJob(alert, job)) {
            matchedIds.add(job.id);
            matched.push(job);
          }
        }
      }

      if (matched.length === 0) { skipped++; continue; }

      const email = resume.user?.email;
      const name  = resume.user?.name ?? 'there';
      if (!email || email.includes('@phone.kaamkaaj.internal')) { skipped++; continue; }

      try {
        await sendEmail({
          to:      email,
          subject: `${matched.length} new job${matched.length !== 1 ? 's' : ''} matching your alerts — KaamKaaj`,
          html:    buildDigestHtml(name, matched, appUrl),
        });
        sent++;
        console.log(`[alerts/trigger] sent digest to ${email} — ${matched.length} jobs`);
      } catch (err) {
        console.error(`[alerts/trigger] email failed for ${email}:`, err);
        skipped++;
      }
    }

    return NextResponse.json({ sent, skipped, totalRecentJobs: recentJobs.length, windowHours: hoursBack });
  } catch (error) {
    console.error('[POST /api/candidate/alerts/trigger]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
