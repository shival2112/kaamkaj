'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Users, Calendar,
  Columns2, LogOut, Menu, Globe, Plus,
} from 'lucide-react';

const NAV = [
  { href: '/recruiter/dashboard',    label: 'Overview',     icon: LayoutDashboard },
  { href: '/recruiter/jobs',         label: 'Jobs',         icon: Briefcase },
  { href: '/recruiter/applications', label: 'Candidates',   icon: Users },
  { href: '/recruiter/interviews',   label: 'Interviews',   icon: Calendar },
  { href: '/recruiter/pipeline',     label: 'Pipeline',     icon: Columns2 },
];

interface RecruiterInfo { name: string; companyName: string }

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [info, setInfo] = useState<RecruiterInfo>({ name: 'Recruiter', companyName: '' });

  useEffect(() => {
    const sb = createSupabaseClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setInfo({
          name:        (user.user_metadata?.name as string) ?? user.email ?? 'Recruiter',
          companyName: '',
        });
      }
    });
  }, []);

  const initials = info.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'RC';

  const handleLogout = async () => {
    try { await createSupabaseClient().auth.signOut(); } catch { /* ignore */ }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col bg-[#5B5BD6] text-white">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{info.name}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-200">Recruiter</p>
          </div>
        </div>

        <Link
          href="/recruiter/jobs?new=1"
          onClick={onLinkClick}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/30"
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (label !== 'Overview' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              onClick={onLinkClick}
              className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-indigo-100 text-indigo-700' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/20 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function RecruiterShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="hidden w-64 shrink-0 overflow-hidden lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 overflow-hidden">
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 lg:flex">
          <p className="text-sm font-semibold text-gray-700">Recruiter Portal</p>
          <Link href="/" aria-label="Visit website"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary">
            <Globe className="h-5 w-5" />
          </Link>
        </header>

        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-gray-900">Recruiter Portal</span>
          </div>
          <Link href="/" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <Globe className="h-5 w-5" />
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
