"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Cuenta de 0 hasta `end` una sola vez, disparado cuando el elemento
// entra en el viewport (scroll-triggered counter).
export function useCountUp(end: number, durationMs = 1800) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start: number | null = null;
    let frameId: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, end, durationMs]);

  return { ref, value };
}
