'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, X } from 'lucide-react';

const STORAGE_KEY = 'kaamkaaj_search_history';
const MAX_HISTORY = 5;

function getHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function saveSearch(q: string) {
  const history = getHistory().filter(h => h !== q);
  history.unshift(q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function removeSearch(q: string) {
  const history = getHistory().filter(h => h !== q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function SearchHistoryChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<string[]>([]);
  const activeQ = searchParams.get('q')?.trim();

  useEffect(() => {
    const q = searchParams.get('q')?.trim();
    if (q) saveSearch(q);
    setHistory(getHistory());
  }, [searchParams]);

  if (history.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> Recent:
      </span>
      {history.map(q => (
        <div key={q} className="group flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs transition-colors hover:border-primary hover:bg-primary/5">
          <a href={`/jobs?q=${encodeURIComponent(q)}`} className="font-medium text-foreground group-hover:text-primary">
            {q}
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              removeSearch(q);
              setHistory(getHistory());
              if (q === activeQ) router.push('/jobs');
            }}
            className="ml-0.5 text-gray-400 hover:text-danger"
            aria-label={`Remove ${q} from history`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
