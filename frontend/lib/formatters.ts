import { JobType } from '@prisma/client';

// ── Salary ────────────────────────────────────────────────────────────────────

export function formatSalary(
  min?: number | null,
  max?: number | null,
  suffix = ' / yr',
): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`;
  if (min) return `${fmt(min)}+${suffix}`;
  return `Up to ${fmt(max!)}${suffix}`;
}

// ── Time ──────────────────────────────────────────────────────────────────────

export function timeAgo(date: Date | string): string {
  const ms   = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

// ── Tile colour ───────────────────────────────────────────────────────────────

const TILE_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-600',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
] as const;

export function tileColor(name: string): string {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

// ── Job type labels / styles ──────────────────────────────────────────────────

export const TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME:  'Full-time',
  PART_TIME:  'Part-time',
  REMOTE:     'Remote',
  CONTRACT:   'Contract',
  INTERNSHIP: 'Internship',
};

export const TYPE_BADGE: Record<JobType, string> = {
  FULL_TIME:  'bg-green-50 text-green-700 border-green-200',
  PART_TIME:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  REMOTE:     'bg-blue-50 text-blue-700 border-blue-200',
  CONTRACT:   'bg-purple-50 text-purple-700 border-purple-200',
  INTERNSHIP: 'bg-orange-50 text-orange-700 border-orange-200',
};
