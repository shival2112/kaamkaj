import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Briefcase, Building2, GraduationCap, Trophy, BookOpen, FileText,
  Phone, Shield, ScrollText,
} from 'lucide-react';
import { SitemapAccountSection } from '@/components/sitemap/SitemapAccountSection';

export const metadata: Metadata = {
  title: 'Sitemap | KaamKaaj',
  description: 'Browse all major sections of KaamKaaj — jobs, companies, job prep, and more.',
};

interface SitemapLink {
  label: string;
  href: string;
  icon: typeof Briefcase;
}

interface SitemapGroup {
  title: string;
  links: SitemapLink[];
}

const GROUPS: SitemapGroup[] = [
  {
    title: 'For Candidates',
    links: [
      { label: 'Browse Jobs',     href: '/jobs',         icon: Briefcase },
      { label: 'Companies',      href: '/companies',    icon: Building2 },
      { label: 'Job Prep',       href: '/job-prep',      icon: BookOpen },
      { label: 'Contests',       href: '/contests',      icon: Trophy },
      { label: 'Degree Programs', href: '/degree',       icon: GraduationCap },
      { label: 'Resume Tools',   href: '/resume-tools',  icon: FileText },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact Us',           href: '/contact', icon: Phone },
      { label: 'Privacy Policy',       href: '/privacy', icon: Shield },
      { label: 'Terms & Conditions',   href: '/terms',   icon: ScrollText },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Sitemap</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A quick overview of every major section on KaamKaaj.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{GROUPS[0].title}</h2>
            <ul className="mt-3 space-y-2.5">
              {GROUPS[0].links.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reflects real auth state — shows Dashboard instead of Login/Sign Up once logged in */}
          <SitemapAccountSection />

          <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{GROUPS[1].title}</h2>
            <ul className="mt-3 space-y-2.5">
              {GROUPS[1].links.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
