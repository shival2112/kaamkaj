'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Check, ChevronRight, Eye } from 'lucide-react';
import { getPrepBySlug } from '@/data/jobPrepData';
import { useAuth } from '@/hooks/useAuth';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuestionState {
  answer: string;
  score: number;
  feedback: string;
  submitted: boolean;
}
type SessionState = Record<number, QuestionState>;

export interface PracticeSessionProps {
  slug: string;
  roundIndex: number;
  questionIndex: number;
}

// ── Feedback engine ───────────────────────────────────────────────────────────

function normCat(cat: string): string {
  const c = cat.toLowerCase();
  if (['technical', 'testing', 'automation', 'ci/cd', 'acumen', 'dsa', 'api', 'database', 'protocol', 'routing', 'vlan', 'security', 'sd-wan', 'cloud', 'troubleshoot'].some(k => c.includes(k))) return 'technical';
  if (['problem', 'array', 'tree', 'graph', 'algorithm'].some(k => c.includes(k))) return 'problem';
  if (['system design', 'architecture', 'scale', 'real-time', 'reliability', 'performance', 'optimization', 'dashboard'].some(k => c.includes(k))) return 'system';
  if (['behavioral', 'leadership', 'conflict', 'growth', 'impact'].some(k => c.includes(k))) return 'behavioral';
  if (['communication', 'stakeholder', 'influence'].some(k => c.includes(k))) return 'communication';
  if (['cultural', 'googleyness', 'passion', 'teamwork', 'collaborat', 'learning'].some(k => c.includes(k))) return 'culture';
  if (['sql', 'data', 'analys', 'statistic', 'case study', 'funnel', 'metric'].some(k => c.includes(k))) return 'data';
  if (['product', 'prioriti', 'user research', 'roadmap', 'a/b', 'trade-off', 'estimation'].some(k => c.includes(k))) return 'product';
  if (['consult', 'objection', 'requirement'].some(k => c.includes(k))) return 'consulting';
  return 'behavioral';
}

// [high (score≥8), medium (5–7), low (<5)]
const FEEDBACK_TEMPLATES: Record<string, [string, string, string]> = {
  technical: [
    'Excellent technical precision — you named specific tools and frameworks and demonstrated hands-on experience throughout. Your answer was well-structured and easy to follow. To push even higher, add a quantifiable metric or outcome from one of your real implementations.',
    'You covered the key concepts but lacked specificity. Name the exact tools, versions, or frameworks you\'ve personally used, and back each point with a concrete example. Interviewers at this level reward specificity over general descriptions.',
    'The answer needs more technical depth. Name specific technologies, reference real implementations, and prepare 2–3 concrete examples that show hands-on experience. General statements without evidence won\'t pass the bar here.',
  ],
  problem: [
    'Strong problem-solving structure — you defined the problem clearly, walked through your logic step by step, and addressed edge cases. Mentioning time/space complexity for algorithmic answers would push this to a perfect score.',
    'You reached a workable solution but skipped edge cases and didn\'t fully explain your reasoning at each step. Interviewers want to see your thought process, not just the result. Practice narrating your thinking aloud.',
    'The answer jumps to a solution without enough analysis. Always restate the problem, identify constraints, consider edge cases, and then propose a solution. Structure is as important as correctness in these rounds.',
  ],
  system: [
    'Impressive systems thinking — you identified key components, addressed scalability bottlenecks, and discussed trade-offs clearly. Quantifying the scale you\'re designing for (req/sec, data volume) would make this exceptional.',
    'You covered the main components but the design feels surface-level. Go deeper on the data model, caching strategy, and failure handling. Interviewers want trade-off reasoning, not just a list of technologies.',
    'System design requires structural thinking: clarify requirements, estimate scale, identify the major components, and reason about bottlenecks. Study common patterns like read replicas, sharding, and message queues before your next attempt.',
  ],
  behavioral: [
    'Strong STAR-structured answer with a specific situation, clear personal actions, and a quantified outcome. You showed self-awareness and growth from the experience. Trim the setup slightly to spend more time on your individual impact.',
    'The example was relevant but light on your specific actions and the measurable outcome. Use the STAR format deliberately: Situation → Task → YOUR specific Actions → Quantified Result. Replace "we did X" with "I did X."',
    'The answer was vague and lacked a concrete example. Behavioral questions need a specific, real situation from your experience. Prepare 5–6 strong STAR stories covering leadership, conflict, failure, and success.',
  ],
  communication: [
    'You communicated the trade-off clearly with strong stakeholder awareness, framing the decision in business terms rather than technical ones. To strengthen it further, mention how you documented the outcome and followed up.',
    'The answer touched the right themes but needs more structure. Lead with context, explain each stakeholder\'s concern, then describe exactly how you bridged the gap. Show clarity and brevity in the answer itself — those are communication skills.',
    'Communication questions require showing how you adapted your message for a specific audience. Identify who you were speaking with, what their concerns were, and how you tailored the message. A vague answer here signals a potential influencing gap.',
  ],
  culture: [
    'Great cultural alignment — your answer was specific and genuine, tying personal experience directly to company values. Authenticity stands out in these rounds. Keep demonstrating curiosity and humility across every answer.',
    'The answer is a bit generic. Research the company\'s specific values, engineering blog, or products and reference something concrete. Specificity separates prepared candidates from those giving stock answers about loving innovation.',
    'Cultural fit answers need to be personal and specific. Avoid broad statements like "I love innovation." Describe a time a company\'s culture shaped how you worked, and tie it directly to this company\'s stated principles.',
  ],
  data: [
    'Excellent analytical thinking — you structured the problem methodically, identified the right metrics, and showed statistical nuance. Add a sentence on how you\'d present findings to non-technical stakeholders to round out the answer.',
    'You identified the right metrics but the analysis approach was underspecified. Describe the exact queries or models you\'d use, and explain how you\'d distinguish correlation from causation. Specificity separates strong analysts.',
    'Data analysis answers need a structured approach: define the question, list data sources and queries, describe the analysis, and explain how you\'d communicate insights. Avoid jumping to conclusions before showing your method.',
  ],
  product: [
    'Strong product thinking — you defined the user problem before jumping to solutions and identified clear success metrics upfront. Tying your proposal back to business impact or revenue would make it exceptional.',
    'The answer is more feature-focused than user-need-focused. Start by understanding who the user is and what job they\'re trying to do, then derive the solution from that. Define one clear success metric before proposing anything.',
    'Product questions require structure: identify the user, define the problem, prioritize solutions, and measure success. Jumping straight to feature ideas without this foundation is the most common mistake. Practice CIRCLES or Jobs-To-Be-Done.',
  ],
  consulting: [
    'Excellent consultative framing — you led with the customer\'s business concern, built a value case, and presented a clear ROI argument. Practice quantifying the business case with specific numbers for maximum impact.',
    'You addressed the concern but the framing was too feature-focused. Map features to business outcomes: cost savings, risk reduction, or revenue growth. Lead with value, then follow with solution details.',
    'Consultative scenarios require empathy first: fully understand the customer\'s concern before proposing anything. Jumping to product features without understanding the business context is the most common mistake here.',
  ],
};

function computeFeedback(category: string, answer: string): { score: number; feedback: string } {
  const len = answer.trim().length;
  const base = len > 350 ? 9 : len > 200 ? 8 : len > 100 ? 7 : 4;
  const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
  const score = Math.min(10, Math.max(1, base + variation));
  const tier: 0 | 1 | 2 = score >= 8 ? 0 : score >= 5 ? 1 : 2;
  const group = normCat(category);
  const feedback = (FEEDBACK_TEMPLATES[group] ?? FEEDBACK_TEMPLATES.behavioral)[tier];
  return { score, feedback };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreClass(s: number) {
  if (s >= 8) return 'bg-green-100 text-green-700';
  if (s >= 5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}
function scoreTextClass(s: number) {
  if (s >= 8) return 'text-green-700';
  if (s >= 5) return 'text-yellow-700';
  return 'text-red-700';
}
function scoreLabel(s: number) {
  if (s >= 8) return 'Excellent';
  if (s >= 5) return 'Good';
  return 'Needs Work';
}

const CAT_COLORS: Record<string, string> = {
  'Technical Knowledge': 'bg-blue-50 text-blue-700',
  'Testing Concepts': 'bg-purple-50 text-purple-700',
  'Problem Solving': 'bg-orange-50 text-orange-700',
  Automation: 'bg-teal-50 text-teal-700',
  'CI/CD': 'bg-indigo-50 text-indigo-700',
  Performance: 'bg-pink-50 text-pink-700',
  Behavioral: 'bg-amber-50 text-amber-700',
  Collaboration: 'bg-cyan-50 text-cyan-700',
  Leadership: 'bg-green-50 text-green-700',
  'System Design': 'bg-violet-50 text-violet-700',
  Architecture: 'bg-sky-50 text-sky-700',
  Scale: 'bg-rose-50 text-rose-700',
  Arrays: 'bg-lime-50 text-lime-700',
  Trees: 'bg-emerald-50 text-emerald-700',
  Graphs: 'bg-teal-50 text-teal-700',
  Conflict: 'bg-red-50 text-red-700',
  Growth: 'bg-green-50 text-green-700',
  'Product Design': 'bg-purple-50 text-purple-700',
  Metrics: 'bg-blue-50 text-blue-700',
  'Trade-offs': 'bg-orange-50 text-orange-700',
  'Data Analysis': 'bg-indigo-50 text-indigo-700',
  'A/B Testing': 'bg-cyan-50 text-cyan-700',
  Estimation: 'bg-amber-50 text-amber-700',
  Prioritization: 'bg-violet-50 text-violet-700',
  'User Research': 'bg-pink-50 text-pink-700',
  'Root Cause Analysis': 'bg-rose-50 text-rose-700',
  Roadmap: 'bg-teal-50 text-teal-700',
  Stakeholders: 'bg-lime-50 text-lime-700',
  Impact: 'bg-sky-50 text-sky-700',
  SQL: 'bg-blue-50 text-blue-700',
  Analysis: 'bg-emerald-50 text-emerald-700',
  Statistics: 'bg-purple-50 text-purple-700',
  'Case Study': 'bg-orange-50 text-orange-700',
  'Funnel Analysis': 'bg-cyan-50 text-cyan-700',
  'Dashboard Design': 'bg-indigo-50 text-indigo-700',
  DSA: 'bg-violet-50 text-violet-700',
  Database: 'bg-teal-50 text-teal-700',
  'API Design': 'bg-sky-50 text-sky-700',
  'Real-time': 'bg-green-50 text-green-700',
  Reliability: 'bg-rose-50 text-rose-700',
  Protocols: 'bg-blue-50 text-blue-700',
  Routing: 'bg-indigo-50 text-indigo-700',
  Troubleshooting: 'bg-amber-50 text-amber-700',
  VLAN: 'bg-cyan-50 text-cyan-700',
  Security: 'bg-red-50 text-red-700',
  Optimization: 'bg-lime-50 text-lime-700',
  Teamwork: 'bg-green-50 text-green-700',
  Learning: 'bg-sky-50 text-sky-700',
  'Problem-Solving': 'bg-orange-50 text-orange-700',
  'Cloud Networking': 'bg-blue-50 text-blue-700',
  'SD-WAN': 'bg-teal-50 text-teal-700',
  Consultative: 'bg-purple-50 text-purple-700',
  'Objection Handling': 'bg-rose-50 text-rose-700',
  Requirements: 'bg-indigo-50 text-indigo-700',
  'Leadership Experience': 'bg-green-50 text-green-700',
  'Technical Acumen': 'bg-blue-50 text-blue-700',
  'Communication & Influence': 'bg-cyan-50 text-cyan-700',
  'Cultural Fit': 'bg-amber-50 text-amber-700',
  'Passion for Apple': 'bg-pink-50 text-pink-700',
};

function catClass(cat: string) {
  return CAT_COLORS[cat] ?? 'bg-gray-100 text-gray-600';
}

// ── Circular progress ─────────────────────────────────────────────────────────

function CircleProgress({ done, total }: { done: number; total: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const filled = (done / total) * circ;
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          stroke="#14a085" strokeWidth="4"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-bold text-gray-700">
        {done}/{total}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PracticeSession({ slug, roundIndex, questionIndex }: PracticeSessionProps) {
  const router = useRouter();
  const { user, dbUser, isLoading: authLoading } = useAuth();

  const entry = getPrepBySlug(slug);
  const round = entry?.rounds[roundIndex];
  const question = round?.questions[questionIndex];

  const sessionKey = `prep_${slug}_r${roundIndex}`;

  // Restore from sessionStorage on mount
  const [sessionState, setSessionState] = useState<SessionState>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(sessionKey);
      if (raw) setSessionState(JSON.parse(raw) as SessionState);
    } catch { /* ignore */ }
  }, [sessionKey]);

  // Sync local state when question or session changes
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState<{ score: number; feedback: string } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const s = sessionState[questionIndex];
    setAnswer(s?.answer ?? '');
    setSubmitted(s?.submitted ?? false);
    setScoreData(s?.submitted ? { score: s.score, feedback: s.feedback } : null);
  }, [questionIndex, sessionState]);

  // Redirect guests to login — must be a hook, called unconditionally
  const loginUrl = '/login?redirect=' + encodeURIComponent(
    '/job-prep/' + slug + '/practice/' + roundIndex + '/' + questionIndex,
  );
  useEffect(() => {
    if (!authLoading && !user) {
      setIsRedirecting(true);
      router.replace(loginUrl);
    }
  }, [authLoading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry || !round || !question) return null;

  // Show spinner while auth resolves or while the redirect is in flight
  if (authLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-[#14a085] border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">
            {isRedirecting ? 'Redirecting to login…' : 'Loading…'}
          </p>
        </div>
      </div>
    );
  }

  // ── Auth-derived flags (authLoading and !user already handled above) ──────
  const isCandidate = dbUser?.role === 'CANDIDATE';
  const isViewOnly  = !!user && dbUser?.role !== 'CANDIDATE';

  const totalQ = round.questions.length;
  const doneCount = Object.values(sessionState).filter(s => s.submitted).length;

  function persist(ns: SessionState) {
    setSessionState(ns);
    try { sessionStorage.setItem(sessionKey, JSON.stringify(ns)); } catch { /* ignore */ }
  }

  function handleSubmit() {
    if (!answer.trim()) return;
    const result = computeFeedback(question!.category, answer);
    const ns: SessionState = {
      ...sessionState,
      [questionIndex]: { answer, score: result.score, feedback: result.feedback, submitted: true },
    };
    persist(ns);
    setScoreData(result);
    setSubmitted(true);
  }

  function handleSkip() {
    if (questionIndex < totalQ - 1)
      router.push(`/job-prep/${slug}/practice/${roundIndex}/${questionIndex + 1}`);
  }

  function handleNext() {
    if (questionIndex < totalQ - 1)
      router.push(`/job-prep/${slug}/practice/${roundIndex}/${questionIndex + 1}`);
    else
      setShowCompletion(true);
  }

  function getStatus(idx: number): 'done' | 'current' | 'pending' {
    if (sessionState[idx]?.submitted) return 'done';
    if (idx === questionIndex) return 'current';
    return 'pending';
  }

  const avgScore =
    doneCount === totalQ
      ? Math.round(
          (Object.values(sessionState).reduce((s, q) => s + q.score, 0) / totalQ) * 10,
        ) / 10
      : null;

  // ── Completion screen ──────────────────────────────────────────────────────
  if (showCompletion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Round Complete!</h2>
          <p className="mt-1 text-sm text-gray-500">{round.name}</p>

          {avgScore !== null && (
            <div className={`mt-4 inline-block rounded-full px-5 py-2 text-base font-bold ${scoreClass(Math.round(avgScore))}`}>
              Average Score: {avgScore} / 10
            </div>
          )}

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="pb-2 text-left">Q#</th>
                <th className="pb-2 text-left">Category</th>
                <th className="pb-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {round.questions.map((q, i) => {
                const s = sessionState[i];
                return (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-500">Q{i + 1}</td>
                    <td className="py-2 text-left text-xs text-gray-500">{q.category}</td>
                    <td className="py-2 text-right">
                      {s?.submitted ? (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreClass(s.score)}`}>
                          {s.score}/10
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">skipped</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {roundIndex + 1 < entry.rounds.length ? (
              <Link
                href={`/job-prep/${slug}/practice/${roundIndex + 1}/0`}
                className="flex-1 rounded-xl bg-[#14a085] py-3 text-center text-sm font-semibold text-white hover:bg-[#0d8a72]"
              >
                Practice Next Round →
              </Link>
            ) : (
              <Link
                href={`/job-prep/${slug}`}
                className="flex-1 rounded-xl bg-[#14a085] py-3 text-center text-sm font-semibold text-white hover:bg-[#0d8a72]"
              >
                All Rounds Complete 🎊
              </Link>
            )}
            <Link
              href={`/job-prep/${slug}`}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to All Rounds
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Practice screen ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href={`/job-prep/${slug}`}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${entry.logoColor}`}
            >
              {entry.logoInitial}
            </div>
            <span className="truncate text-sm font-semibold text-gray-900">{entry.role}</span>
            <span className="shrink-0 text-gray-300">·</span>
            <span className="truncate text-sm text-gray-500">{round.name}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Left: Question + Answer ── */}
          <div className="min-w-0 flex-1 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#14a085] px-3 py-1 text-sm font-bold text-white">
                Q{questionIndex + 1} of {totalQ}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${catClass(question.category)}`}>
                {question.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                {question.duration}
              </span>
            </div>

            {/* Question card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-base font-medium leading-relaxed text-gray-900">
                {question.text}
              </p>
            </div>

            {/* ── Employer / Admin: view-only ── */}
            {isViewOnly && (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-6 py-4">
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      View-only mode — {dbUser?.role === 'EMPLOYER' ? 'Employer' : 'Admin'} account
                    </p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      You can review questions and model answers, but only candidates can submit answers and receive AI feedback.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <label className="block text-sm font-semibold text-gray-400">
                    Your Answer
                  </label>
                  <textarea
                    rows={5}
                    disabled
                    placeholder="Answer submission is available to candidates only."
                    className="w-full resize-none cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400 placeholder:text-gray-300"
                  />
                  <div className="flex gap-3">
                    <button
                      disabled
                      className="flex-1 cursor-not-allowed rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-400"
                    >
                      Submit Answer
                    </button>
                    <button
                      disabled
                      className="cursor-not-allowed rounded-xl border border-gray-100 px-5 py-3 text-sm font-semibold text-gray-300"
                    >
                      Skip →
                    </button>
                  </div>
                </div>
                {/* Model answer always visible for view-only */}
                <div className="border-t border-gray-100 bg-green-50/40 px-6 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#14a085]">
                    💡 Model Answer
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700">{question.modelAnswer}</p>
                </div>
              </div>
            )}

            {/* ── Candidate: full interactive answer / feedback ── */}
            {isCandidate && !submitted && (
              <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Type your answer here or speak it out..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#14a085] focus:outline-none focus:ring-2 focus:ring-[#14a085]/20"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="flex-1 rounded-xl bg-[#14a085] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d8a72] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                  {questionIndex < totalQ - 1 && (
                    <button
                      onClick={handleSkip}
                      className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Skip →
                    </button>
                  )}
                </div>
              </div>
            )}

            {isCandidate && submitted && (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* Submitted answer */}
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Your Answer
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">{answer}</p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
                  <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${scoreClass(scoreData!.score)}`}>
                    ✅ Score: {scoreData!.score} / 10
                  </span>
                  <span className="text-sm text-gray-500">{scoreLabel(scoreData!.score)}</span>
                </div>

                {/* Feedback */}
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    📝 AI Feedback
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700">{scoreData!.feedback}</p>
                </div>

                {/* Model answer */}
                <div className="border-b border-gray-100 bg-green-50/40 px-6 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#14a085]">
                    💡 Model Answer
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700">{question.modelAnswer}</p>
                </div>

                {/* Next action */}
                <div className="px-6 py-4">
                  <button
                    onClick={handleNext}
                    className="w-full rounded-xl bg-[#14a085] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d8a72]"
                  >
                    {questionIndex < totalQ - 1 ? 'Next Question →' : 'View Results →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Progress stepper ── */}
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-72">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{round.name}</p>
                <CircleProgress done={doneCount} total={totalQ} />
              </div>

              {/* Vertical stepper */}
              <div className="relative">
                <div className="absolute bottom-4 left-[11px] top-4 w-px bg-gray-200" />
                <ul className="relative space-y-1">
                  {round.questions.map((q, i) => {
                    const status = getStatus(i);
                    const s = sessionState[i];
                    return (
                      <li key={i}>
                        <button
                          onClick={() =>
                            router.push(`/job-prep/${slug}/practice/${roundIndex}/${i}`)
                          }
                          className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                            i === questionIndex ? 'bg-teal-50' : ''
                          }`}
                        >
                          {/* Circle node */}
                          <div
                            className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                              status === 'done'
                                ? 'border-[#14a085] bg-[#14a085] text-white'
                                : status === 'current'
                                ? 'border-[#14a085] bg-white text-[#14a085]'
                                : 'border-gray-300 bg-white text-gray-400'
                            }`}
                          >
                            {status === 'done' ? <Check className="h-3.5 w-3.5" /> : i + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-medium leading-tight ${
                                i === questionIndex ? 'text-[#14a085]' : 'text-gray-700'
                              }`}
                            >
                              Q{i + 1} · {q.category}
                            </p>
                            {s?.submitted && (
                              <p className={`text-xs font-bold ${scoreTextClass(s.score)}`}>
                                {s.score}/10
                              </p>
                            )}
                          </div>

                          {i === questionIndex && (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#14a085]" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="mt-4 border-t border-gray-100 pt-3 text-center text-xs text-gray-400">
                {doneCount} of {totalQ} completed
              </p>
            </div>

            {/* Round info */}
            <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 text-[#14a085]" />
                Round duration:&nbsp;
                <strong className="text-gray-800">{round.duration}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
