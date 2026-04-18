"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

interface Props {
  hue: number; // CSS hue degree (0-360)
  active: boolean;
  density?: number; // 1 = normal, 0.5 = sparse (mobile)
}

// SVG petal path (simple teardrop)
const PETAL_SVG =
  "M0,-10 C5,-10 10,-5 10,0 C10,5 5,10 0,10 C-5,10 -10,5 -10,0 C-10,-5 -5,-10 0,-10 Z";

function buildOptions(hue: number, density: number): ISourceOptions {
  const color = `hsl(${hue}, 65%, 72%)`;
  const colorAlt = `hsl(${(hue + 20) % 360}, 55%, 80%)`;
  const count = Math.round(35 * density);

  return {
    fullScreen: false,
    fpsLimit: 60,
    particles: {
      number: { value: count, density: { enable: true } },
      color: { value: [color, colorAlt, "#ffffff33"] },
      shape: {
        type: "path",
        options: {
          path: { d: PETAL_SVG, size: { width: 20, height: 20 } },
        },
      },
      opacity: {
        value: { min: 0.15, max: 0.55 },
        animation: { enable: true, speed: 0.4, sync: false },
      },
      size: { value: { min: 4, max: 10 } },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: 3, sync: false },
      },
      move: {
        enable: true,
        direction: "bottom" as const,
        speed: { min: 0.8, max: 2.5 },
        drift: { min: -1.5, max: 1.5 },
        outModes: { default: "out" as const },
        random: true,
        straight: false,
      },
    },
    detectRetina: true,
  };
}

export default function PetalSystem({ hue, active, density = 1 }: Props) {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  if (!engineReady || !active) return null;

  return (
    <Particles
      id={`petals-${hue}`}
      className="absolute inset-0 pointer-events-none z-0"
      options={buildOptions(hue, density)}
    />
  );
}
