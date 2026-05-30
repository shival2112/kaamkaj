'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Briefcase, MapPin, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const EXPERIENCE_OPTIONS = [
  'Fresher (0 years)',
  '1 year',
  '2 years',
  '3 years',
  '4 years',
  '5 years',
  '6–10 years',
  '10+ years',
] as const;

export function ApnaSearchBar() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [expOpen, setExpOpen] = useState(false);
  const expRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (expRef.current && !expRef.current.contains(e.target as Node)) {
        setExpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [expOpen]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (jobTitle) params.set('q', jobTitle);
    if (experience) params.set('exp', experience);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-lg ring-1 ring-gray-200">
      {/* Job title */}
      <div className="flex items-center gap-3 flex-1 px-4 py-3.5 border-b lg:border-b-0 lg:border-r border-gray-200">
        <Search className="h-5 w-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search jobs by title..."
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Experience dropdown */}
      <div className="relative" ref={expRef}>
        <button
          type="button"
          onClick={() => setExpOpen((v) => !v)}
          className="flex items-center gap-3 w-full lg:w-52 px-4 py-3.5 border-b lg:border-b-0 lg:border-r border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Briefcase className="h-5 w-5 text-gray-400 shrink-0" />
          <span
            className={cn(
              'flex-1 text-sm text-left truncate',
              experience ? 'text-[#1a1a1a]' : 'text-gray-400'
            )}
          >
            {experience || 'Your Experience'}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-150',
              expOpen && 'rotate-180'
            )}
          />
        </button>

        {expOpen && (
          <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setExperience(opt);
                  setExpOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-3 flex-1 px-4 py-3.5 border-b lg:border-b-0 border-gray-200">
        <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search for an area..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Search button */}
      <button
        type="button"
        onClick={handleSearch}
        className="w-full lg:w-auto px-8 py-3.5 bg-[#007a5a] text-white text-sm font-semibold hover:bg-[#006a4e] transition-colors rounded-b-xl lg:rounded-b-none lg:rounded-r-xl"
      >
        Search jobs
      </button>
    </div>
  );
}
