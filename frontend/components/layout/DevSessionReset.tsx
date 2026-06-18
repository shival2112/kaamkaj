'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'kk_dev_server_session';

// Only included in the layout in development (tree-shaken in production builds).
// On every page load it calls /api/dev/session, which returns a timestamp set
// once per Node.js process. If the stored value differs from the current one,
// a new `npm run dev` has started → sign out Supabase + redirect to home so the
// developer always begins from a clean (logged-out) state.
export function DevSessionReset() {
  useEffect(() => {
    fetch('/api/dev/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { sessionId: string } | null) => {
        if (!data?.sessionId) return;

        const stored = localStorage.getItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, data.sessionId);

        if (stored && stored !== data.sessionId) {
          // New server process detected — clear Supabase session and go home.
          import('@/lib/supabase').then(({ createSupabaseClient }) => {
            createSupabaseClient()
              .auth.signOut()
              .finally(() => {
                window.location.replace('/');
              });
          });
        }
      })
      .catch(() => {
        // Network error during HMR restart — ignore, do not log out.
      });
  }, []);

  return null;
}
