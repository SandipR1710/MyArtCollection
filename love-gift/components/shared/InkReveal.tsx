"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface InkRevealHandle {
  reveal: (duration?: number) => void;
  reset: () => void;
}

interface Props {
  width: number;
  height: number;
  color?: string; // overlay color, default matches page bg
  onComplete?: () => void;
}

/**
 * Canvas overlay that starts fully opaque and erases itself organically
 * using destination-out compositing — revealing the element underneath.
 * Deformation is driven by sin/cos harmonics to mimic a hand-drawn ink wash.
 */
const InkReveal = forwardRef<InkRevealHandle, Props>(function InkReveal(
  { width, height, color = "#06080d", onComplete },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  function fillBlack() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  useImperativeHandle(ref, () => ({
    reveal(duration = 2000) {
      if (runningRef.current) return;
      fillBlack();
      runningRef.current = true;
      const start = performance.now();

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const cx = width * 0.48;
      const cy = height * 0.44;
      const maxR = Math.sqrt((width - cx) ** 2 + (height - cy) ** 2) * 1.25;

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const r = maxR * eased;

        // Erase an organic blob from the overlay each frame
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          const deform =
            1 +
            Math.sin(angle * 3 + t * 5) * 0.13 * (1 - eased * 0.5) +
            Math.cos(angle * 7 - t * 3) * 0.08 * (1 - eased * 0.3) +
            Math.sin(angle * 13 + t * 8) * 0.04;
          const pr = r * deform;
          const x = cx + Math.cos(angle) * pr;
          const y = cy + Math.sin(angle) * pr;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Fully erased — hide the canvas entirely
          canvas.style.opacity = "0";
          runningRef.current = false;
          onComplete?.();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    reset() {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.style.opacity = "1";
      fillBlack();
    },
  }));

  useEffect(() => {
    // Initialize with a full black overlay
    fillBlack();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="ink-canvas"
      style={{ transition: "opacity 0.4s ease" }}
      aria-hidden="true"
    />
  );
});

export default InkReveal;
