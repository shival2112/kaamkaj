import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('filters falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, 'baz')).toBe('foo baz');
  });

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });
});
