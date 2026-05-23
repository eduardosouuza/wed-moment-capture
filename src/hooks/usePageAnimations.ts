import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook para aplicar animações GSAP automáticas em toda a página
 * Usa data-attributes para selecionar elementos
 */
export function useAutoAnimations() {
    useEffect(() => {
        // Fade-in elements
        const fadeElements = document.querySelectorAll('[data-gsap="fade-in"]');
        fadeElements.forEach((element) => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: 50,
                duration: 0.9,
                ease: 'power2.out',
            });
        });

        // Fade-in with stagger (para listas/grupos)
        const staggerGroups = document.querySelectorAll('[data-gsap-group="stagger"]');
        staggerGroups.forEach((group) => {
            const items = group.querySelectorAll('[data-gsap-item]');
            gsap.from(items, {
                scrollTrigger: {
                    trigger: group,
                    start: 'top 80%',
                },
                opacity: 0,
                y: 40,
                stagger: 0.12,
                duration: 0.7,
                ease: 'power2.out',
            });
        });

        // Scale-in elements
        const scaleElements = document.querySelectorAll('[data-gsap="scale-in"]');
        scaleElements.forEach((element) => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                },
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                ease: 'back.out(1.2)',
            });
        });

        // Parallax elements (movimento sutil)
        const parallaxElements = document.querySelectorAll('[data-gsap="parallax"]');
        parallaxElements.forEach((element) => {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element.parentElement || element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
                y: -40,
                ease: 'none',
            });
        });

        // Parallax mais intenso para backgrounds
        const parallaxBgElements = document.querySelectorAll('[data-gsap="parallax-bg"]');
        parallaxBgElements.forEach((element) => {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element.parentElement || element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5,
                },
                y: -80,
                ease: 'none',
            });
        });

        // Slide from left
        const slideLeftElements = document.querySelectorAll('[data-gsap="slide-left"]');
        slideLeftElements.forEach((element) => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                },
                opacity: 0,
                x: -60,
                duration: 0.9,
                ease: 'power2.out',
            });
        });

        // Slide from right
        const slideRightElements = document.querySelectorAll('[data-gsap="slide-right"]');
        slideRightElements.forEach((element) => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                },
                opacity: 0,
                x: 60,
                duration: 0.9,
                ease: 'power2.out',
            });
        });

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);
}
