'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // Dev mode: kill any active SW and wipe its caches so stale CSS/JS never
      // intercepts Next.js asset requests. If an active SW was found, auto-reload
      // so this navigation gets fresh (un-cached) styles immediately.
      Promise.all([
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => Promise.all(regs.map((r) => r.unregister()))),
        typeof caches !== 'undefined'
          ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          : Promise.resolve([] as boolean[]),
      ]).then(([unregResults]) => {
        const hadActiveSW = (unregResults as boolean[]).some(Boolean);
        if (hadActiveSW) window.location.reload();
      });
      return;
    }

    // Production only: register the SW.
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] registered, scope:', reg.scope))
      .catch((err) => console.error('[SW] registration failed:', err));
  }, []);

  return null;
}
