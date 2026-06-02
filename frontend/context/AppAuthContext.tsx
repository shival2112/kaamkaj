'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Employer,
  Job,
  Candidate,
  Interview,
  QuestionResult,
  FeedbackData,
} from '@/data/employerData';
import {
  INITIAL_EMPLOYER,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_INTERVIEWS,
} from '@/data/employerData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployerUser {
  id: string;
  type: 'employer';
  name: string;
  initials: string;
  phone: string;
  employer: Employer;
  jobs: Job[];
  candidates: Candidate[];
  interviews: Interview[];
}

export interface CandidateUser {
  id: string;
  type: 'candidate';
  name: string;
  phone: string;
  appliedJobs: {
    id: string; jobTitle: string; company: string;
    location: string; appliedDate: string; status: string;
  }[];
  savedJobs: { id: string; jobTitle: string; company: string; location: string }[];
  interviews: {
    id: string; round: string; jobTitle: string;
    date: string; time: string; mode: string; link: string; status: string;
  }[];
}

export type AppUser = EmployerUser | CandidateUser;

interface AppAuthContextType {
  allUsers: AppUser[];
  activeUser: AppUser | null;
  isLoggedIn: boolean;
  isEmployer: boolean;
  hydrated: boolean;

  // Auth actions
  registerEmployer: (data: { name: string; phone: string; company: string; industry: string; location: string }) => { ok: boolean; error?: string };
  registerCandidate: (data: { name: string; phone: string }) => { ok: boolean; error?: string };
  loginByPhone: (phone: string, type?: 'employer' | 'candidate') => { ok: boolean; error?: string; created?: boolean };
  logout: () => void;

  // Employer data mutations
  updateEmployer: (updates: Partial<Employer>) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  cancelInterview: (id: string) => void;
  deleteInterview: (id: string) => void;
  saveInterviewQuestions: (id: string, questions: QuestionResult[]) => void;
  saveInterviewFeedback: (id: string, feedback: FeedbackData) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_USERS_KEY = 'kk_all_users';
const STORAGE_ACTIVE_KEY = 'kk_active_user_id';
const DEMO_EMPLOYER_PHONE = '9999999999';

const DEMO_EMPLOYER: EmployerUser = {
  id: 'demo_employer',
  type: 'employer',
  name: INITIAL_EMPLOYER.name,
  initials: INITIAL_EMPLOYER.initials,
  phone: DEMO_EMPLOYER_PHONE,
  employer: INITIAL_EMPLOYER,
  jobs: INITIAL_JOBS,
  candidates: INITIAL_CANDIDATES,
  interviews: INITIAL_INTERVIEWS,
};

function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

const noop = () => ({} as never);

// ─── Context ──────────────────────────────────────────────────────────────────

const AppAuthContext = createContext<AppAuthContextType>({
  allUsers: [], activeUser: null, isLoggedIn: false, isEmployer: false, hydrated: false,
  registerEmployer: noop, registerCandidate: noop, loginByPhone: noop, logout: () => {},
  updateEmployer: () => {}, addJob: () => {}, updateJob: () => {}, deleteJob: () => {},
  updateCandidate: () => {}, addInterview: () => {}, updateInterview: () => {},
  cancelInterview: () => {}, deleteInterview: () => {},
  saveInterviewQuestions: () => {}, saveInterviewFeedback: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount; seed the demo employer on first run
  useEffect(() => {
    const stored = readStorage<AppUser[]>(STORAGE_USERS_KEY, []);
    const hasDemo = stored.some(u => u.id === DEMO_EMPLOYER.id);
    const users = hasDemo ? stored : [DEMO_EMPLOYER, ...stored];
    if (!hasDemo) writeStorage(STORAGE_USERS_KEY, users);
    setAllUsers(users);
    setActiveId(readStorage<string | null>(STORAGE_ACTIVE_KEY, null));
    setHydrated(true);
  }, []);

  // Persist whenever they change
  useEffect(() => { writeStorage(STORAGE_USERS_KEY, allUsers); }, [allUsers]);
  useEffect(() => { writeStorage(STORAGE_ACTIVE_KEY, activeId); }, [activeId]);

  const activeUser = allUsers.find(u => u.id === activeId) ?? null;

  // ── Mutate helpers ──
  const mutateUser = useCallback((id: string, fn: (u: AppUser) => AppUser) => {
    setAllUsers(prev => prev.map(u => u.id === id ? fn(u) : u));
  }, []);

  const mutateEmployer = useCallback((fn: (u: EmployerUser) => EmployerUser) => {
    if (!activeId) return;
    mutateUser(activeId, u => u.type === 'employer' ? fn(u) : u);
  }, [activeId, mutateUser]);

  // ── Auth ──
  const registerEmployer = useCallback((data: { name: string; phone: string; company: string; industry: string; location: string }) => {
    if (allUsers.some(u => u.phone === data.phone)) {
      return { ok: false, error: 'An account with this phone number already exists. Please login.' };
    }
    const id = `emp_${Date.now()}`;
    const newUser: EmployerUser = {
      id, type: 'employer',
      name: data.name,
      initials: initials(data.company),
      phone: data.phone,
      employer: {
        name: data.company,
        initials: initials(data.company),
        industry: data.industry,
        location: data.location,
        website: '',
        about: '',
      },
      jobs: [], candidates: [], interviews: [],
    };
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    setActiveId(id);
    // Write synchronously so data is available immediately on navigation
    writeStorage(STORAGE_USERS_KEY, updated);
    writeStorage(STORAGE_ACTIVE_KEY, id);
    return { ok: true };
  }, [allUsers]);

  const registerCandidate = useCallback((data: { name: string; phone: string }) => {
    if (allUsers.some(u => u.phone === data.phone)) {
      return { ok: false, error: 'An account with this phone number already exists. Please login.' };
    }
    const id = `cand_${Date.now()}`;
    const newUser: CandidateUser = {
      id, type: 'candidate',
      name: data.name,
      phone: data.phone,
      appliedJobs: [], savedJobs: [], interviews: [],
    };
    const updatedC = [...allUsers, newUser];
    setAllUsers(updatedC);
    setActiveId(id);
    writeStorage(STORAGE_USERS_KEY, updatedC);
    writeStorage(STORAGE_ACTIVE_KEY, id);
    return { ok: true };
  }, [allUsers]);

  const loginByPhone = useCallback((phone: string, type: 'employer' | 'candidate' = 'candidate') => {
    const trimmed = phone.trim();
    const found = allUsers.find(u => u.phone === trimmed);
    if (found) {
      setActiveId(found.id);
      writeStorage(STORAGE_ACTIVE_KEY, found.id);
      return { ok: true };
    }
    // Auto-create account on first login so any phone + 123456 always works
    const id = `${type}_${Date.now()}`;
    let newUser: AppUser;
    if (type === 'employer') {
      newUser = {
        id, type: 'employer',
        name: 'Employer',
        initials: 'EM',
        phone: trimmed,
        employer: { name: 'My Company', initials: 'MC', industry: 'Technology', location: 'India', website: '', about: '' },
        jobs: [], candidates: [], interviews: [],
      } satisfies EmployerUser;
    } else {
      newUser = {
        id, type: 'candidate',
        name: 'Candidate',
        phone: trimmed,
        appliedJobs: [], savedJobs: [], interviews: [],
      } satisfies CandidateUser;
    }
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    setActiveId(id);
    writeStorage(STORAGE_USERS_KEY, updated);
    writeStorage(STORAGE_ACTIVE_KEY, id);
    return { ok: true, created: true };
  }, [allUsers]);

  const logout = useCallback(() => {
    setActiveId(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'demo-employer=; path=/; max-age=0';
      document.cookie = 'demo-candidate=; path=/; max-age=0';
    }
  }, []);

  // ── Employer mutations ──
  const updateEmployer = useCallback((updates: Partial<Employer>) => {
    mutateEmployer(u => ({
      ...u,
      employer: { ...u.employer, ...updates },
      name: updates.name ?? u.name,
      initials: updates.name ? initials(updates.name) : u.initials,
    }));
  }, [mutateEmployer]);

  const addJob = useCallback((job: Job) => {
    mutateEmployer(u => ({ ...u, jobs: [job, ...u.jobs] }));
  }, [mutateEmployer]);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    mutateEmployer(u => ({ ...u, jobs: u.jobs.map(j => j.id === id ? { ...j, ...updates } : j) }));
  }, [mutateEmployer]);

  const deleteJob = useCallback((id: string) => {
    mutateEmployer(u => ({ ...u, jobs: u.jobs.filter(j => j.id !== id) }));
  }, [mutateEmployer]);

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    mutateEmployer(u => ({ ...u, candidates: u.candidates.map(c => c.id === id ? { ...c, ...updates } : c) }));
  }, [mutateEmployer]);

  const addInterview = useCallback((interview: Interview) => {
    mutateEmployer(u => ({ ...u, interviews: [interview, ...u.interviews] }));
  }, [mutateEmployer]);

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    mutateEmployer(u => ({ ...u, interviews: u.interviews.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [mutateEmployer]);

  const cancelInterview = useCallback((id: string) => {
    mutateEmployer(u => ({ ...u, interviews: u.interviews.map(i => i.id === id ? { ...i, status: 'cancelled' as const } : i) }));
  }, [mutateEmployer]);

  const deleteInterview = useCallback((id: string) => {
    mutateEmployer(u => ({ ...u, interviews: u.interviews.filter(i => i.id !== id) }));
  }, [mutateEmployer]);

  const saveInterviewQuestions = useCallback((id: string, questions: QuestionResult[]) => {
    mutateEmployer(u => ({ ...u, interviews: u.interviews.map(i => i.id === id ? { ...i, questions } : i) }));
  }, [mutateEmployer]);

  const saveInterviewFeedback = useCallback((id: string, feedback: FeedbackData) => {
    mutateEmployer(u => ({
      ...u,
      interviews: u.interviews.map(i => i.id === id ? { ...i, feedback, status: 'completed' as const } : i),
    }));
  }, [mutateEmployer]);

  return (
    <AppAuthContext.Provider value={{
      allUsers, activeUser, hydrated,
      isLoggedIn: !!activeUser,
      isEmployer: activeUser?.type === 'employer',
      registerEmployer, registerCandidate, loginByPhone, logout,
      updateEmployer, addJob, updateJob, deleteJob, updateCandidate,
      addInterview, updateInterview, cancelInterview, deleteInterview,
      saveInterviewQuestions, saveInterviewFeedback,
    }}>
      {children}
    </AppAuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AppAuthContext);
}
