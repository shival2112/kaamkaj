'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Phone, Mail, Calendar,
  CheckCircle, XCircle, Clock, Star, ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusLog { status: string; changedAt: string; changedBy: string }
interface EvalDetail {
  id: string; recommendation: string;
  techScore: number; commScore: number; problemScore: number;
  cultureFit: number; experienceScore: number;
  strengths: string | null; improvements: string | null;
  sharedWithEmployer: boolean;
}
interface Interview {
  id: string; round: string; date: string; time: string;
  mode: string; link: string | null; interviewer: string; status: string;
  feedbackOutcome: string | null; feedbackRating: number | null; feedbackNotes: string | null;
  scheduledByUser: { id: string; name: string };
  job: { id: string; title: string } | null;
  evaluation: EvalDetail | null;
}
interface Application {
  id: string; status: string; appliedAt: string; updatedAt: string;
  coverLetter: string | null; resumeUrl: string | null;
  employerNotes: string | null; rejectionReason: string | null;
  rating: number | null; assignedRecruiterId: string | null;
  job: { id: string; title: string; type: string; location: string };
  statusLogs: StatusLog[];
}
interface Candidate {
  id: string; name: string; email: string; phone: string | null;
  avatar: string | null; createdAt: string; isVerified: boolean;
  resume: { fileUrl: string; parsedData: Record<string, unknown> | null; createdAt: string } | null;
  applications: Application[];
  meetingsAsParticipant: Interview[];
  _count: { applications: number; savedJobs: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700',
  REVIEWING:   'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  HIRED:       'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
};

const REC_COLORS: Record<string, string> = {
  PASS:    'bg-green-100 text-green-700',
  FAIL:    'bg-red-100 text-red-700',
  HOLD:    'bg-yellow-100 text-yellow-700',
  NO_SHOW: 'bg-gray-100 text-gray-500',
};

const CRITERIA_LABELS = [
  ['techScore', 'Technical'], ['commScore', 'Communication'],
  ['problemScore', 'Problem Solving'], ['cultureFit', 'Culture Fit'],
  ['experienceScore', 'Experience'],
] as const;

function StarRow({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-200'}`} />
      ))}
      <span className="ml-1 text-xs text-gray-500">{value}/5</span>
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {app.status.charAt(0)+app.status.slice(1).toLowerCase()}
          </span>
          <span className="font-medium text-gray-900">{app.job.title}</span>
          <span className="hidden text-xs text-gray-400 sm:inline">{app.job.location} · {app.job.type.replace('_',' ')}</span>
        </div>
        <div className="flex items-center gap-3">
          {app.rating !== null && (
            <span className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`h-3 w-3 ${n <= app.rating! ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-200'}`} />
              ))}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          {app.coverLetter && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Cover Letter</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.coverLetter}</p>
            </div>
          )}
          {app.employerNotes && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Recruiter Notes</p>
              <p className="text-sm text-gray-700">{app.employerNotes}</p>
            </div>
          )}
          {app.rejectionReason && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Rejection Reason</p>
              <p className="text-sm text-red-600">{app.rejectionReason}</p>
            </div>
          )}
          {app.resumeUrl && (
            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-primary/40 hover:text-primary transition-colors">
              <FileText className="h-3.5 w-3.5" /> View Resume
            </a>
          )}
          {app.statusLogs.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Status History</p>
              <div className="space-y-1">
                {app.statusLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[log.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {log.status.charAt(0)+log.status.slice(1).toLowerCase()}
                    </span>
                    <span>{new Date(log.changedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const [open, setOpen] = useState(false);
  const ev = interview.evaluation;
  const avgScore = ev
    ? ((ev.techScore+ev.commScore+ev.problemScore+ev.cultureFit+ev.experienceScore)/5).toFixed(1)
    : null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {interview.status === 'scheduled'
            ? <Clock className="h-4 w-4 text-blue-500" />
            : ev?.recommendation === 'PASS' || interview.feedbackOutcome === 'PASS'
            ? <CheckCircle className="h-4 w-4 text-green-500" />
            : <XCircle className="h-4 w-4 text-red-500" />}
          <span className="font-medium text-gray-900">{interview.round}</span>
          {interview.job && <span className="hidden text-xs text-gray-400 sm:inline">{interview.job.title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {ev && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${REC_COLORS[ev.recommendation] ?? 'bg-gray-100 text-gray-500'}`}>
              {ev.recommendation}
            </span>
          )}
          <span className="text-xs text-gray-400">{interview.date}</span>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><span className="text-xs text-gray-400">Time</span><p className="font-medium text-gray-800">{interview.time}</p></div>
            <div><span className="text-xs text-gray-400">Mode</span><p className="font-medium text-gray-800">{interview.mode}</p></div>
            <div><span className="text-xs text-gray-400">Interviewer</span><p className="font-medium text-gray-800">{interview.interviewer}</p></div>
            <div><span className="text-xs text-gray-400">Scheduled by</span><p className="font-medium text-gray-800">{interview.scheduledByUser.name}</p></div>
          </div>

          {interview.link && (
            <a href={interview.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors">
              Join Meeting →
            </a>
          )}

          {ev ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Evaluation Scores</p>
              <div className="space-y-1.5">
                {CRITERIA_LABELS.map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{label}</span>
                    <StarRow value={ev[key]} />
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-xs font-semibold text-gray-700">Average</span>
                  <span className="text-sm font-bold text-primary">{avgScore}/5</span>
                </div>
              </div>
              {ev.strengths && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Strengths</p>
                  <p className="text-sm text-gray-700">{ev.strengths}</p>
                </div>
              )}
              {ev.improvements && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Areas for Improvement</p>
                  <p className="text-sm text-gray-700">{ev.improvements}</p>
                </div>
              )}
            </div>
          ) : interview.status === 'scheduled' ? (
            <Link href={`/recruiter/interviews/${interview.id}/evaluate`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors">
              Fill Evaluation Form
            </Link>
          ) : null}

          {interview.feedbackNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Feedback Notes</p>
              <p className="text-sm text-gray-700">{interview.feedbackNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecruiterCandidatePage() {
  const { id }    = useParams<{ id: string }>();
  const [data,    setData]    = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`/api/recruiter/candidates/${id}`)
      .then(r => r.json())
      .then((d: { candidate?: Candidate; error?: string }) => {
        if (d.error) setError(d.error); else setData(d.candidate ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const parsedData   = data?.resume?.parsedData as { skills?: string[]; experience?: string[]; education?: string[] } | null;
  const skills       = parsedData?.skills       ?? [];
  const experience   = parsedData?.experience   ?? [];
  const education    = parsedData?.education    ?? [];

  return (
    <RecruiterShell>
      <div className="p-6">
        <Link href="/recruiter/applications"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Candidates
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
        ) : data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ── Left column — profile ── */}
            <div className="space-y-4 lg:col-span-1">
              {/* Identity card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {data.name[0]?.toUpperCase()}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-gray-900">{data.name}</h2>
                  {data.isVerified && (
                    <span className="mt-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Verified</span>
                  )}
                </div>

                <div className="mt-5 space-y-2.5">
                  <a href={`mailto:${data.email}`}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{data.email}</span>
                  </a>
                  {data.phone && (
                    <a href={`tel:${data.phone}`}
                      className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                      {data.phone}
                    </a>
                  )}
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                    Joined {new Date(data.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {data.resume?.fileUrl && (
                  <a href={data.resume.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary transition-colors">
                    <FileText className="h-4 w-4" /> View Resume
                  </a>
                )}
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Applications', value: data._count.applications },
                  { label: 'Saved Jobs',   value: data._count.savedJobs },
                  { label: 'Interviews',   value: data.meetingsAsParticipant.length },
                  { label: 'For Your Co.', value: data.applications.length },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s: string) => (
                      <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Experience</p>
                  <ul className="space-y-1">
                    {experience.map((e: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Education</p>
                  <ul className="space-y-1">
                    {education.map((e: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Right column — applications + interviews ── */}
            <div className="space-y-6 lg:col-span-2">
              <Section title={`Applications (${data.applications.length})`}>
                {data.applications.length === 0 ? (
                  <p className="text-sm text-gray-400">No applications for your company&apos;s jobs yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.applications.map(app => <ApplicationCard key={app.id} app={app} />)}
                  </div>
                )}
              </Section>

              <Section title={`Interview History (${data.meetingsAsParticipant.length})`}>
                {data.meetingsAsParticipant.length === 0 ? (
                  <p className="text-sm text-gray-400">No interviews scheduled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.meetingsAsParticipant.map(inv => <InterviewCard key={inv.id} interview={inv} />)}
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
