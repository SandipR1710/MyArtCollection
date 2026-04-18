"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useAudio } from "@/components/providers/AudioProvider";
import { favoritePortrait } from "@/data/scenes";

gsap.registerPlugin(MorphSVGPlugin);

const FLOWER_PATH =
  "M100,30 C115,30 135,50 140,70 C150,100 140,135 120,150 C108,158 92,158 80,150 C60,135 50,100 60,70 C65,50 85,30 100,30 Z";
const OVAL_PATH =
  "M100,12 C138,12 165,45 165,88 C165,131 138,168 100,168 C62,168 35,131 35,88 C35,45 62,12 100,12 Z";

interface Props {
  onBegin: () => void;
}

export default function Scene00_Entrance({ onBegin }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const btnRef      = useRef<HTMLButtonElement>(null);
  const imgWrapRef  = useRef<HTMLDivElement>(null);
  const morphPathRef = useRef<SVGPathElement>(null);
  const { playScene } = useAudio();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, btnRef.current], { opacity: 0, y: 24 });
      gsap.set(imgWrapRef.current, { opacity: 0, scale: 0.88 });

      const tl = gsap.timeline({ delay: 0.2, defaults: { ease: "power2.out" } });

      // Morph flower → oval
      tl.to(morphPathRef.current, {
        morphSVG: OVAL_PATH,
        duration: 1.8,
        ease: "power1.inOut",
      })
        // Portrait appears
        .to(imgWrapRef.current, { opacity: 1, scale: 1, duration: 1.0 }, "-=0.6")
        // Title
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.85 }, "-=0.2")
        // Button
        .to(btnRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleBegin = () => {
    playScene(favoritePortrait.song);
    gsap.to(containerRef.current, {
      opacity: 0, duration: 0.85, ease: "power2.in", onComplete: onBegin,
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#06080d] flex flex-col items-center justify-center gap-10 px-6"
    >
      {/* Portrait + morph ring — natural flow, not absolute */}
      <div ref={imgWrapRef} className="relative flex-shrink-0" style={{ opacity: 0 }}>
        {/* Morph SVG ring behind portrait */}
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ padding: "4%" }}
        >
          <path
            ref={morphPathRef}
            d={FLOWER_PATH}
            fill="none"
            stroke="hsl(220,45%,60%)"
            strokeWidth="1"
            opacity="0.35"
          />
        </svg>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={favoritePortrait.src}
          alt={favoritePortrait.alt}
          className="block object-cover"
          style={{
            width:  "min(52vw, 300px)",
            height: "min(58vh, 400px)",
            clipPath: "ellipse(44% 48% at 50% 50%)",
          }}
        />
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="entrance-title text-center"
        style={{ opacity: 0, fontSize: "clamp(1.6rem, 5vw, 3.8rem)" }}
      >
        I drew this world for you
      </h1>

      {/* Begin button */}
      <button
        ref={btnRef}
        onClick={handleBegin}
        style={{ opacity: 0 }}
        className="px-10 py-3 text-xs tracking-[0.3em] uppercase font-light border border-white/20 rounded-full text-white/60 hover:text-white hover:border-white/50 transition-all duration-500"
      >
        Begin
      </button>
    </div>
  );
}
