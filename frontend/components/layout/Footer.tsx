import Link from 'next/link';
import { Briefcase } from 'lucide-react';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
  ],
  'Job Seekers': [
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'Upload Resume', href: '/dashboard/candidate' },
    { label: 'Job Alerts', href: '/alerts' },
    { label: 'Saved Jobs', href: '/dashboard/candidate' },
    { label: 'Interview Tips', href: '/resources' },
  ],
  Employers: [
    { label: 'Post a Job', href: '/signup?role=employer' },
    { label: 'Find Candidates', href: '/employer/candidates' },
    { label: 'Employer Dashboard', href: '/dashboard/employer' },
    { label: 'Pricing', href: '/pricing' },
  ],
} as const;

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: 'f' },
  { label: 'Twitter', href: '#', icon: '𝕏' },
  { label: 'LinkedIn', href: '#', icon: 'in' },
  { label: 'Instagram', href: '#', icon: '◎' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0F172A] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">KaamKaaj</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              India&apos;s growing job platform connecting talented professionals
              with amazing opportunities. Free to use. Always.
            </p>

            {/* Social */}
            <div className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-300 transition-colors hover:bg-primary hover:text-white"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-sm sm:flex-row">
          <p className="text-slate-500">© 2026 KaamKaaj. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-slate-500 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-500 transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="text-slate-500 transition-colors hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
