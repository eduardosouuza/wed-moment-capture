/**
 * ThemeTransition — GSAP edition
 *
 * Three-layer animation on theme switch:
 *  1. A "flash" layer: instant color fill that fades immediately (snap feel)
 *  2. A "ripple" layer: circle expands from swatch origin with elastic easing
 *  3. Subtle page-wide brightness pulse on <body>
 *
 * Triggered by the 'lume:theme' custom event from useThemeAccent.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function ThemeTransition() {
  const rippleRef = useRef<HTMLDivElement>(null);
  const flashRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { x, y, color } = (e as CustomEvent<{ x: number; y: number; color: string }>).detail;
      const ripple = rippleRef.current;
      const flash  = flashRef.current;
      if (!ripple || !flash) return;

      // Kill any in-progress animations to avoid overlap
      gsap.killTweensOf([ripple, flash, document.body]);

      /* ── 1. Flash layer ─────────────────────────────────────────── */
      gsap.set(flash, { backgroundColor: color, opacity: 0.18 });
      gsap.to(flash, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      });

      /* ── 2. Ripple circle from click origin ─────────────────────── */
      // Calculate the radius needed to cover the entire viewport from (x, y)
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxR = Math.ceil(
        Math.sqrt(
          Math.pow(Math.max(x, vw - x), 2) +
          Math.pow(Math.max(y, vh - y), 2)
        )
      ) * 2; // diameter as px

      gsap.set(ripple, {
        backgroundColor: color,
        width: 0,
        height: 0,
        borderRadius: '50%',
        x: x,
        y: y,
        xPercent: -50,
        yPercent: -50,
        opacity: 0.30,
      });

      gsap.timeline()
        .to(ripple, {
          width: maxR,
          height: maxR,
          opacity: 0.22,
          duration: 0.55,
          ease: 'power3.out',
        })
        .to(ripple, {
          opacity: 0,
          duration: 0.30,
          ease: 'power1.in',
        });

      /* ── 3. Subtle brightness pulse on body ──────────────────────── */
      gsap.timeline()
        .to(document.body, {
          filter: 'brightness(1.04)',
          duration: 0.12,
          ease: 'power1.out',
        })
        .to(document.body, {
          filter: 'brightness(1)',
          duration: 0.35,
          ease: 'power2.inOut',
        });

      /* ── 4. Swetch scale pop ─────────────────────────────────────── */
      // Find the active swatch button and give it a satisfying pop
      const btn = document.querySelector(`[data-swatch="${color}"]`) as HTMLElement | null;
      if (btn) {
        gsap.timeline()
          .to(btn, { scale: 1.5, duration: 0.12, ease: 'back.out(3)' })
          .to(btn, { scale: 1.25, duration: 0.25, ease: 'elastic.out(1.2, 0.5)' });
      }
    };

    window.addEventListener('lume:theme', handler);
    return () => window.removeEventListener('lume:theme', handler);
  }, []);

  return (
    <>
      {/* Flash — full screen instant fade */}
      <div
        ref={flashRef}
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none', zIndex: 9998,
          opacity: 0,
        }}
      />
      {/* Ripple — circle from swatch origin */}
      <div
        ref={rippleRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none', zIndex: 9999,
          width: 0, height: 0,
          borderRadius: '50%',
          opacity: 0,
          transformOrigin: 'center center',
        }}
      />
    </>
  );
}
