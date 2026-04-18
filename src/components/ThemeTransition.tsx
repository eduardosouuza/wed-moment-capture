/**
 * ThemeTransition
 * Full-screen circular ripple overlay that plays when the accent theme changes.
 * Listens for the global 'lume:theme' custom event dispatched by useThemeAccent.
 */
import { useEffect, useRef } from 'react';

export function ThemeTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { x, y, color } = (e as CustomEvent<{ x: number; y: number; color: string }>).detail;
      const el = overlayRef.current;
      if (!el) return;

      // Position the ripple origin at the click point
      el.style.setProperty('--rx', `${x}px`);
      el.style.setProperty('--ry', `${y}px`);
      el.style.backgroundColor = color;

      // Restart animation by removing and re-adding the class
      el.classList.remove('lume-ripple-active');
      void el.offsetWidth; // force reflow
      el.classList.add('lume-ripple-active');
    };

    window.addEventListener('lume:theme', handler);
    return () => window.removeEventListener('lume:theme', handler);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="lume-ripple-overlay"
      style={{ '--rx': '50%', '--ry': '50%' } as React.CSSProperties}
    />
  );
}
