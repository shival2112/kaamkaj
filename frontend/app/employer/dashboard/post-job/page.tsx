'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Loader2, Briefcase } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';
import {
  LayoutDashboard, Layers, ClipboardList, BarChart3, PlusCircle, FileText,
} from 'lucide-react';

const EMPLOYER_NAV: SidebarNavSection[] = [
  {
    label: 'Manage',
    items: [
      { href: '/employer/dashboard',             label: 'Overview',              icon: LayoutDashboard },
      { href: '/employer/dashboard/listings',    label: 'My Listings',           icon: Layers },
      { href: '/employer/dashboard/applications',label: 'Applications Received', icon: ClipboardList },
      { href: '/employer/dashboard/analytics',   label: 'Analytics',             icon: BarChart3 },
      { href: '/employer/offer-letter',          label: 'Offer Letter',          icon: FileText },
    ],
  },
];

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'REMOTE',    label: 'Remote' },
  { value: 'CONTRACT',  label: 'Contract' },
  { value: 'INTERNSHIP',label: 'Internship' },
];
const EXP_LEVELS = [
  { value: 'FRESHER', label: 'Fresher (0 yrs)' },
  { value: 'JUNIOR',  label: 'Junior (1–3 yrs)' },
  { value: 'MID',     label: 'Mid (3–6 yrs)' },
  { value: 'SENIOR',  label: 'Senior (6–10 yrs)' },
  { value: 'LEAD',    label: 'Lead (10+ yrs)' },
];

export default function PostJobPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const { data: nextSession, status: nextStatus } = useSession();
  const clearUser = useAuthStore((s) => s.clearUser);

  const sessionReady = !isLoading && nextStatus !== 'loading';
  const isEmployer =
    (!!user && (user.user_metadata?.role as string ?? '').toUpperCase() === 'EMPLOYER') ||
    (!!nextSession?.user && (nextSession.user.role as string ?? '').toUpperCase() === 'EMPLOYER');

  useEffect(() => {
    if (!sessionReady) return;
    if (!isEmployer) router.replace('/login');
  }, [sessionReady, isEmployer, router]);

  const [form, setForm] = useState({
    title: '', type: 'FULL_TIME', location: '', experienceLevel: 'MID',
    salaryMin: '', salaryMax: '', vacancies: '1', description: '',
  });
  const [skills,     setSkills]     = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
  };
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title, type: form.type, location: form.location,
          experienceLevel: form.experienceLevel, description: form.description,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          vacancies: Number(form.vacancies) || 1,
          skills,
        }),
      });
      const data = await res.json();
      if (!res.ok) { addToast({ title: data.error ?? 'Failed to post job', variant: 'error' }); return; }
      console.log('[post-job/dashboard] created job:', (data as { id: string }).id);
      router.push('/employer/dashboard/listings');
    } finally {
      setSubmitting(false);
    }
  };

  const displayName =
    dbUser?.name ??
    user?.email?.split('@')[0] ??
    (nextSession?.user as { companyName?: string } | undefined)?.companyName ??
    nextSession?.user?.name ??
    'Employer';

  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser(); router.push('/');
  };

  if (!sessionReady) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role="Employer" onLogout={handleLogout}
        primaryButtonLabel="Post a Job" primaryButtonIcon={PlusCircle}
        onPrimaryButton={() => router.push('/employer/dashboard/post-job')}
        navSections={EMPLOYER_NAV} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <Briefcase className="h-5 w-5 text-primary mr-2" />
          <h1 className="font-semibold text-foreground">Post a New Job</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">

            {/* Basic info */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
              <div className="mt-4 space-y-4">
                <Field label="Job Title *">
                  <input value={form.title} onChange={e => set('title', e.target.value)} required
                    placeholder="e.g. Senior React Developer"
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Job Type *">
                    <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Experience Level *">
                    <select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {EXP_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Location *">
                    <input value={form.location} onChange={e => set('location', e.target.value)} required
                      placeholder="e.g. Bangalore or Remote" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Vacancies">
                    <input type="number" min="1" value={form.vacancies} onChange={e => set('vacancies', e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Compensation <span className="font-normal text-muted-foreground">(optional)</span></h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field label="Min Salary (₹ / year)">
                  <input type="number" min="0" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)}
                    placeholder="e.g. 600000" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </Field>
                <Field label="Max Salary (₹ / year)">
                  <input type="number" min="0" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)}
                    placeholder="e.g. 1200000" className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </Field>
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Required Skills <span className="font-normal text-muted-foreground">(optional)</span></h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Press Enter or comma to add each skill</p>
              <div className="mt-3 flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={onSkillKey}
                  placeholder="e.g. React, TypeScript…"
                  className="input-field flex-1" />
                <button type="button" onClick={addSkill}
                  className="flex items-center gap-1 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s} className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-danger">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Job Description *</h2>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} required
                rows={8} placeholder="Describe the role, responsibilities, and what makes this a great opportunity…"
                className="input-field mt-3 resize-y" />
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => router.back()}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
                {submitting ? 'Posting…' : 'Post Job'}
              </button>
            </div>

          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
