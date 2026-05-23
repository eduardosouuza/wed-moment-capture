/**
 * ThemeTransition — GSAP circular reveal ("paint fill")
 *
 * Ao trocar o tema:
 *   1. Um círculo colorido cresce do swatch até cobrir TODA a tela (power3.inOut)
 *   2. Pausa 80ms com a tela coberta (tema já aplicado por baixo)
 *   3. O círculo recua de volta para o ponto de origem (expo.inOut)
 *   → O site aparece com a nova cor como se o círculo tivesse "pintado" tudo
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function ThemeTransition() {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { x, y, color } = (e as CustomEvent<{ x: number; y: number; color: string }>).detail;
      const el = circleRef.current;
      if (!el) return;

      gsap.killTweensOf(el);

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Raio necessário para cobrir o viewport inteiro a partir de (x, y)
      const maxRadius = Math.ceil(
        Math.sqrt(
          Math.pow(Math.max(x, vw - x), 2) +
          Math.pow(Math.max(y, vh - y), 2)
        )
      );
      const maxDiam = maxRadius * 2.1;

      // Posiciona o círculo exatamente no ponto de clique, tamanho zero
      gsap.set(el, {
        display: 'block',
        backgroundColor: color,
        width: 0,
        height: 0,
        x,
        y,
        xPercent: -50,
        yPercent: -50,
        borderRadius: '50%',
        opacity: 1,
      });

      gsap.timeline({
        onComplete: () => {
          // Reset discreto depois que o círculo voltou ao ponto de origem
          gsap.set(el, { display: 'none', width: 0, height: 0, opacity: 0 });
        },
      })
        // ── Fase 1: Cresce do swatch até cobrir a tela ──────────────
        .to(el, {
          width: maxDiam,
          height: maxDiam,
          duration: 0.52,
          ease: 'power3.inOut',
        })
        // ── Pausa breve — tema já está aplicado por baixo ───────────
        .to(el, { duration: 0.08 })
        // ── Fase 2: Recua de volta para a origem ────────────────────
        .to(el, {
          width: 0,
          height: 0,
          duration: 0.48,
          ease: 'expo.inOut',
        });

      /* Pulse suave no swatch clicado */
      const btn = document.querySelector(`[data-swatch="${color}"]`) as HTMLElement | null;
      if (btn) {
        gsap.timeline()
          .to(btn, { scale: 1.6, duration: 0.14, ease: 'back.out(3)' })
          .to(btn, { scale: 1.28, duration: 0.3, ease: 'elastic.out(1.1, 0.5)' });
      }

      /* Shimmer suave no body */
      gsap.timeline()
        .to(document.body, { filter: 'brightness(1.05)', duration: 0.15, ease: 'power1.out' })
        .to(document.body, { filter: 'brightness(1)', duration: 0.4, ease: 'power2.inOut' });
    };

    window.addEventListener('lume:theme', handler);
    return () => window.removeEventListener('lume:theme', handler);
  }, []);

  return (
    <div
      ref={circleRef}
      style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        borderRadius: '50%',
        opacity: 0,
        willChange: 'width, height, transform',
      }}
    />
  );
}
