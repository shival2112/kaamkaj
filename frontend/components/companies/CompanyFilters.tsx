'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const INDUSTRIES = [
  'Software & IT Services',
  'Banking & Finance',
  'Retail & E-commerce',
  'Healthcare',
  'Manufacturing',
  'Education',
  'Consulting',
] as const;

const SIZES = [
  { value: '1-10',    label: '1–10 employees' },
  { value: '11-50',   label: '11–50 employees' },
  { value: '51-200',  label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+',    label: '500+ employees' },
] as const;

export function CompanyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get('industry') ?? '';
  const currentSize     = searchParams.get('size') ?? '';

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['industry', 'size', 'page'].forEach(k => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = currentIndustry || currentSize;

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

        {/* Industry */}
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Industry
          </p>
          <div className="space-y-2">
            {INDUSTRIES.map((ind) => (
              <label key={ind} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="industry"
                  value={ind}
                  checked={currentIndustry === ind}
                  onChange={() => update('industry', currentIndustry === ind ? '' : ind)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-foreground">{ind}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company Size */}
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Company Size
          </p>
          <div className="space-y-2">
            {SIZES.map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="size"
                  value={value}
                  checked={currentSize === value}
                  onChange={() => update('size', currentSize === value ? '' : value)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
