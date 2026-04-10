import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className utility)', () => {
  it('merges classNames correctly', () => {
    const result = cn('bg-white', 'text-black');
    expect(result).toBe('bg-white text-black');
  });

  it('handles conditional classNames', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).toBe('base visible');
  });

  it('handles tailwind merge conflicts', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });
});
