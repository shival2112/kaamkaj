'use client';

import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/ui/SearchBar';

export function HeroSearch() {
  const router = useRouter();

  const handleSearch = (query: string, location: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return <SearchBar onSearch={handleSearch} />;
}
