import Link from 'next/link';
import { StartHiringSection } from './StartHiringSection';

// ── Data ──────────────────────────────────────────────────────────────────────

const FIND_JOBS_CITIES = [
  'Agra', 'Ahmedabad', 'Ahmednagar', 'Ajmer', 'Aligarh', 'Amritsar',
  'Asansol', 'Aurangabad', 'Bareilly', 'Belagavi', 'Bengaluru', 'Bhavnagar',
  'Bhopal', 'Bhubaneswar', 'Chennai', 'Coimbatore', 'Delhi', 'Faridabad',
  'Ghaziabad', 'Gurgaon', 'Hyderabad', 'Indore', 'Jaipur', 'Jalandhar',
  'Jodhpur', 'Kanpur', 'Kolkata', 'Lucknow', 'Ludhiana', 'Mumbai',
  'Mysore', 'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune', 'Rajkot',
  'Surat', 'Thane', 'Vadodara', 'Varanasi', 'Visakhapatnam',
];

const POPULAR_JOBS = [
  { label: 'Delivery Person Jobs',   href: '/jobs?q=delivery' },
  { label: 'Accounts / Finance Jobs', href: '/jobs?q=finance' },
  { label: 'Sales (Field Work)',      href: '/jobs?workMode=field' },
  { label: 'Human Resource',         href: '/jobs?q=human+resource' },
  { label: 'Backoffice Jobs',        href: '/jobs?q=backoffice' },
  { label: 'Business Development',   href: '/jobs?q=business+development' },
  { label: 'Telecaller / BPO',       href: '/jobs?q=telecaller' },
  { label: 'Work from Home Jobs',    href: '/jobs?workMode=wfh' },
  { label: 'Full Time Jobs',         href: '/jobs?workType=full_time' },
  { label: 'Night Shift Jobs',       href: '/jobs?shift=night' },
  { label: 'Part Time Jobs',         href: '/jobs?workType=part_time' },
  { label: 'Freshers Jobs',          href: '/jobs?experienceLevel=FRESHER' },
];

const DEPARTMENTS = [
  'Admin / Back Office / Computer Operator',
  'Advertising / Communication',
  'Aviation & Aerospace',
  'Banking / Insurance / Financial Services',
  'Beauty, Fitness & Personal Care',
  'Construction & Site Engineering',
  'Consulting',
  'Content, Editorial & Journalism',
  'CSR & Social Service',
  'Customer Support',
  'Data Science & Analytics',
  'Delivery / Driver / Logistics',
];

const LINKS = [
  { label: 'Download App',               href: '#' },
  { label: 'Careers',                    href: '/jobs' },
  { label: 'Contact Us',                 href: '/contact' },
];

const LEGAL = [
  { label: 'Privacy Policy',            href: '/privacy' },
  { label: 'User Terms & Conditions',   href: '/terms' },
];

const RESOURCES = [
  { label: 'Sitemap',  href: '/sitemap' },
];

const SOCIAL = [
  { label: 'Facebook',  href: '#', icon: 'f' },
  { label: 'LinkedIn',  href: '#', icon: 'in' },
  { label: 'Twitter',   href: '#', icon: '𝕏' },
  { label: 'Instagram', href: '#', icon: '◎' },
  { label: 'YouTube',   href: '#', icon: '▶' },
];

// ── Section with expandable content ─────────────────────────────────────────

function FooterSection({
  title,
  items,
  hrefPrefix = '',
  suffix = 'Jobs',
  initialCount = 12,
}: {
  title: string;
  items: string[];
  hrefPrefix: string;
  suffix?: string;
  initialCount?: number;
}) {
  return (
    <div className="border-b border-gray-200 py-8">
      <h3 className="text-base font-semibold text-gray-900 mb-5">{title}</h3>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
        {items.slice(0, initialCount).map((city) => (
          <Link
            key={city}
            href={`${hrefPrefix}${encodeURIComponent(city)}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {suffix ? `${suffix} in ${city}` : city}
          </Link>
        ))}
      </div>
      {items.length > initialCount && (
        <Link
          href="/jobs"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          View more ↓
        </Link>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Find Jobs */}
        <FooterSection
          title="Find Jobs"
          items={FIND_JOBS_CITIES}
          hrefPrefix="/jobs?location="
          suffix="Jobs"
        />

        {/* Start Hiring */}
        <StartHiringSection cities={FIND_JOBS_CITIES} />

        {/* Popular Jobs */}
        <div className="border-b border-gray-200 py-8">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Popular Jobs</h3>
          <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
            {POPULAR_JOBS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Jobs by Department */}
        <div className="border-b border-gray-200 py-8">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Jobs by Department</h3>
          <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept}
                href={`/jobs?department=${encodeURIComponent(dept)}`}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {dept}
              </Link>
            ))}
          </div>
          <Link
            href="/jobs"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            View more ↓
          </Link>
        </div>

        {/* Links / Legal / Resources */}
        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Links</h3>
            <ul className="space-y-3">
              {LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              {LEGAL.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              {RESOURCES.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Dark bottom bar */}
      <div className="bg-[#1a1a2e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top strip: social + app download */}
          <div className="flex flex-col gap-8 py-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: logo + social */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007a5a]">
                  <span className="text-white font-bold text-sm">KK</span>
                </div>
                <span className="text-lg font-bold text-white">KaamKaaj</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">Follow us on social media</p>
              <div className="flex gap-2">
                {SOCIAL.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-300 transition-colors hover:bg-[#007a5a] hover:text-white"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: app download */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm font-semibold text-white mb-1">Apply on the go</p>
              <p className="text-xs text-slate-400 mb-4">Get real time job updates on our App</p>
              <div className="flex gap-3">
                <div
                  title="Coming soon"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] border border-white/10 px-4 py-2 text-white cursor-default"
                >
                  <span className="text-lg">🍎</span>
                  <div>
                    <p className="text-[9px] leading-none text-slate-400">Download on the</p>
                    <p className="text-xs font-bold leading-tight">App Store</p>
                  </div>
                </div>
                <div
                  title="Coming soon"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] border border-white/10 px-4 py-2 text-white cursor-default"
                >
                  <span className="text-lg">▶</span>
                  <div>
                    <p className="text-[9px] leading-none text-slate-400">Get it on</p>
                    <p className="text-xs font-bold leading-tight">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom copyright strip */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-500 sm:flex-row">
            <p>© 2026 KaamKaaj | All rights reserved</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">KaamKaaj Advantage T&C</Link>
              <Link href="#" className="hover:text-slate-300 transition-colors">Rewards T&C</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
