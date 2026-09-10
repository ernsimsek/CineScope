"use client";

import { useEffect, useRef } from "react";

/**
 * Toggles a CSS class on the element based on scroll direction.
 * Pure DOM manipulation — zero React re-renders.
 */
export function useScrollHide<T extends HTMLElement>(className: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y > 200 && y > lastY) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [className]);

  return ref;
}
