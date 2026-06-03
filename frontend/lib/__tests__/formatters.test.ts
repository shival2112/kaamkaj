import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatSalary, tileColor, timeAgo } from '../formatters';

// ── formatSalary ───────────────────────────────────────────────────────────────

describe('formatSalary()', () => {
  it('returns null when both min and max are missing', () => {
    expect(formatSalary()).toBeNull();
    expect(formatSalary(null, null)).toBeNull();
  });

  it('formats a range in lakhs', () => {
    expect(formatSalary(500000, 1000000)).toBe('₹5L – ₹10L / yr');
  });

  it('formats a range in thousands', () => {
    expect(formatSalary(30000, 60000)).toBe('₹30K – ₹60K / yr');
  });

  it('formats min-only with a + suffix', () => {
    expect(formatSalary(600000, null)).toBe('₹6L+ / yr');
  });

  it('formats max-only with "Up to"', () => {
    expect(formatSalary(null, 800000)).toBe('Up to ₹8L / yr');
  });

  it('accepts a custom suffix', () => {
    expect(formatSalary(500000, 1000000, '')).toBe('₹5L – ₹10L');
  });
});

// ── tileColor ─────────────────────────────────────────────────────────────────

describe('tileColor()', () => {
  const VALID_COLORS = [
    'bg-blue-500', 'bg-violet-500', 'bg-green-600',
    'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];

  it('always returns one of the 7 palette colours', () => {
    ['TechNova', 'CreditBay', 'RetailCo', 'A', 'XYZ Corp'].forEach(name => {
      expect(VALID_COLORS).toContain(tileColor(name));
    });
  });

  it('is deterministic for the same name', () => {
    expect(tileColor('TechNova')).toBe(tileColor('TechNova'));
  });

  it('produces different colours for different names (collision check)', () => {
    const colours = new Set(['TechNova', 'CreditBay', 'RetailCo', 'Google', 'Zomato']
      .map(tileColor));
    // At least 2 distinct colours for 5 distinct names
    expect(colours.size).toBeGreaterThan(1);
  });
});

// ── timeAgo ───────────────────────────────────────────────────────────────────

describe('timeAgo()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  it('returns "Just now" for dates < 1 min ago', () => {
    expect(timeAgo(new Date('2025-06-01T11:59:30Z'))).toBe('Just now');
  });

  it('returns minutes for dates < 1 hour ago', () => {
    expect(timeAgo(new Date('2025-06-01T11:45:00Z'))).toBe('15m ago');
  });

  it('returns hours for dates < 1 day ago', () => {
    expect(timeAgo(new Date('2025-06-01T09:00:00Z'))).toBe('3h ago');
  });

  it('returns "Yesterday" for dates ~24h ago', () => {
    expect(timeAgo(new Date('2025-05-31T12:00:00Z'))).toBe('Yesterday');
  });

  it('returns days for dates < 1 week ago', () => {
    expect(timeAgo(new Date('2025-05-28T12:00:00Z'))).toBe('4 days ago');
  });

  it('returns weeks for older dates', () => {
    expect(timeAgo(new Date('2025-05-18T12:00:00Z'))).toBe('2 weeks ago');
  });

  it('accepts a string date', () => {
    expect(timeAgo('2025-06-01T11:59:30Z')).toBe('Just now');
  });
});
