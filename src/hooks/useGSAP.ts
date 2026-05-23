import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar plugin
gsap.registerPlugin(ScrollTrigger);

interface UseGSAPOptions {
    dependencies?: any[];
    revertOnUpdate?: boolean;
}

/**
 * Hook customizado para gerenciar animações GSAP
 * Garante cleanup adequado e re-execução quando dependências mudam
 */
export function useGSAP(
    callback: (context: gsap.Context) => void,
    options: UseGSAPOptions = {}
) {
    const { dependencies = [], revertOnUpdate = true } = options;
    const contextRef = useRef<gsap.Context | null>(null);

    useEffect(() => {
        // Criar contexto GSAP
        contextRef.current = gsap.context(() => {
            callback(contextRef.current!);
        });

        // Cleanup
        return () => {
            if (contextRef.current) {
                contextRef.current.revert();
                contextRef.current = null;
            }
        };
    }, dependencies);

    return contextRef;
}

/**
 * Hook para configurar ScrollTrigger globalmente
 */
export function useScrollTriggerConfig() {
    useEffect(() => {
        ScrollTrigger.defaults({
            toggleActions: 'play none none reverse',
            markers: false, // Mude para true para debug
        });

        // Refresh ao resize
        const handleResize = () => {
            ScrollTrigger.refresh();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            ScrollTrigger.killAll();
        };
    }, []);
}
