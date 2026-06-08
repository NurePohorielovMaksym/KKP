import { useEffect, useRef } from "react";

/**
 * @param {Object} options 
 */
export function useReveal(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                el.classList.add('is-visible');
                obs.disconnect(); 
            }
        }, { 
            threshold: 0.12, 
            ...options 
        });

        obs.observe(el);

        return () => obs.disconnect();
    }, [options]);

    return ref;
}