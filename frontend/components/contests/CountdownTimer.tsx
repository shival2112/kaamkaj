'use client';

import { useState, useEffect } from 'react';

const DAY_MS = 86_400_000;

interface Props {
  deadline: string;
}

function getRemaining(deadline: string): string | null {
  const diff = new Date(deadline).getTime() - Date.now();
  // Only show countdown if within the next 24 hours
  if (diff <= 0 || diff > DAY_MS) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CountdownTimer({ deadline }: Props) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(getRemaining(deadline));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!time) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
      ⏱ Registration Ends in {time}
    </span>
  );
}
