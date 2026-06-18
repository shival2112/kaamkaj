import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';
import { sendEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const VALID_RECOMMENDATIONS = ['PASS', 'FAIL', 'HOLD', 'NO_SHOW'] as const;
type Recommendation = typeof VALID_RECOMMENDATIONS[number];

function scoreLabel(score: number) {
  return ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][score] ?? score;
}

function evaluationShareHtml(
  candidateName: string,
  jobTitle: string,
  recruiterName: string,
  data: {
    techScore: number; commScore: number; problemScore: number;
    cultureFit: number; experienceScore: number;
    recommendation: string; strengths?: string | null;
    improvements?: string | null; notes?: string | null;
  }
) {
  const avg = ((data.techScore + data.commScore + data.problemScore + data.cultureFit + data.experienceScore) / 5).toFixed(1);
  const recColor = data.recommendation === 'PASS' ? '#10B981'
    : data.recommendation === 'FAIL' ? '#EF4444'
    : '#F59E0B';

  return `
    <div style="font-family:Inter,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
      <div style="background:#5B5BD6;padding:28px 36px">
        <h1 style="color:#fff;margin:0;font-size:20px">Interview Evaluation Report</h1>
        <p style="color:#c7c7f5;margin:6px 0 0;font-size:14px">Shared by ${recruiterName}</p>
      </div>
      <div style="padding:28px 36px">
        <p style="color:#374151;font-size:15px"><strong>Candidate:</strong> ${candidateName}</p>
        <p style="color:#374151;font-size:15px"><strong>Role:</strong> ${jobTitle}</p>
        <p style="margin-top:6px">
          <span style="display:inline-block;padding:4px 14px;border-radius:999px;background:${recColor};color:#fff;font-size:14px;font-weight:600">
            ${data.recommendation}
          </span>
          <span style="margin-left:12px;color:#6B7280;font-size:13px">Overall avg: ${avg}/5</span>
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:20px">
          <thead>
            <tr style="background:#F9FAFB">
              <th style="text-align:left;padding:8px 12px;font-size:12px;color:#6B7280;border-bottom:1px solid #E5E7EB">CRITERIA</th>
              <th style="text-align:center;padding:8px 12px;font-size:12px;color:#6B7280;border-bottom:1px solid #E5E7EB">SCORE</th>
              <th style="text-align:left;padding:8px 12px;font-size:12px;color:#6B7280;border-bottom:1px solid #E5E7EB">RATING</th>
            </tr>
          </thead>
          <tbody>
            ${[
              ['Technical Skills', data.techScore],
              ['Communication', data.commScore],
              ['Problem Solving', data.problemScore],
              ['Culture Fit', data.cultureFit],
              ['Experience Relevance', data.experienceScore],
            ].map(([label, score]) => `
              <tr>
                <td style="padding:8px 12px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6">${label}</td>
                <td style="padding:8px 12px;font-size:13px;color:#374151;text-align:center;border-bottom:1px solid #F3F4F6">${score}/5</td>
                <td style="padding:8px 12px;font-size:13px;color:#6B7280;border-bottom:1px solid #F3F4F6">${scoreLabel(score as number)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${data.strengths ? `<div style="margin-top:20px"><strong style="font-size:13px;color:#374151">Strengths</strong><p style="color:#6B7280;font-size:13px;margin-top:6px">${data.strengths}</p></div>` : ''}
        ${data.improvements ? `<div style="margin-top:12px"><strong style="font-size:13px;color:#374151">Areas for Improvement</strong><p style="color:#6B7280;font-size:13px;margin-top:6px">${data.improvements}</p></div>` : ''}
        ${data.notes ? `<div style="margin-top:12px"><strong style="font-size:13px;color:#374151">Recruiter Notes</strong><p style="color:#6B7280;font-size:13px;margin-top:6px">${data.notes}</p></div>` : ''}
      </div>
    </div>
  `;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const evaluation = await prisma.interviewEvaluation.findUnique({
      where: { meetingId: params.id },
    });

    if (!evaluation) return NextResponse.json({ evaluation: null });
    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('[GET /api/recruiter/interviews/[id]/evaluate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      select: {
        id: true, scheduledBy: true,
        participant: { select: { name: true, email: true } },
        job: { select: { title: true } },
        scheduledByUser: { select: { name: true, email: true } },
      },
    });

    if (!meeting) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    if (meeting.scheduledBy !== ctx.userId) {
      return NextResponse.json({ error: 'You can only evaluate interviews you scheduled' }, { status: 403 });
    }

    const body = await request.json() as {
      techScore?: number; commScore?: number; problemScore?: number;
      cultureFit?: number; experienceScore?: number;
      recommendation?: string; strengths?: string;
      improvements?: string; notes?: string;
      sharedWithEmployer?: boolean;
    };

    const { techScore, commScore, problemScore, cultureFit, experienceScore,
            recommendation, strengths, improvements, notes, sharedWithEmployer } = body;

    const scores = [techScore, commScore, problemScore, cultureFit, experienceScore];
    if (scores.some(s => typeof s !== 'number' || s < 1 || s > 5)) {
      return NextResponse.json({ error: 'All 5 scores must be integers 1–5' }, { status: 400 });
    }
    if (!recommendation || !VALID_RECOMMENDATIONS.includes(recommendation.toUpperCase() as Recommendation)) {
      return NextResponse.json({ error: 'recommendation must be PASS, FAIL, HOLD, or NO_SHOW' }, { status: 400 });
    }

    const evaluation = await prisma.interviewEvaluation.upsert({
      where: { meetingId: params.id },
      create: {
        meetingId:         params.id,
        evaluatorId:       ctx.userId,
        techScore:         techScore!,
        commScore:         commScore!,
        problemScore:      problemScore!,
        cultureFit:        cultureFit!,
        experienceScore:   experienceScore!,
        recommendation:    recommendation.toUpperCase() as Recommendation,
        strengths:         strengths?.trim() ?? null,
        improvements:      improvements?.trim() ?? null,
        notes:             notes?.trim() ?? null,
        sharedWithEmployer: sharedWithEmployer ?? false,
      },
      update: {
        techScore:         techScore!,
        commScore:         commScore!,
        problemScore:      problemScore!,
        cultureFit:        cultureFit!,
        experienceScore:   experienceScore!,
        recommendation:    recommendation.toUpperCase() as Recommendation,
        strengths:         strengths?.trim() ?? null,
        improvements:      improvements?.trim() ?? null,
        notes:             notes?.trim() ?? null,
        sharedWithEmployer: sharedWithEmployer ?? false,
      },
    });

    // Send evaluation summary to employer when shared
    if (sharedWithEmployer) {
      const company = await prisma.company.findUnique({
        where: { id: ctx.companyId },
        select: { owner: { select: { email: true } } },
      });
      if (company?.owner?.email) {
        sendEmail({
          to: company.owner.email,
          subject: `Interview Evaluation: ${meeting.participant.name} — ${meeting.job?.title ?? 'N/A'}`,
          html: evaluationShareHtml(
            meeting.participant.name,
            meeting.job?.title ?? 'N/A',
            meeting.scheduledByUser.name,
            {
              techScore: techScore!,
              commScore: commScore!,
              problemScore: problemScore!,
              cultureFit: cultureFit!,
              experienceScore: experienceScore!,
              recommendation: recommendation.toUpperCase(),
              strengths, improvements, notes,
            }
          ),
        }).catch(err => console.error('[evaluation-share-email]', err));
      }
    }

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/recruiter/interviews/[id]/evaluate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
