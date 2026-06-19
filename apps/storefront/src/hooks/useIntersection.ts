import { useEffect, useRef, useState } from 'react';

interface UseIntersectionOptions {
  once?: boolean;
  rootMargin?: string;
}

export function useIntersection(options?: UseIntersectionOptions) {
  const once = options?.once ?? true;
  const rootMargin = options?.rootMargin ?? '150px';

  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && once) {
          observer.unobserve(el);
        }
      },
      {
        rootMargin,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [once, rootMargin]);

  return [ref, isIntersecting] as const;
}
