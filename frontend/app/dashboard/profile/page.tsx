'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Loader2, Camera, ExternalLink, Bell, Trash2, KeyRound, MapPin, Briefcase, Plus, X, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface Profile {
  id: string; name: string; email: string;
  phone: string | null; avatar: string | null; role: string;
  createdAt: string;
}

interface CompletionExtras {
  headline: string; location: string; skills: string[]; bio: string; resumeUrl: string | null;
}

function completion(p: Profile | null, e: CompletionExtras): number {
  if (!p) return 0;
  let s = 0;
  if (p.name?.trim())    s += 15;
  if (p.phone?.trim())   s += 10;
  if (p.avatar)          s += 15;
  if (e.headline.trim()) s += 15;
  if (e.location.trim()) s += 10;
  if (e.skills.length)   s += 15;
  if (e.bio.trim())      s += 10;
  if (e.resumeUrl)       s += 10;
  return s;
}

function nextMissing(p: Profile | null, e: CompletionExtras): string {
  if (!p?.avatar)         return 'profile photo';
  if (!e.headline.trim()) return 'professional headline';
  if (!e.resumeUrl)       return 'resume';
  if (!e.location.trim()) return 'location';
  if (!e.skills.length)   return 'skills';
  if (!e.bio.trim())      return 'bio';
  if (!p?.phone?.trim())  return 'phone number';
  return 'missing info';
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  interface NotifPrefs { emailOnStatusChange: boolean; emailOnInterview: boolean; emailOnNewJobs: boolean }
  const [notifPrefs,       setNotifPrefs]       = useState<NotifPrefs>({ emailOnStatusChange: true, emailOnInterview: true, emailOnNewJobs: false });
  const [savingPrefs,      setSavingPrefs]      = useState(false);

  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [savingPwd,   setSavingPwd]   = useState(false);

  const [headline,        setHeadline]        = useState('');
  const [bio,             setBio]             = useState('');
  const [location,        setLocation]        = useState('');
  const [skills,          setSkills]          = useState<string[]>([]);
  const [skillInput,      setSkillInput]      = useState('');
  const [experienceLevel, setExperienceLevel] = useState('FRESHER');
  const [savingPro,       setSavingPro]       = useState(false);

  const [resumeUrl,      setResumeUrl]      = useState<string | null>(null);
  const [resumeUpdatedAt,setResumeUpdatedAt]= useState<string | null>(null);
  const [iframeSrc,      setIframeSrc]      = useState<string | null>(null);
  const [uploadingResume,setUploadingResume]= useState(false);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const blobUrlRef     = useRef<string | null>(null);
  const BUCKET = 'resumes';

  const [avatarPreview,   setAvatarPreview]  = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar]= useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const avatarBlobRef  = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current)   URL.revokeObjectURL(blobUrlRef.current);
      if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/candidate/profile')
      .then(r => r.json())
      .then((p: Profile) => { setProfile(p); setName(p.name ?? ''); setPhone(p.phone ?? ''); });
    fetch('/api/candidate/notification-prefs')
      .then(r => r.ok ? r.json() : null)
      .then((d: { prefs?: NotifPrefs } | null) => { if (d?.prefs) setNotifPrefs(d.prefs); });
    fetch('/api/candidate/resume')
      .then(r => r.ok ? r.json() : null)
      .then((d: { resume?: { fileUrl?: string; updatedAt?: string } } | null) => {
        if (d?.resume?.fileUrl) {
          setResumeUrl(d.resume.fileUrl);
          setResumeUpdatedAt(d.resume.updatedAt ?? null);
          fetch('/api/candidate/resume/signed-url')
            .then(r => r.ok ? r.json() : null)
            .then((s: { signedUrl?: string | null } | null) => {
              if (s?.signedUrl) setIframeSrc(s.signedUrl);
            });
        }
      });
    fetch('/api/candidate/onboarding')
      .then(r => r.ok ? r.json() : null)
      .then((d: { headline?: string; bio?: string; location?: string; skills?: string[]; experienceLevel?: string } | null) => {
        if (!d) return;
        if (d.headline)        setHeadline(d.headline);
        if (d.bio)             setBio(d.bio);
        if (d.location)        setLocation(d.location);
        if (d.skills?.length)  setSkills(d.skills);
        if (d.experienceLevel) setExperienceLevel(d.experienceLevel);
      });
  }, [user]);

  const togglePref = useCallback(async (key: keyof NotifPrefs) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    setSavingPrefs(true);
    await fetch('/api/candidate/notification-prefs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: next[key] }),
    }).catch(() => {});
    setSavingPrefs(false);
    addToast({ title: 'Notification preferences saved', variant: 'success', duration: 2000 });
  }, [notifPrefs]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { addToast({ title: 'New passwords do not match', variant: 'error' }); return; }
    setSavingPwd(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { addToast({ title: data.error ?? 'Failed to change password', variant: 'error' }); return; }
      addToast({ title: 'Password changed successfully', variant: 'success' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { addToast({ title: data.error ?? 'Failed to save profile', variant: 'error' }); return; }
      setProfile(prev => prev ? { ...prev, ...data } : data);
      addToast({ title: 'Profile saved', variant: 'success' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    if (file.type !== 'application/pdf') { addToast({ title: 'Only PDF files are accepted', variant: 'error' }); return; }
    if (file.size > 5 * 1024 * 1024)    { addToast({ title: 'File too large (max 5 MB)',   variant: 'error' }); return; }

    setUploadingResume(true);
    try {
      const supabase = createSupabaseClient();
      const path = `${user.id}/resume.pdf`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET).upload(path, file, { upsert: true, contentType: 'application/pdf' });
      if (uploadError) {
        addToast({ title: 'Upload failed', message: uploadError.message, variant: 'error' });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const res = await fetch('/api/candidate/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        addToast({ title: data.error ?? 'Failed to save resume record', variant: 'error' });
        return;
      }

      setResumeUrl(publicUrl);
      setResumeUpdatedAt(new Date().toISOString());
      // Revoke old blob URL to free memory, then create a fresh one for the iframe
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const blobUrl = URL.createObjectURL(file);
      blobUrlRef.current = blobUrl;
      setIframeSrc(blobUrl);
      addToast({ title: 'Resume updated!', variant: 'success' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast({ title: 'Only JPG, PNG, or WEBP allowed', variant: 'error' }); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ title: 'File too large (max 2 MB)', variant: 'error' }); return;
    }

    // Instant local preview
    if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
    const blobUrl = URL.createObjectURL(file);
    avatarBlobRef.current = blobUrl;
    setAvatarPreview(blobUrl);

    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/candidate/profile/avatar', { method: 'POST', body: fd });
      const data = await res.json() as { avatar?: string; error?: string };
      if (!res.ok) { addToast({ title: data.error ?? 'Avatar upload failed', variant: 'error' }); return; }
      setProfile(prev => prev ? { ...prev, avatar: data.avatar ?? prev.avatar } : prev);
      addToast({ title: 'Profile photo updated!', variant: 'success' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const handleSavePro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) { addToast({ title: 'Headline is required', variant: 'error' }); return; }
    if (!location.trim()) { addToast({ title: 'Location is required', variant: 'error' }); return; }
    setSavingPro(true);
    try {
      const res = await fetch('/api/candidate/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, bio, location, skills, experienceLevel, phone, name }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { addToast({ title: data.error ?? 'Failed to save', variant: 'error' }); return; }
      addToast({ title: 'Professional details saved', variant: 'success' });
    } finally {
      setSavingPro(false);
    }
  };

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';
  const completionExtras: CompletionExtras = { headline, location, skills, bio, resumeUrl };
  const pct = completion(profile, completionExtras);
  const missing = nextMissing(profile, completionExtras);
  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser();
    router.push('/');
  };

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">My Profile</h1>
          </div>
          {user && (
            <Link
              href={`/profile/${user.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Public Profile
            </Link>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-5">

            {/* Completion banner */}
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Profile {pct}% complete</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pct < 100
                    ? `Add your ${missing} to reach 100%`
                    : 'Your profile is fully complete!'}
                </p>
              </div>
              <div className="relative flex h-14 w-14 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#5B5BD6" strokeWidth="2.5"
                    strokeLinecap="round" strokeDasharray={`${pct} ${100 - pct}`} />
                </svg>
                <span className="absolute text-xs font-bold text-primary">{pct}%</span>
              </div>
            </div>

            {/* Avatar section */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Profile Photo</h2>
              <div className="mt-4 flex items-center gap-4">
                {/* Avatar circle — shows uploaded image or initial */}
                <div className="relative h-16 w-16 shrink-0">
                  {(avatarPreview ?? profile?.avatar) ? (
                    <img
                      src={avatarPreview ?? profile!.avatar!}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                      {(profile?.name ?? displayName)[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    <Camera className="h-4 w-4" />
                    {uploadingAvatar ? 'Uploading…' : profile?.avatar ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP — max 2 MB</p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>

              <div className="mt-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Email — read-only */}
                <div>
                  <label className="block text-sm font-medium text-foreground">Email Address</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={profile?.email ?? user?.email ?? ''}
                      disabled
                      className="w-full rounded-lg border border-border bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Role — read-only */}
                <div>
                  <label className="block text-sm font-medium text-foreground">Account Type</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-4 py-2.5">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
                      {profile?.role?.toLowerCase() ?? 'candidate'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Member since {profile ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>

            {/* Professional Details */}
            <form onSubmit={handleSavePro} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Briefcase className="h-4 w-4 text-primary" /> Professional Details
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Professional Headline</label>
                  <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Senior QA Engineer at Infosys"
                    className="mt-1.5 w-full rounded-lg border border-border py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Location</label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Experience Level</label>
                  <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="FRESHER">Fresher (0–1 yr)</option>
                    <option value="JUNIOR">Junior (1–3 yrs)</option>
                    <option value="MID">Mid (3–6 yrs)</option>
                    <option value="SENIOR">Senior (6–10 yrs)</option>
                    <option value="LEAD">Lead (10+ yrs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Skills</label>
                  <div className="mt-1.5 flex gap-2">
                    <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                      placeholder="Type a skill and press Enter"
                      className="flex-1 rounded-lg border border-border py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button type="button" onClick={addSkill}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {s}
                          <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))}
                            className="ml-1 hover:text-red-500 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Short Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    placeholder="Tell employers a little about yourself…"
                    className="mt-1.5 w-full resize-none rounded-lg border border-border py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <button type="submit" disabled={savingPro}
                className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
                {savingPro && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingPro ? 'Saving…' : 'Save Details'}
              </button>
            </form>

            {/* Resume */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" /> Resume
                </h2>
                <button onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                  {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploadingResume ? 'Uploading…' : resumeUrl ? 'Update Resume' : 'Upload Resume'}
                </button>
                <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
              </div>

              {resumeUrl ? (
                <div className="mt-4 space-y-3">
                  {/* File info row */}
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-gray-50 px-4 py-3">
                    <FileText className="h-8 w-8 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">resume.pdf</p>
                      {resumeUpdatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(resumeUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <a href={iframeSrc ?? resumeUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90">
                      <ExternalLink className="h-3.5 w-3.5" /> Preview
                    </a>
                  </div>
                  {/* Inline PDF preview — uses blob URL after upload, signed URL on load */}
                  {iframeSrc ? (
                    <iframe
                      key={iframeSrc}
                      src={iframeSrc}
                      title="Resume preview"
                      className="h-[500px] w-full rounded-lg border border-border bg-gray-50"
                    />
                  ) : (
                    <div className="flex h-20 items-center justify-center rounded-lg border border-border bg-gray-50">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-gray-50 py-10 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm font-medium text-foreground">No resume uploaded yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">PDF only, max 5 MB</p>
                  <button onClick={() => resumeInputRef.current?.click()}
                    className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
                    <Upload className="h-4 w-4" /> Upload Resume
                  </button>
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bell className="h-4 w-4 text-primary" /> Email Notifications
                </h2>
                {savingPrefs && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
              <div className="mt-4 space-y-3">
                {([
                  { key: 'emailOnStatusChange', label: 'Application status updates', desc: 'When your application is shortlisted, rejected, or hired' },
                  { key: 'emailOnInterview',    label: 'Interview scheduled',         desc: 'When an employer schedules an interview with you' },
                  { key: 'emailOnNewJobs',      label: 'New job alerts',              desc: 'Weekly digest of new jobs matching your skills' },
                ] as { key: keyof NotifPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
                  <label key={key} className="flex cursor-pointer items-start gap-3">
                    <div className="relative mt-0.5 flex-none">
                      <input
                        type="checkbox"
                        checked={notifPrefs[key]}
                        onChange={() => togglePref(key)}
                        className="sr-only"
                      />
                      <div
                        onClick={() => togglePref(key)}
                        className={`flex h-5 w-9 items-center rounded-full transition-colors ${notifPrefs[key] ? 'bg-primary' : 'bg-gray-200'}`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          {/* Change Password */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <KeyRound className="h-4 w-4 text-primary" /> Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground">Current Password</label>
                <input type="password" required value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1.5 w-full rounded-lg border border-border py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">New Password</label>
                <input type="password" required minLength={8} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-1.5 w-full rounded-lg border border-border py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
                <input type="password" required minLength={8} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Repeat new password"
                  className="mt-1.5 w-full rounded-lg border border-border py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="submit" disabled={savingPwd}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
                {savingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingPwd ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-destructive">Danger Zone</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Permanently delete your account, all applications, and saved jobs. This cannot be undone.
            </p>
            <button
              onClick={async () => {
                if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
                const res = await fetch('/api/candidate/account', { method: 'DELETE' });
                if (res.ok) {
                  const supabase = createSupabaseClient();
                  await supabase.auth.signOut();
                  clearUser();
                  router.push('/');
                } else {
                  const d = await res.json() as { error?: string };
                  addToast({ title: d.error ?? 'Failed to delete account', variant: 'error' });
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete My Account
            </button>
          </div>

          </div>{/* end max-w-2xl */}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
