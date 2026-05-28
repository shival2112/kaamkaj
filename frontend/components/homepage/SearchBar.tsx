'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-border sm:flex-row sm:items-center">
      {/* Job title */}
      <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/30 transition-colors">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Job title, keywords, or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Divider — desktop only */}
      <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

      {/* Location */}
      <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/30 transition-colors">
        <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
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
      <Button
        onClick={handleSearch}
        size="lg"
        className="w-full rounded-xl px-8 text-sm font-semibold sm:w-auto"
      >
        Search Jobs
      </Button>
    </div>
  );
}
