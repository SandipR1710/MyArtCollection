"use client";

import { useEffect, useState } from "react";

interface Size { w: number; h: number }

/**
 * Returns portrait dimensions clamped to the current viewport.
 * Updates on window resize.
 */
export function usePortraitSize(
  maxW = 520,
  maxH = 640,
  mobileScale = 0.82
): Size {
  const [size, setSize] = useState<Size>({ w: maxW, h: maxH });

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const isMobile = vw < 640;
      const scale = isMobile ? mobileScale : 1;
      const w = Math.min(maxW * scale, vw * 0.88);
      const ratio = maxH / maxW;
      const h = Math.min(maxH * scale, w * ratio, window.innerHeight * 0.78);
      setSize({ w: Math.round(w), h: Math.round(h) });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [maxW, maxH, mobileScale]);

  return size;
}
