'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Upload, Trash2, ExternalLink,
  CheckCircle2, Loader2, Plus, X, Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface ResumeRecord {
  id: string;
  fileUrl: string;
  parsedData: { skills?: string[] } | null;
  updatedAt: string;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const BUCKET = 'resumes';


export default function ResumePage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const [resume,    setResume]    = useState<ResumeRecord | null>(null);
  const [fetching,  setFetching]  = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const { toasts, addToast, dismiss } = useToast();

  // Skills state
  const [skills,       setSkills]       = useState<string[]>([]);
  const [skillInput,   setSkillInput]   = useState('');
  const [savingSkills, setSavingSkills] = useState(false);

  // Load existing resume
  useEffect(() => {
    if (!user) return;
    fetch('/api/candidate/resume')
      .then(r => r.json())
      .then(d => {
        const r = d.resume ?? null;
        setResume(r);
        setSkills(r?.parsedData?.skills ?? []);
      })
      .finally(() => setFetching(false));
  }, [user]);

  const addSkill = (raw: string) => {
    const tags = raw.split(',').map(s => s.trim()).filter(Boolean);
    setSkills(prev => {
      const next = [...prev];
      for (const t of tags) {
        if (!next.some(s => s.toLowerCase() === t.toLowerCase())) next.push(t);
      }
      return next;
    });
    setSkillInput('');
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
  };

  const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill));

  const saveSkills = async () => {
    setSavingSkills(true);
    try {
      const res = await fetch('/api/candidate/resume', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });
      if (!res.ok) { addToast({ title: 'Failed to save skills', variant: 'error' }); return; }
      addToast({ title: 'Skills saved!', variant: 'success' });
    } catch { addToast({ title: 'Failed to save skills', variant: 'error' }); }
    finally { setSavingSkills(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (file.type !== 'application/pdf') {
      addToast({ title: 'Only PDF files are accepted', variant: 'error' });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      addToast({ title: `File too large (max ${MAX_SIZE_MB} MB)`, variant: 'error' });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const supabase = createSupabaseClient();

      // Upload to Supabase Storage — path: userId/resume.pdf (upsert)
      setProgress(30);
      const path = `${user!.id}/resume.pdf`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: 'application/pdf' });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          addToast({ title: 'Storage bucket "resumes" not found', message: 'Create it in Supabase dashboard', variant: 'error' });
        } else {
          addToast({ title: 'Upload failed', message: uploadError.message, variant: 'error' });
        }
        return;
      }

      setProgress(70);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Save URL to DB
      const res = await fetch('/api/candidate/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl }),
      });

      setProgress(100);

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        addToast({ title: d.error ?? 'Failed to save resume record', variant: 'error' });
        return;
      }

      const { resume: saved } = await res.json() as { resume: ResumeRecord };
      setResume(saved);
      addToast({ title: 'Resume uploaded!', variant: 'success' });
    } catch (err) {
      addToast({ title: 'Upload failed. Please try again.', variant: 'error' });
      console.error('[resume upload]', err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove your resume? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const supabase = createSupabaseClient();
      await supabase.storage.from(BUCKET).remove([`${user!.id}/resume.pdf`]);
      await fetch('/api/candidate/resume', { method: 'DELETE' });
      setResume(null);
      addToast({ title: 'Resume removed', variant: 'success' });
    } catch {
      addToast({ title: 'Failed to delete resume. Please try again.', variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';
  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">My Resume</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-5">

            {/* Current resume card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Current Resume</h2>

              {fetching ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : resume ? (
                <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">resume.pdf</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(resume.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50"
                    >
                      {deleting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                      {deleting ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No resume uploaded yet. Upload one below to let recruiters find you.
                </p>
              )}
            </div>

            {/* Skills card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Your Skills</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Used to show your match score on job listings. Type a skill and press Enter or comma to add.
              </p>

              {/* Chip list */}
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="mt-3 flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    onBlur={() => skillInput.trim() && addSkill(skillInput)}
                    placeholder="e.g. React, Node.js, Python"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button
                  onClick={saveSkills}
                  disabled={savingSkills}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {savingSkills ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save
                </button>
              </div>

            </div>

            {/* Upload card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">
                {resume ? 'Replace Resume' : 'Upload Resume'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">PDF only · Max {MAX_SIZE_MB} MB</p>

              {/* Drop zone */}
              <div
                onClick={() => !uploading && inputRef.current?.click()}
                className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-10 transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Uploading…</p>
                    {/* Progress bar */}
                    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">Click to upload your resume</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF format, up to {MAX_SIZE_MB} MB</p>
                  </>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => !uploading && inputRef.current?.click()}
                disabled={uploading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {uploading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  : <><Upload className="h-4 w-4" /> {resume ? 'Replace Resume' : 'Upload Resume'}</>
                }
              </button>
            </div>

            {/* Tips card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Resume Tips</h2>
              <ul className="mt-3 space-y-2">
                {[
                  'Keep your resume to 1–2 pages for most roles',
                  'Use a clean, ATS-friendly format (no tables or images)',
                  'List your most recent experience first',
                  'Include measurable achievements (e.g. "increased sales by 30%")',
                  'Tailor your resume keywords to each job description',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
