'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  initialQuery?: string;
  initialLocation?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  initialQuery = '',
  initialLocation = '',
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSearch = () => onSearch(query.trim(), location.trim());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-border sm:flex-row sm:items-center',
        className
      )}
    >
      {/* Job title input */}
      <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-secondary">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Job title, keywords, or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Vertical divider — desktop only */}
      <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

      {/* Location input */}
      <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-secondary">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="City, state, or 'Remote'"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="w-full rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:w-auto"
      >
        Search Jobs
      </button>
    </div>
  );
}
