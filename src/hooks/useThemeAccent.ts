/**
 * useThemeAccent
 * Swaps the site-wide accent by:
 *  1. Injecting a <style> tag that overrides every hardcoded Tailwind #E85A70 class
 *  2. Setting CSS custom properties on :root
 *  3. Firing a custom DOM event so ThemeTransition can play its ripple animation
 */
import { useState, useCallback, useEffect } from 'react';

export interface AccentTheme {
  id: string;
  label: string;
  color: string;      // hex
  light: string;      // rgba low-alpha  (for tinted backgrounds)
  ring: string;       // rgba ring border
  scrollbar: string;  // scrollbar hover
}

export const ACCENT_THEMES: AccentTheme[] = [
  { id: 'rose',   label: 'Rosa',    color: '#E85A70', light: 'rgba(232,90,112,0.12)',  ring: 'rgba(232,90,112,0.28)',  scrollbar: '#BE123C' },
  { id: 'blue',   label: 'Azul',    color: '#3B82F6', light: 'rgba(59,130,246,0.12)',  ring: 'rgba(59,130,246,0.28)',  scrollbar: '#2563EB' },
  { id: 'green',  label: 'Verde',   color: '#10B981', light: 'rgba(16,185,129,0.12)',  ring: 'rgba(16,185,129,0.28)',  scrollbar: '#059669' },
  { id: 'amber',  label: 'Dourado', color: '#F59E0B', light: 'rgba(245,158,11,0.12)',  ring: 'rgba(245,158,11,0.28)',  scrollbar: '#D97706' },
  { id: 'purple', label: 'Roxo',    color: '#8B5CF6', light: 'rgba(139,92,246,0.12)',  ring: 'rgba(139,92,246,0.28)',  scrollbar: '#7C3AED' },
  { id: 'pink',   label: 'Pink',    color: '#EC4899', light: 'rgba(236,72,153,0.12)',  ring: 'rgba(236,72,153,0.28)',  scrollbar: '#DB2777' },
];

const STORAGE_KEY = 'lume-accent-id';
const STYLE_ID    = 'lume-dynamic-theme';

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function buildCSS(theme: AccentTheme): string {
  const [r, g, b] = hexToRgb(theme.color);
  const c = theme.color;
  const rRgb = (a: number) => `rgb(${r} ${g} ${b} / ${a})`;

  return `
:root {
  --lume-accent: ${c};
  --lume-accent-light: ${theme.light};
  --lume-accent-ring: ${theme.ring};
  --lume-scrollbar: ${theme.scrollbar};
}

/* ── Tailwind arbitrary-value overrides ──────────────────── */
.text-\\[\\#E85A70\\]               { color: ${c} !important; }
.bg-\\[\\#E85A70\\]                 { background-color: ${c} !important; }
.border-\\[\\#E85A70\\]             { border-color: ${c} !important; }
.ring-\\[\\#E85A70\\]               { --tw-ring-color: ${c} !important; }
.from-\\[\\#E85A70\\]               { --tw-gradient-from: ${c} var(--tw-gradient-from-position) !important; }
.to-\\[\\#E85A70\\]                 { --tw-gradient-to: ${c} var(--tw-gradient-to-position) !important; }
.to-\\[\\#ff7a8e\\]                 { --tw-gradient-to: ${c} var(--tw-gradient-to-position) !important; }
.to-\\[\\#ff8a9b\\]                 { --tw-gradient-to: ${c} var(--tw-gradient-to-position) !important; }
.outline-\\[\\#E85A70\\]            { outline-color: ${c} !important; }

/* opacity variants */
.bg-\\[\\#E85A70\\]\\/5             { background-color: ${rRgb(0.05)} !important; }
.bg-\\[\\#E85A70\\]\\/10            { background-color: ${rRgb(0.10)} !important; }
.bg-\\[\\#E85A70\\]\\/20            { background-color: ${rRgb(0.20)} !important; }
.border-\\[\\#E85A70\\]\\/20        { border-color: ${rRgb(0.20)} !important; }
.border-\\[\\#E85A70\\]\\/25        { border-color: ${rRgb(0.25)} !important; }
.text-\\[\\#E85A70\\]\\/80          { color: ${rRgb(0.80)} !important; }

/* light bg overrides */
.bg-\\[\\#FDF2F4\\]                 { background-color: ${rRgb(0.07)} !important; }
.border-\\[\\#fbdde2\\]             { border-color: ${rRgb(0.20)} !important; }
.hover\\:border-\\[\\#fbdde2\\]:hover { border-color: ${rRgb(0.25)} !important; }
.hover\\:text-\\[\\#E85A70\\]:hover  { color: ${c} !important; }
.hover\\:bg-rose-50\\/30:hover      { background-color: ${rRgb(0.06)} !important; }

/* Tailwind named rose scale */
.text-rose-600, .text-rose-500 { color: ${c} !important; }
.bg-rose-50    { background-color: ${rRgb(0.07)} !important; }
.bg-rose-100   { background-color: ${rRgb(0.12)} !important; }
.border-rose-200 { border-color: ${rRgb(0.25)} !important; }
.hover\\:border-rose-200:hover { border-color: ${rRgb(0.30)} !important; }
.from-rose-50  { --tw-gradient-from: ${rRgb(0.07)} var(--tw-gradient-from-position) !important; }
.to-rose-50    { --tw-gradient-to:   ${rRgb(0.07)} var(--tw-gradient-to-position)   !important; }

/* gradient utilities used in inline styles */
.bg-gradient-to-r.from-\\[\\#E85A70\\] { background-image: linear-gradient(to right, ${c}, ${c}dd) !important; }
.bg-gradient-to-br.from-rose-50 { background-image: linear-gradient(to bottom right, ${rRgb(0.07)}, ${rRgb(0.12)}) !important; }

/* badge-rose utility */
.badge-rose { background-color: ${rRgb(0.10)} !important; color: ${c} !important; border-color: ${rRgb(0.20)} !important; }

/* buttons / btn-rose */
.btn-rose, [class*="bg-\\[#E85A70\\]"] { background-color: ${c} !important; }

/* scrollbar */
::-webkit-scrollbar-thumb { background: ${c} !important; }
::-webkit-scrollbar-thumb:hover { background: ${theme.scrollbar} !important; }

/* focus ring */
*:focus-visible { outline-color: ${c} !important; }

/* selection highlight */
::selection { background-color: ${rRgb(0.25)} !important; }

/* shadow color hints */
[style*="E85A70"] * { --shadow-accent: ${c}; }
`;
}

function applyTheme(theme: AccentTheme) {
  // 1. Inject / update dynamic style tag
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildCSS(theme);

  // 2. Update inline CSS custom properties (for elements that already use var())
  const root = document.documentElement;
  root.style.setProperty('--lume-accent',      theme.color);
  root.style.setProperty('--lume-accent-light', theme.light);
  root.style.setProperty('--lume-accent-ring',  theme.ring);
  root.style.setProperty('--lume-scrollbar',    theme.scrollbar);
}

export function useThemeAccent() {
  const savedId = typeof window !== 'undefined'
    ? (localStorage.getItem(STORAGE_KEY) ?? 'rose')
    : 'rose';

  const initial = ACCENT_THEMES.find(t => t.id === savedId) ?? ACCENT_THEMES[0];
  const [active, setActive] = useState<AccentTheme>(initial);

  // Apply on first mount (restores persisted theme)
  useEffect(() => { applyTheme(initial); }, []); // eslint-disable-line

  const setTheme = useCallback((theme: AccentTheme, clickX?: number, clickY?: number) => {
    setActive(theme);
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme.id);

    // Fire global event so ThemeTransition overlay can play the ripple
    window.dispatchEvent(new CustomEvent('lume:theme', {
      detail: { x: clickX ?? window.innerWidth / 2, y: clickY ?? window.innerHeight / 2, color: theme.color },
    }));
  }, []);

  return { active, themes: ACCENT_THEMES, setTheme };
}
