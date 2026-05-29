'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const JOB_TYPES = [
  { value: 'FULL_TIME',   label: 'Full-time' },
  { value: 'PART_TIME',   label: 'Part-time' },
  { value: 'REMOTE',      label: 'Remote' },
  { value: 'CONTRACT',    label: 'Contract' },
  { value: 'INTERNSHIP',  label: 'Internship' },
] as const;

const SALARY_RANGES = [
  { label: 'Under ₹3L',     min: '0',      max: '300000' },
  { label: '₹3L – ₹6L',    min: '300000', max: '600000' },
  { label: '₹6L – ₹12L',   min: '600000', max: '1200000' },
  { label: '₹12L – ₹25L',  min: '1200000', max: '2500000' },
  { label: '₹25L+',        min: '2500000', max: '' },
] as const;

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType     = searchParams.get('type') ?? '';
  const currentLocation = searchParams.get('location') ?? '';
  const currentSalMin   = searchParams.get('salaryMin') ?? '';
  const currentSalMax   = searchParams.get('salaryMax') ?? '';

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page'); // reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['type', 'location', 'salaryMin', 'salaryMax', 'page'].forEach(k => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = currentType || currentLocation || currentSalMin || currentSalMax;

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0">
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
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

        {/* Job Type */}
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Job Type
          </p>
          <div className="space-y-2">
            {JOB_TYPES.map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={currentType === value}
                  onChange={() => update('type', currentType === value ? '' : value)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Location
          </p>
          <input
            type="text"
            placeholder="City or 'Remote'"
            value={currentLocation}
            onChange={e => update('location', e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Salary Range */}
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Salary Range
          </p>
          <div className="space-y-2">
            {SALARY_RANGES.map(({ label, min, max }) => {
              const isActive = currentSalMin === min && currentSalMax === max;
              return (
                <label key={label} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="salary"
                    checked={isActive}
                    onChange={() => {
                      if (isActive) {
                        update('salaryMin', '');
                        update('salaryMax', '');
                      } else {
                        const params = new URLSearchParams(searchParams.toString());
                        if (min) params.set('salaryMin', min); else params.delete('salaryMin');
                        if (max) params.set('salaryMax', max); else params.delete('salaryMax');
                        params.delete('page');
                        router.push(`${pathname}?${params.toString()}`);
                      }
                    }}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
