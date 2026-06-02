// Compatibility shim — all employer pages still call useEmployerStore() unchanged.
// Data now comes from AppAuthContext (per-user, localStorage-persisted) instead of
// the old shared Zustand store with hardcoded initial data.

import { useAppAuth } from '@/context/AppAuthContext';
import type {
  Employer,
  Job,
  Candidate,
  Interview,
  QuestionResult,
  FeedbackData,
} from '@/data/employerData';

const EMPTY_EMPLOYER: Employer = {
  name: '',
  initials: '',
  industry: '',
  location: '',
  website: '',
  about: '',
};

export function useEmployerStore() {
  const ctx = useAppAuth();
  const user = ctx.activeUser?.type === 'employer' ? ctx.activeUser : null;

  return {
    employer:    user?.employer    ?? EMPTY_EMPLOYER,
    jobs:        user?.jobs        ?? [] as Job[],
    candidates:  user?.candidates  ?? [] as Candidate[],
    interviews:  user?.interviews  ?? [] as Interview[],

    updateEmployer:       ctx.updateEmployer,
    addJob:               ctx.addJob,
    updateJob:            ctx.updateJob,
    deleteJob:            ctx.deleteJob,
    updateCandidate:      ctx.updateCandidate,
    addInterview:         ctx.addInterview,
    updateInterview:      ctx.updateInterview,
    cancelInterview:      ctx.cancelInterview,
    deleteInterview:      ctx.deleteInterview,
    saveInterviewQuestions: ctx.saveInterviewQuestions,
    saveInterviewFeedback:  ctx.saveInterviewFeedback,
  };
}

// Re-export types so existing imports from this module keep working
export type { Employer, Job, Candidate, Interview, QuestionResult, FeedbackData };
