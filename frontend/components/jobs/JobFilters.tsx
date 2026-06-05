'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';

const DATE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d',  label: 'Last 3 days' },
  { value: '7d',  label: 'Last 7 days' },
] as const;

const WORK_MODES = [
  { value: 'wfh',   label: 'Work from home' },
  { value: 'wfo',   label: 'Work from office' },
  { value: 'field', label: 'Work from field' },
] as const;

const WORK_TYPES = [
  { value: 'full_time',  label: 'Full time' },
  { value: 'part_time',  label: 'Part time' },
  { value: 'internship', label: 'Internship' },
] as const;

const WORK_SHIFTS = [
  { value: 'day',   label: 'Day shift' },
  { value: 'night', label: 'Night shift' },
] as const;

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
  'Education / Training',
  'Engineering',
  'Finance & Accounting',
  'Healthcare / Pharma',
  'Hospitality',
  'Human Resources',
  'IT / Software',
  'Legal',
  'Marketing / Sales',
  'Operations',
  'Production / Manufacturing',
  'Real Estate',
  'Retail',
  'Security Services',
  'Telecom',
  'Transport / Logistics',
] as const;

const SORT_OPTIONS = [
  { value: 'relevant',   label: 'Relevant' },
  { value: 'salary_desc', label: 'Salary - High to low' },
  { value: 'date_new',   label: 'Date posted - New to Old' },
] as const;

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function JobFilters() {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const [deptSearch,    setDeptSearch]    = useState('');
  const [showMoreDepts, setShowMoreDepts] = useState(false);

  const currentDatePosted = searchParams.get('datePosted') ?? 'all';
  const currentSalaryMin  = Number(searchParams.get('salaryMin') ?? '0');
  const currentWorkModes  = searchParams.get('workMode')?.split(',').filter(Boolean) ?? [];
  const currentWorkTypes  = searchParams.get('workType')?.split(',').filter(Boolean) ?? [];
  const currentShifts     = searchParams.get('shift')?.split(',').filter(Boolean) ?? [];
  const currentDepts      = searchParams.get('department')?.split(',').filter(Boolean) ?? [];
  const currentSort       = searchParams.get('sort') ?? 'relevant';

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const toggleMulti = useCallback(
    (key: string, value: string, current: string[]) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      update(key, next.length > 0 ? next.join(',') : null);
    },
    [update],
  );

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    [
      'datePosted', 'salaryMin', 'workMode', 'workType', 'shift',
      'department', 'sort', 'page', 'type', 'experienceLevel', 'salaryMax',
    ].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters =
    currentDatePosted !== 'all' ||
    currentSalaryMin > 0 ||
    currentWorkModes.length > 0 ||
    currentWorkTypes.length > 0 ||
    currentShifts.length > 0 ||
    currentDepts.length > 0;

  // Salary display (slider 0–150000 monthly)
  const salaryDisplay =
    currentSalaryMin === 0
      ? '₹0'
      : currentSalaryMin >= 100000
      ? `₹${(currentSalaryMin / 100000).toFixed(1)}L`
      : `₹${(currentSalaryMin / 1000).toFixed(0)}K`;

  const filteredDepts = DEPARTMENTS.filter(
    (d) => !deptSearch || d.toLowerCase().includes(deptSearch.toLowerCase()),
  );
  const visibleDepts = showMoreDepts ? filteredDepts : filteredDepts.slice(0, 5);

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="px-5">
          {/* Date Posted */}
          <FilterSection title="Date posted">
            <div className="space-y-2.5">
              {DATE_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="datePosted"
                    value={value}
                    checked={currentDatePosted === value}
                    onChange={() => update('datePosted', value === 'all' ? null : value)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Salary Slider */}
          <FilterSection title="Salary">
            <div>
              <p className="mb-3 text-xs text-muted-foreground">Minimum monthly salary</p>
              {currentSalaryMin > 0 && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                    {salaryDisplay}
                  </span>
                </div>
              )}
              <input
                type="range"
                min={0}
                max={150000}
                step={5000}
                value={currentSalaryMin}
                onChange={(e) =>
                  update('salaryMin', e.target.value === '0' ? null : e.target.value)
                }
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>1.5 Lakhs</span>
              </div>
            </div>
          </FilterSection>

          {/* Work Mode */}
          <FilterSection title="Work Mode">
            <div className="space-y-2.5">
              {WORK_MODES.map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={currentWorkModes.includes(value)}
                    onChange={() => toggleMulti('workMode', value, currentWorkModes)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Work Type */}
          <FilterSection title="Work Type">
            <div className="space-y-2.5">
              {WORK_TYPES.map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={currentWorkTypes.includes(value)}
                    onChange={() => toggleMulti('workType', value, currentWorkTypes)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Work Shift */}
          <FilterSection title="Work Shift">
            <div className="space-y-2.5">
              {WORK_SHIFTS.map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={currentShifts.includes(value)}
                    onChange={() => toggleMulti('shift', value, currentShifts)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Department */}
          <FilterSection title="Department" defaultOpen={false}>
            <div>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-2.5">
                {visibleDepts.map((dept) => (
                  <label key={dept} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={currentDepts.includes(dept)}
                      onChange={() => toggleMulti('department', dept, currentDepts)}
                      className="h-4 w-4 shrink-0 rounded accent-primary"
                    />
                    <span className="line-clamp-1 text-sm text-foreground">{dept}</span>
                  </label>
                ))}
              </div>
              {filteredDepts.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowMoreDepts((v) => !v)}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  {showMoreDepts
                    ? 'Show less ↑'
                    : `Show ${filteredDepts.length - 5} more >`}
                </button>
              )}
            </div>
          </FilterSection>

          {/* Sort By */}
          <FilterSection title="Sort By">
            <div className="space-y-2.5 pb-1">
              {SORT_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="sort"
                    value={value}
                    checked={currentSort === value}
                    onChange={() => update('sort', value === 'relevant' ? null : value)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}
