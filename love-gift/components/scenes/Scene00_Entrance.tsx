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

export default function Scene00_Entrance() {
  const containerRef = useRef<HTMLElement>(null);
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
    // Smooth-scroll past the entrance into Scene 1
    const target = window.innerHeight;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.8 });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-center gap-10 px-6"
      style={{ minHeight: "100vh", background: "var(--background)" }}
      aria-label="Entrance"
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

      {/* Begin button — solid pill, clearly visible */}
      <button
        ref={btnRef}
        onClick={handleBegin}
        style={{
          opacity: 0,
          background: "rgba(255,255,255,0.07)",
          boxShadow: "0 0 0 1.5px rgba(255,255,255,0.55), 0 0 32px hsla(220,65%,65%,0.25), inset 0 1px 0 rgba(255,255,255,0.10)",
          backdropFilter: "blur(6px)",
        }}
        className="px-14 py-4 rounded-full text-sm tracking-[0.32em] uppercase font-light text-white hover:bg-white/14 transition-all duration-400"
      >
        Begin
      </button>
    </section>
  );
}
