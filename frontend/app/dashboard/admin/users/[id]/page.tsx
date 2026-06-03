'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, User, Briefcase, FileText, Mail, Phone, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDetail {
  id: string; name: string; email: string; phone: string | null;
  role: string; isVerified: boolean; createdAt: string;
  avatar: string | null;
  resume: { fileUrl: string; createdAt: string; parsedData: Record<string, unknown> | null } | null;
  company: { id: string; name: string; industry: string | null } | null;
  applications: {
    id: string; status: string; appliedAt: string;
    job: { id: string; title: string };
  }[];
  _count: { applications: number; savedJobs: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const ROLE_STYLES: Record<string, string> = {
  CANDIDATE: 'bg-blue-50 text-blue-700',
  EMPLOYER:  'bg-violet-50 text-violet-700',
  ADMIN:     'bg-primary/10 text-primary',
};

const STATUS_STYLES: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700',
  REVIEWING:   'bg-sky-100 text-sky-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  HIRED:       'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-600',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user,    setUser]    = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: UserDetail) => setUser(d))
      .catch(() => setError('Could not load user.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  if (error || !user) return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">{error || 'User not found.'}</p>
      <Link href="/dashboard/admin/users" className="text-sm text-primary hover:underline">← Back to Users</Link>
    </div>
  );

  const parsedSkills = (user.resume?.parsedData as { skills?: string[] } | null)?.skills ?? [];
  const joined = new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-6">
        <Link
          href="/dashboard/admin/users"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Users
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Profile card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start gap-5">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white ${tileColor(user.name)}`}>
              {user.name[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', ROLE_STYLES[user.role] ?? 'bg-gray-100 text-gray-600')}>
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', user.isVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                  {user.isVerified ? 'Active' : 'Suspended'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" /> {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" /> Joined {joined}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 shrink-0" />
                  <span>ID: <span className="font-mono text-xs">{user.id.slice(0, 8)}…</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-gray-100 pt-5">
            {[
              { label: 'Applications', value: user._count.applications },
              { label: 'Saved Jobs',   value: user._count.savedJobs },
              { label: 'Skills',       value: parsedSkills.length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Resume / Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" /> Resume & Skills
            </h2>
            {user.resume ? (
              <>
                <a
                  href={user.resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                >
                  <FileText className="h-4 w-4" /> View Resume
                </a>
                <p className="mt-2 text-xs text-muted-foreground">
                  Uploaded {new Date(user.resume.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {parsedSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {parsedSkills.map(s => (
                      <span key={s} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No resume uploaded.</p>
            )}

            {user.company && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h3 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" /> Company
                </h3>
                <p className="text-sm font-medium text-foreground">{user.company.name}</p>
                {user.company.industry && (
                  <p className="text-xs text-muted-foreground">{user.company.industry}</p>
                )}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Briefcase className="h-4 w-4 text-primary" /> Recent Applications ({user._count.applications})
            </h2>
            {user.applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            ) : (
              <div className="space-y-2">
                {user.applications.map(app => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
                    <div className="min-w-0">
                      <Link href={`/jobs/${app.job.id}`} target="_blank"
                        className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline">
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={cn('ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold', STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600')}>
                      {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
