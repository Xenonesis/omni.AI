import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  enabled?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  enabled = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Skip if already intersected and triggerOnce is true
    if (triggerOnce && hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);

        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);
          
          // Disconnect observer if triggerOnce is true
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(targetRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, enabled, hasIntersected]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected,
  };
}

// Performance-optimized hook for multiple elements
export function useMultipleIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const [intersectingElements, setIntersectingElements] = useState<Set<Element>>(new Set());
  const [intersectedElements, setIntersectedElements] = useState<Set<Element>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newIntersecting = new Set(intersectingElements);
        const newIntersected = new Set(intersectedElements);

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            newIntersecting.add(entry.target);
            newIntersected.add(entry.target);

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else {
            newIntersecting.delete(entry.target);
          }
        });

        setIntersectingElements(newIntersecting);
        setIntersectedElements(newIntersected);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;

    // Observe all existing elements
    elementsRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  const observe = (element: Element) => {
    if (!element || elementsRef.current.has(element)) return;

    elementsRef.current.add(element);
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  const unobserve = (element: Element) => {
    if (!element || !elementsRef.current.has(element)) return;

    elementsRef.current.delete(element);
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  };

  return {
    observe,
    unobserve,
    intersectingElements,
    intersectedElements,
    isIntersecting: (element: Element) => intersectingElements.has(element),
    hasIntersected: (element: Element) => intersectedElements.has(element),
  };
}

// Hook for staggered animations
export function useStaggeredIntersection({
  threshold = 0.1,
  rootMargin = '0px',
  staggerDelay = 100,
}: UseIntersectionObserverOptions & { staggerDelay?: number } = {}) {
  const [visibleElements, setVisibleElements] = useState<Map<Element, number>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Element[]>([]);
  const timeoutsRef = useRef<Map<Element, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementIndex = elementsRef.current.indexOf(entry.target);
            const delay = elementIndex * staggerDelay;

            // Clear any existing timeout
            const existingTimeout = timeoutsRef.current.get(entry.target);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }

            // Set new timeout for staggered animation
            const timeout = setTimeout(() => {
              setVisibleElements((prev) => new Map(prev).set(entry.target, Date.now()));
              observer.unobserve(entry.target);
            }, delay);

            timeoutsRef.current.set(entry.target, timeout);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      // Clear all timeouts
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [threshold, rootMargin, staggerDelay]);

  const observe = (element: Element) => {
    if (!element || elementsRef.current.includes(element)) return;

    elementsRef.current.push(element);
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return {
    observe,
    visibleElements,
    isVisible: (element: Element) => visibleElements.has(element),
  };
}
