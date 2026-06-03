'use client';

import { useEffect } from 'react';

const KEY   = 'kk_recently_viewed';
const LIMIT = 8;

export function RecentlyViewedTracker({ jobId }: { jobId: string }) {
  useEffect(() => {
    // Track in localStorage for recently viewed strip
    try {
      const raw  = localStorage.getItem(KEY);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      const deduped = [jobId, ...list.filter(id => id !== jobId)].slice(0, LIMIT);
      localStorage.setItem(KEY, JSON.stringify(deduped));
    } catch {
      // localStorage unavailable
    }

    // Increment server-side view counter (fire-and-forget)
    fetch(`/api/jobs/${jobId}/view`, { method: 'POST' }).catch(() => {});
  }, [jobId]);

  return null;
}
