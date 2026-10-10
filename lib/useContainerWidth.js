'use client';

import { useEffect, useState } from 'react';

/**
 * Track the width of `ref`'s element for sizing an expensive child (the PDF canvas).
 *
 * The first measurement applies immediately. Later ones wait `delay` ms after
 * the last resize, and every value is capped at `max` and rounded down to a
 * multiple of `step`, so small or rapid resizes do not trigger a re-render.
 *
 * @param {{ current: Element | null }} ref
 * @param {{ initial?: number, max?: number, step?: number, delay?: number }} [options]
 * @returns {number}
 */
export function useContainerWidth(ref, { initial = 345, max = 820, step = 16, delay = 150 } = {}) {
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let timer = null;
    let measured = false;

    const apply = (rawWidth) => {
      const capped = Math.min(rawWidth, max);
      setWidth(Math.max(step, Math.floor(capped / step) * step));
    };

    const observer = new ResizeObserver(([entry]) => {
      const rawWidth = entry.contentRect.width;
      if (!measured) {
        measured = true;
        apply(rawWidth);
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => apply(rawWidth), delay);
    });

    observer.observe(element);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, max, step, delay]);

  return width;
}
