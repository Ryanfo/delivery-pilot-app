import { useCallback, useRef, useState } from "react";

/**
 * Tracks whether an element has scrolled into view, to drive a one-off visual reveal.
 * Falls back to immediately visible when IntersectionObserver is unavailable (e.g. jsdom),
 * so content is never hidden from assistive technology or tests.
 */
export function useRevealOnScroll<T extends Element>() {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return { ref, isVisible };
}
