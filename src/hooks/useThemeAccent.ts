/**
 * useThemeAccent
 * Controls the site-wide accent color by updating CSS custom properties on :root.
 * Persists the selected color in localStorage so it survives page reloads.
 */
import { useState, useCallback, useEffect } from 'react';

export interface AccentTheme {
  id: string;
  label: string;
  color: string;      // hex — fills rings, buttons, glows
  light: string;      // rgba with low alpha — tinted backgrounds
  ring: string;       // rgba ring border
  scrollbar: string;  // scrollbar thumb
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: 'rose',
    label: 'Rosa',
    color: '#E85A70',
    light: 'rgba(232, 90, 112, 0.12)',
    ring: 'rgba(232, 90, 112, 0.28)',
    scrollbar: '#BE123C',
  },
  {
    id: 'blue',
    label: 'Azul',
    color: '#3B82F6',
    light: 'rgba(59, 130, 246, 0.12)',
    ring: 'rgba(59, 130, 246, 0.28)',
    scrollbar: '#2563EB',
  },
  {
    id: 'green',
    label: 'Verde',
    color: '#10B981',
    light: 'rgba(16, 185, 129, 0.12)',
    ring: 'rgba(16, 185, 129, 0.28)',
    scrollbar: '#059669',
  },
  {
    id: 'amber',
    label: 'Dourado',
    color: '#F59E0B',
    light: 'rgba(245, 158, 11, 0.12)',
    ring: 'rgba(245, 158, 11, 0.28)',
    scrollbar: '#D97706',
  },
  {
    id: 'purple',
    label: 'Roxo',
    color: '#8B5CF6',
    light: 'rgba(139, 92, 246, 0.12)',
    ring: 'rgba(139, 92, 246, 0.28)',
    scrollbar: '#7C3AED',
  },
  {
    id: 'pink',
    label: 'Pink',
    color: '#EC4899',
    light: 'rgba(236, 72, 153, 0.12)',
    ring: 'rgba(236, 72, 153, 0.28)',
    scrollbar: '#DB2777',
  },
];

const STORAGE_KEY = 'lume-accent-id';

function applyTheme(theme: AccentTheme) {
  const root = document.documentElement;
  root.style.setProperty('--lume-accent', theme.color);
  root.style.setProperty('--lume-accent-light', theme.light);
  root.style.setProperty('--lume-accent-ring', theme.ring);
  // Update scrollbar live
  root.style.setProperty('--lume-scrollbar', theme.scrollbar);
  // Update scrollbar meta color
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.color);
}

export function useThemeAccent() {
  const savedId = typeof window !== 'undefined'
    ? (localStorage.getItem(STORAGE_KEY) ?? 'rose')
    : 'rose';

  const initial = ACCENT_THEMES.find(t => t.id === savedId) ?? ACCENT_THEMES[0];
  const [active, setActive] = useState<AccentTheme>(initial);

  // Apply on first mount
  useEffect(() => {
    applyTheme(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((theme: AccentTheme) => {
    setActive(theme);
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme.id);
  }, []);

  return { active, themes: ACCENT_THEMES, setTheme };
}
