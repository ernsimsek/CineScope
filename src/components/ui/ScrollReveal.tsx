"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
};

/**
 * Wraps children in an IntersectionObserver-driven reveal animation.
 * Use `delay` (ms) to stagger grid items.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [delay, threshold]);

  const Component = Tag as unknown as React.ElementType;
  return (
    <Component
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}
