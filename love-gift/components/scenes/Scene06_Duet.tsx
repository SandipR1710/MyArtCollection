"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useInView } from "framer-motion";
import InkReveal, { type InkRevealHandle } from "@/components/shared/InkReveal";
import PetalSystem from "@/components/shared/PetalSystem";
import { usePortraitSize } from "@/hooks/usePortraitSize";
import { useAudio } from "@/components/providers/AudioProvider";
import type { DuetData } from "@/data/duets";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

interface Props {
  duet: DuetData;
}

export default function Scene06_Duet({ duet }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const portraitWrapRef = useRef<HTMLDivElement>(null);
  const vineRef = useRef<SVGPathElement>(null);
  const songTitleRef = useRef<HTMLSpanElement>(null);
  const inkRef = useRef<InkRevealHandle>(null);
  const { playScene } = useAudio();
  const isInView = useInView(sectionRef, { once: true, margin: "-20%" });
  const { w: PORTRAIT_W, h: PORTRAIT_H } = usePortraitSize(380, 500, 0.88);
  const [petalActive, setPetalActive] = useState(false);
  const played = useRef(false);

  // Activate palette + audio when scene enters view
  useEffect(() => {
    if (!isInView || played.current) return;
    played.current = true;
    document.documentElement.style.setProperty("--scene-h", duet.palette);
    playScene(duet.song);
    setPetalActive(true);
  }, [isInView, duet.palette, duet.song, playScene]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 55%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      // 1. Flower slides in from left
      tl.fromTo(
        flowerRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.0 }
      )
        // 2. Vine draws
        .fromTo(
          vineRef.current,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.4, ease: "power1.inOut" },
          "-=0.4"
        )
        // 3. Song title
        .fromTo(
          songTitleRef.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.9"
        )
        // 4. Portrait ink reveal fires
        .add(() => inkRef.current?.reveal(1800), "-=0.8")
        // 5. Portrait wrapper slides in
        .fromTo(
          portraitWrapRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2 },
          "-=1.6"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const songDisplayName = duet.song
    .split("/").pop()!
    .replace(".mp3", "")
    .replace(/_/g, " ");

  return (
    <section
      ref={sectionRef}
      className="scene scene-bg relative overflow-hidden py-24"
      aria-label={`${duet.flowerName} duet`}
    >
      {/* Petal rain — rendered behind content */}
      <PetalSystem hue={Number(duet.palette)} active={petalActive} />

      <div className="duet-layout relative z-10">
        {/* Flower */}
        <div ref={flowerRef} className="portrait-wrap justify-self-end" style={{ opacity: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={duet.flowerSrc}
            alt={duet.altFlower}
            className="w-full max-w-[380px] h-[min(65vh,500px)] object-cover rounded-[1px]"
          />
          <p
            className="mt-3 text-center tracking-widest uppercase opacity-50"
            style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.05rem" }}
          >
            {duet.flowerName}
          </p>
        </div>

        {/* Vine connector */}
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 80 400" className="vine-svg h-64 w-16" aria-hidden="true">
            <path
              ref={vineRef}
              d="M40,10 C40,100 40,220 40,390"
              className="vine-path"
            />
          </svg>
          <span
            ref={songTitleRef}
            className="absolute text-center leading-snug"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              color: "var(--glow-color)",
              opacity: 0,
              maxWidth: 66,
            }}
          >
            {songDisplayName}
          </span>
        </div>

        {/* Portrait with ink reveal */}
        <div className="relative flex items-center justify-center" style={{ opacity: 0 }} ref={portraitWrapRef}>
          {/* Hue-matched ink-cloud glow — same treatment as gallery portraits */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "-30%",
              background: `radial-gradient(ellipse 65% 60% at 50% 48%, hsla(${duet.palette},45%,22%,0.55) 0%, transparent 70%)`,
            }}
          />
          <div
            className="portrait-wrap relative"
            style={{ width: PORTRAIT_W, height: PORTRAIT_H }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={duet.portraitSrc}
              alt={duet.altPortrait}
              className="w-full h-full object-cover rounded-[1px]"
            />
            <InkReveal ref={inkRef} width={PORTRAIT_W} height={PORTRAIT_H} />
          </div>
        </div>
      </div>
    </section>
  );
}
