'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, CheckCircle2, Loader2, Camera, ExternalLink, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

interface Profile {
  id: string; name: string; email: string;
  phone: string | null; avatar: string | null; role: string;
  createdAt: string;
}

function completion(p: Profile | null): number {
  if (!p) return 25;
  return 25 + (p.name ? 25 : 0) + (p.phone ? 25 : 0) + (p.avatar ? 25 : 0);
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
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  interface NotifPrefs { emailOnStatusChange: boolean; emailOnInterview: boolean; emailOnNewJobs: boolean }
  const [notifPrefs,       setNotifPrefs]       = useState<NotifPrefs>({ emailOnStatusChange: true, emailOnInterview: true, emailOnNewJobs: false });
  const [savingPrefs,      setSavingPrefs]      = useState(false);
  const [prefsSaved,       setPrefsSaved]       = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/candidate/profile')
      .then(r => r.json())
      .then((p: Profile) => { setProfile(p); setName(p.name ?? ''); setPhone(p.phone ?? ''); });
    fetch('/api/candidate/notification-prefs')
      .then(r => r.ok ? r.json() : null)
      .then((d: { prefs?: NotifPrefs } | null) => { if (d?.prefs) setNotifPrefs(d.prefs); });
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
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 1500);
  }, [notifPrefs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return; }
      setProfile(prev => prev ? { ...prev, ...data } : data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';
  const pct = completion(profile);
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
                    ? `Add ${!profile?.phone ? 'phone number' : !profile?.avatar ? 'profile photo' : 'missing info'} to reach 100%`
                    : 'Your profile is fully complete 🎉'}
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {(profile?.name ?? displayName)[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <button
                    disabled
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                    <Camera className="h-4 w-4" /> Upload Photo (coming soon)
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>

              {success && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Profile saved successfully
                </div>
              )}
              {error && (
                <div className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
              )}

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

            {/* Notification Preferences */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bell className="h-4 w-4 text-primary" /> Email Notifications
                </h2>
                {savingPrefs && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                {prefsSaved && <span className="text-xs text-success">Saved ✓</span>}
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

          </div>
        </div>
      </div>
    </div>
  );
}
