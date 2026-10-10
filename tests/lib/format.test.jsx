import { describe, expect, it } from 'vitest';
import { formatDate } from '@/lib/format';

describe('formatDate', () => {
  it('formats an ISO date with the default options', () => {
    expect(formatDate('2026-09-01T12:00:00Z')).toBe('Sep 1');
  });

  it('returns the fallback for a missing value', () => {
    expect(formatDate(null)).toBe('Latest');
  });

  it('returns the fallback for an unparseable value', () => {
    expect(formatDate('not a date', undefined, 'Unknown')).toBe('Unknown');
  });
});
