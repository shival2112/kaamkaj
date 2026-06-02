'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const EXPERIENCE_OPTIONS = [
  { value: 'FRESHER', label: 'Fresher (0 years)' },
  { value: 'JUNIOR',  label: '1–3 years' },
  { value: 'MID',     label: '3–6 years' },
  { value: 'SENIOR',  label: '6–10 years' },
  { value: 'LEAD',    label: '10+ years' },
];

interface OnboardingData {
  name: string; email: string; phone: string;
  headline: string; bio: string; location: string;
  skills: string[]; experienceLevel: string;
  profileCompleted: boolean;
}

const MAX_SIZE_MB    = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const BUCKET         = 'resumes';

export default function OnboardingPage() {
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name,            setName]            = useState('');
  const [phone,           setPhone]           = useState('');
  const [headline,        setHeadline]        = useState('');
  const [bio,             setBio]             = useState('');
  const [location,        setLocation]        = useState('');
  const [skills,          setSkills]          = useState<string[]>([]);
  const [skillInput,      setSkillInput]      = useState('');
  const [experienceLevel, setExperienceLevel] = useState('FRESHER');
  const [loading,         setLoading]         = useState(false);
  const [prefilling,      setPrefilling]      = useState(true);
  const [error,           setError]           = useState('');

  // Resume upload state
  const [resumeFile,      setResumeFile]      = useState<File | null>(null);
  const [existingResume,  setExistingResume]  = useState<string | null>(null);
  const [uploading,       setUploading]       = useState(false);
  const [fileError,       setFileError]       = useState('');

  // Pre-fill with existing data + check for existing resume
  useEffect(() => {
    Promise.all([
      fetch('/api/candidate/onboarding').then(r => r.ok ? r.json() : null),
      fetch('/api/candidate/resume').then(r => r.ok ? r.json() : null),
    ])
      .then(([profile, resumeData]: [OnboardingData | null, { resume?: { fileUrl: string } } | null]) => {
        if (profile) {
          if (profile.name)            setName(profile.name);
          if (profile.phone)           setPhone(profile.phone);
          if (profile.headline)        setHeadline(profile.headline);
          if (profile.bio)             setBio(profile.bio);
          if (profile.location)        setLocation(profile.location);
          if (profile.skills?.length)  setSkills(profile.skills);
          if (profile.experienceLevel) setExperienceLevel(profile.experienceLevel);
          if (profile.profileCompleted) router.replace('/dashboard');
        }
        if (resumeData?.resume?.fileUrl) setExistingResume(resumeData.resume.fileUrl);
      })
      .catch(() => {/* non-fatal */})
      .finally(() => setPrefilling(false));
  }, [router]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) =>
    setSkills(prev => prev.filter(s => s !== skill));

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setFileError('');
    if (!file) return;
    if (file.type !== 'application/pdf') { setFileError('Only PDF files are accepted.'); return; }
    if (file.size > MAX_SIZE_BYTES) { setFileError(`Maximum size is ${MAX_SIZE_MB} MB.`); return; }
    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Upload resume to Supabase Storage if a new file was chosen
      if (resumeFile && user) {
        setUploading(true);
        try {
          const supabase = createSupabaseClient();
          const path = `${user.id}/resume.pdf`;
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, resumeFile, { upsert: true, contentType: 'application/pdf' });

          if (uploadError) {
            setFileError(uploadError.message.includes('bucket')
              ? 'Storage bucket "resumes" not found. Create it in Supabase dashboard.'
              : uploadError.message);
            return;
          }

          const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

          // Save URL to DB
          await fetch('/api/candidate/resume', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: publicUrl }),
          });
          setExistingResume(publicUrl);
          setResumeFile(null);
        } finally {
          setUploading(false);
        }
      }

      // 2. Save profile data
      const res = await fetch('/api/candidate/onboarding', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, headline, bio, location, skills, experienceLevel }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  if (prefilling) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">Complete your profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Employers will see this before reviewing your application. Takes 2 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {/* Name */}
          <div>
            <label className={labelCls}>Full name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Rahul Sharma" className={inputCls} />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone number *</label>
            <input type="tel" required value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d+\-\s]/g, ''))}
              placeholder="9876543210" className={inputCls} />
          </div>

          {/* Headline */}
          <div>
            <label className={labelCls}>Professional headline *</label>
            <input type="text" required value={headline} onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Frontend Developer · React · 2 yrs exp" className={inputCls} />
            <p className="mt-1 text-xs text-gray-400">One line that describes what you do</p>
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>Location *</label>
            <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Bangalore, India" className={inputCls} />
          </div>

          {/* Experience level */}
          <div>
            <label className={labelCls}>Experience level</label>
            <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
              className={inputCls}>
              {EXPERIENCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className={labelCls}>Skills</label>
            <div className="flex gap-2">
              <input type="text" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
                className={`${inputCls} flex-1`} />
              <button type="button" onClick={addSkill}
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.map(skill => (
                  <span key={skill}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className={labelCls}>Short bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Tell employers a bit about yourself, your background, and what you're looking for..."
              className={`${inputCls} resize-none`} />
          </div>

          {/* Resume upload */}
          <div>
            <label className={labelCls}>Resume (PDF, max {MAX_SIZE_MB} MB)</label>
            <input ref={fileRef} type="file" accept="application/pdf"
              onChange={handleFileChange} className="hidden" />

            {/* Show current state */}
            {resumeFile ? (
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium text-primary">{resumeFile.name}</span>
                </div>
                <button type="button" onClick={() => setResumeFile(null)}
                  className="ml-2 shrink-0 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : existingResume ? (
              <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Resume uploaded</span>
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs font-medium text-primary hover:underline">
                  Replace
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                Click to upload your resume (PDF only)
              </button>
            )}

            {fileError && <p className="mt-1.5 text-xs text-red-500">{fileError}</p>}
          </div>

          <button type="submit" disabled={loading || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {(loading || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? 'Uploading resume…' : 'Save Profile & Continue'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          You can update this anytime from your dashboard profile settings.
        </p>
      </div>
    </div>
  );
}
