'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ElementType, ReactNode } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Bookmark,
  User,
  LogOut,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavItem = {
  href: string;
  label: string;
  icon: ElementType;
  badge?: number;
};

export type SidebarNavSection = {
  label: string;
  items: NavItem[];
};

// Default candidate nav — used when navSections prop is omitted
const DEFAULT_NAV_SECTIONS: SidebarNavSection[] = [
  {
    label: 'For You',
    items: [
      { href: '/dashboard',              label: 'Dashboard',       icon: LayoutDashboard },
      { href: '/dashboard/applications', label: 'My Applications', icon: ClipboardList },
      { href: '/dashboard/saved',        label: 'Saved Jobs',      icon: Bookmark },
      { href: '/dashboard/profile',      label: 'My Profile',      icon: User },
    ],
  },
];

interface DashboardSidebarProps {
  displayName: string;
  role: string;
  onLogout: () => void;
  /** Override the primary CTA button label. Defaults to "Quick Apply". */
  primaryButtonLabel?: string;
  /** Override the primary CTA button icon. Defaults to Zap. */
  primaryButtonIcon?: ElementType;
  onPrimaryButton?: () => void;
  /** Override the full nav structure. Defaults to candidate nav. */
  navSections?: SidebarNavSection[];
}

export function DashboardSidebar({
  displayName,
  role,
  onLogout,
  primaryButtonLabel = 'Quick Apply',
  primaryButtonIcon: PrimaryIcon = Zap,
  onPrimaryButton,
  navSections = DEFAULT_NAV_SECTIONS,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const initials =
    displayName
      .split(' ')
      .map((w) => w[0] ?? '')
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  const lastIdx = navSections.length - 1;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
        <Image src="/logo.svg" alt="KaamKaaj logo" width={32} height={32} priority />
        <span className="text-xl font-bold tracking-tight">
          <span className="text-[#007a5a]">Kaam</span>
          <span className="text-foreground">Kaaj</span>
        </span>
      </div>

      {/* User info + primary CTA */}
      <div className="flex flex-col items-center gap-2 border-b border-gray-100 px-5 py-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
          {initials}
        </div>
        <p className="text-sm font-semibold text-foreground">{displayName}</p>
        <p className="text-xs capitalize text-muted-foreground">{role.toLowerCase()}</p>
        <button
          onClick={onPrimaryButton}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <PrimaryIcon className="h-4 w-4" />
          {primaryButtonLabel}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, i) => (
          <NavSection
            key={section.label}
            label={section.label}
            items={section.items}
            pathname={pathname}
            className={i > 0 ? 'mt-5' : undefined}
          >
            {/* Logout button appended inside the last section */}
            {i === lastIdx && (
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            )}
          </NavSection>
        ))}
      </nav>

      {/* Help footer */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
          <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">Need help?</p>
            <p className="text-xs text-muted-foreground">Chat with us</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  pathname,
  className,
  children,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map(({ href, label: name, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{name}</span>
              {badge !== undefined && (
                <span
                  className={cn(
                    'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                    isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        {children}
      </div>
    </div>
  );
}
