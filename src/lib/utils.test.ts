import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combina nomes de classe', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('descarta classes condicionais falsas', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('resolve conflitos de classes Tailwind (última vence)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('ignora undefined e null', () => {
    expect(cn('foo', undefined, null as unknown as string, 'bar')).toBe('foo bar');
  });

  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('');
  });

  it('suporta sintaxe de objeto', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('suporta sintaxe de array', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('remove classes duplicadas do Tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('combina variantes de margem corretamente', () => {
    expect(cn('mt-2', 'mt-4')).toBe('mt-4');
  });
});
