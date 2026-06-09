import { prisma } from './prisma';

const CACHE_TTL_MS = 30_000; // 30 s cache to avoid per-request DB hits
let cache: { data: Record<string, string>; ts: number } | null = null;

export async function getSiteSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cache && now - cache.ts < CACHE_TTL_MS) return cache.data;

  try {
    const rows = await prisma.siteSetting.findMany();
    const data = Object.fromEntries(rows.map(r => [r.key, r.value]));
    cache = { data, ts: now };
    return data;
  } catch {
    return cache?.data ?? {};
  }
}

export function invalidateSettingsCache() {
  cache = null;
}

export async function isMaintenanceMode(): Promise<boolean> {
  const s = await getSiteSettings();
  return s['maintenance_mode'] === 'true';
}

export async function getMaxApplicationsPerDay(): Promise<number> {
  const s = await getSiteSettings();
  const v = Number(s['max_applications_per_day']);
  return Number.isFinite(v) && v > 0 ? v : 10;
}
