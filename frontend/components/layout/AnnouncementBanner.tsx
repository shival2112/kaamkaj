'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const COLOR_CLASSES: Record<string, string> = {
  blue:  'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  amber: 'bg-amber-500 text-white',
  red:   'bg-red-500 text-white',
};

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<{ text: string; color: string } | null>(null);
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    fetch('/api/admin/announcements')
      .then(r => r.ok ? r.json() : null)
      .then((d: { active?: boolean; text?: string; color?: string } | null) => {
        if (!d?.active || !d.text?.trim()) return;
        const key = `announcement_dismissed_${d.text}`;
        if (sessionStorage.getItem(key)) return;
        setBanner({ text: d.text, color: d.color ?? 'blue' });
        setDismissed(false);
      })
      .catch(() => {/* non-fatal */});
  }, []);

  if (dismissed || !banner) return null;

  const cls = COLOR_CLASSES[banner.color] ?? COLOR_CLASSES.blue;

  const dismiss = () => {
    const key = `announcement_dismissed_${banner.text}`;
    sessionStorage.setItem(key, '1');
    setDismissed(true);
  };

  return (
    <div className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium ${cls}`}>
      <span className="flex-1 text-center">{banner.text}</span>
      <button onClick={dismiss} className="shrink-0 rounded p-0.5 hover:bg-black/10 transition-colors" aria-label="Dismiss">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
