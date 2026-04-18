"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { useAudio } from "@/components/providers/AudioProvider";
import { favoritePortrait } from "@/data/scenes";

gsap.registerPlugin(MorphSVGPlugin, SplitText);

// The flower petal shape we morph FROM
const FLOWER_PATH =
  "M100,30 C115,30 135,50 140,70 C150,100 140,135 120,150 C108,158 92,158 80,150 C60,135 50,100 60,70 C65,50 85,30 100,30 Z";

// Oval frame shape we morph TO (portrait frame)
const OVAL_PATH =
  "M100,12 C138,12 165,45 165,88 C165,131 138,168 100,168 C62,168 35,131 35,88 C35,45 62,12 100,12 Z";

interface Props {
  onBegin: () => void;
}

export default function Scene00_Entrance({ onBegin }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const morphPathRef = useRef<SVGPathElement>(null);
  const { playScene } = useAudio();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, btnRef.current, imgRef.current], { opacity: 0, y: 20 });
      gsap.set(morphPathRef.current, { attr: { d: FLOWER_PATH } });

      const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power2.inOut" } });

      // 1. Draw flower → morph to oval frame
      tl.to(morphPathRef.current, {
        duration: 2,
        morphSVG: OVAL_PATH,
        ease: "power1.inOut",
      })
        // 2. Portrait fades in through the oval
        .to(imgRef.current, { opacity: 1, y: 0, duration: 1 }, "-=0.5")
        // 3. Title rises
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.9 }, "-=0.3")
        // 4. Begin button
        .to(btnRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleBegin = () => {
    playScene(favoritePortrait.song);
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.9,
      ease: "power2.in",
      onComplete: onBegin,
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080d]"
    >
      {/* Morphing SVG — behind the portrait */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="w-[min(70vw,440px)] h-[min(70vw,440px)] opacity-25">
          <path
            ref={morphPathRef}
            d={FLOWER_PATH}
            fill="none"
            stroke="hsl(220, 50%, 65%)"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Portrait clipped to oval */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={favoritePortrait.src}
        alt={favoritePortrait.alt}
        className="absolute w-[min(52vw,360px)] h-[min(62vh,500px)] object-cover"
        style={{
          clipPath: "ellipse(42% 48% at 50% 50%)",
          opacity: 0,
        }}
      />

      {/* Title + button sit below the portrait */}
      <div className="relative z-10 flex flex-col items-center mt-[58vh] gap-6">
        <h1
          ref={titleRef}
          className="entrance-title text-center px-8"
          style={{ opacity: 0 }}
        >
          I drew this world for you
        </h1>

        <button
          ref={btnRef}
          onClick={handleBegin}
          className="px-10 py-3 text-sm tracking-[0.25em] uppercase font-light border border-white/20 rounded-full text-white/65 hover:text-white hover:border-white/45 transition-all duration-500 hover:shadow-[0_0_28px_rgba(255,255,255,0.08)]"
          style={{ opacity: 0 }}
        >
          Begin
        </button>
      </div>
    </div>
  );
}
