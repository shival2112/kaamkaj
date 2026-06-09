'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Briefcase, FileBarChart, Calendar, UserPlus, Activity,
  Building2, Star, Settings, UserCheck, UserCog,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';

const ADMIN_NAV: SidebarNavSection[] = [
  {
    label: 'Platform',
    items: [
      { href: '/dashboard/admin',           label: 'Overview',   icon: LayoutDashboard },
      { href: '/dashboard/admin/jobs',      label: 'Jobs',       icon: Briefcase },
      { href: '/dashboard/admin/meetings',  label: 'Meetings',   icon: Calendar },
      { href: '/dashboard/admin/companies', label: 'Companies',  icon: Building2 },
      { href: '/dashboard/admin/reviews',   label: 'Reviews',    icon: Star },
      { href: '/dashboard/admin/reports',   label: 'Reports',    icon: FileBarChart },
      { href: '/dashboard/admin/activity',  label: 'Activity',   icon: Activity },
      { href: '/dashboard/admin/settings',  label: 'Settings',   icon: Settings },
    ],
  },
  {
    label: 'Users',
    items: [
      { href: '/dashboard/admin/users',            label: 'All Users',  icon: Users },
      { href: '/dashboard/admin/users/candidates', label: 'Candidates', icon: UserCheck },
      { href: '/dashboard/admin/users/employers',  label: 'Employers',  icon: UserCog },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (userRole !== 'ADMIN') router.replace(
        userRole === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard'
      );
    }
  }, [user, isLoading, userRole, router]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'Admin';

  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser();
    router.push('/');
  };

  if (isLoading || !user || userRole !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        displayName={displayName}
        role="Admin"
        onLogout={handleLogout}
        primaryButtonLabel="Add User"
        primaryButtonIcon={UserPlus}
        onPrimaryButton={() => router.push('/dashboard/admin/users')}
        navSections={ADMIN_NAV}
      />
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {children}
      </div>
    </div>
  );
}
