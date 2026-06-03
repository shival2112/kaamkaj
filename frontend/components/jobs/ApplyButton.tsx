'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Send, ChevronDown, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';

type Step = 'idle' | 'composing' | 'done';

const TEMPLATES = [
  {
    label: 'Enthusiastic',
    text: `I am thrilled to apply for this position. My background aligns strongly with the role's requirements, and I am eager to contribute my skills to your team. I am confident that my experience and passion make me an excellent fit, and I look forward to discussing how I can add value to your organisation.`,
  },
  {
    label: 'Experienced',
    text: `With several years of hands-on experience in this domain, I have consistently delivered results and collaborated effectively in fast-paced environments. I am excited by this opportunity and believe my proven track record makes me well-suited for this role. I would welcome the chance to discuss my experience in more detail.`,
  },
  {
    label: 'Fresher',
    text: `As a recent graduate eager to kickstart my career, I was excited to discover this opening. Although I am new to the professional world, I bring strong academic foundations, a quick-learning mindset, and genuine enthusiasm for this field. I am keen to grow with your team and contribute fresh perspectives from day one.`,
  },
] as const;

interface ApplyButtonProps {
  jobId: string;
  alreadyApplied: boolean;
}

export function ApplyButton({ jobId, alreadyApplied: initial }: ApplyButtonProps) {
  const router = useRouter();

  const user     = useAuthStore((s) => s.user);
  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();
  const { data: nextSession } = useSession();
  const nextRole = (nextSession?.user?.role as string ?? '').toUpperCase();

  const [step,        setStep]        = useState<Step>(initial ? 'done' : 'idle');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  if (userRole === 'EMPLOYER' || userRole === 'ADMIN') return null;
  if (nextRole === 'EMPLOYER') return null;

  const isLoggedInCandidate =
    (!!user && userRole === 'CANDIDATE') ||
    (!!nextSession?.user && nextRole === 'CANDIDATE') ||
    (!!user && userRole === '') ||
    (!!nextSession?.user && nextRole === '');

  if (!isLoggedInCandidate) {
    return (
      <button
        onClick={() => router.push(`/login?redirect=/jobs/${jobId}`)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <Send className="h-4 w-4" />
        Login to Apply
      </button>
    );
  }

  if (step === 'done') {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-success/10 px-6 py-3 text-sm font-semibold text-success">
        <CheckCircle2 className="h-4 w-4" />
        Applied Successfully
      </div>
    );
  }

  const submit = async (letter: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter: letter }),
      });
      if (res.status === 201 || res.status === 409) {
        setStep('done');
      } else {
        const body = await res.json() as { error?: string; code?: string };
        if (body.code === 'PROFILE_INCOMPLETE') {
          router.push('/dashboard/onboarding');
          return;
        }
        if (body.code === 'RATE_LIMITED') setStep('idle');
        setError(body.error ?? 'Something went wrong. Try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Composing: show cover letter textarea ─────────────────────────────────
  if (step === 'composing') {
    return (
      <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Cover Letter</p>
          <button
            onClick={() => { setStep('idle'); setError(''); }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Template picker */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center">Use template:</span>
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              type="button"
              onClick={() => setCoverLetter(t.text)}
              className="rounded-md border border-primary/30 bg-white px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          placeholder="Briefly introduce yourself and explain why you're a great fit for this role… (optional)"
          rows={5}
          maxLength={1000}
          className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="text-right text-xs text-muted-foreground">{coverLetter.length}/1000</p>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => submit('')}
            disabled={loading}
            className="flex-1 rounded-lg border border-border bg-white py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
          >
            Skip letter
          </button>
          <button
            onClick={() => submit(coverLetter)}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </button>
        </div>
      </div>
    );
  }

  // ── Idle: primary CTA ────────────────────────────────────────────────────
  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setStep('composing')}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <Send className="h-4 w-4" />
        Apply Now
        <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
      </button>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
