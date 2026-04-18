"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { motion, useInView } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import type { DuetData } from "@/data/duets";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

interface Props {
  duet: DuetData;
}

export default function Scene06_Duet({ duet }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const vineRef = useRef<SVGPathElement>(null);
  const songTitleRef = useRef<HTMLSpanElement>(null);
  const { playScene, currentSong } = useAudio();
  const isInView = useInView(sectionRef, { once: true, margin: "-20%" });

  // Set CSS vars for scene palette when in view
  useEffect(() => {
    if (!isInView) return;
    document.documentElement.style.setProperty("--scene-h", duet.palette);
    playScene(duet.song);
  }, [isInView, duet.palette, duet.song, playScene]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
          once: true,
        },
      });

      // Flower slides in from left
      tl.fromTo(
        flowerRef.current,
        { x: -80, opacity: 0, filter: "blur(10px) saturate(0.4)" },
        { x: 0, opacity: 1, filter: "blur(0px) saturate(0.85)", duration: 1.1, ease: "power3.out" }
      )
        // Vine draws from flower to portrait
        .fromTo(
          vineRef.current,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.5, ease: "power1.inOut" },
          "-=0.3"
        )
        // Song title floats up along vine center
        .fromTo(
          songTitleRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.8"
        )
        // Portrait reveals (ink wash)
        .fromTo(
          portraitRef.current,
          { opacity: 0, filter: "blur(20px) saturate(0.2)", x: 40 },
          { opacity: 1, filter: "blur(0px) saturate(1)", x: 0, duration: 1.4, ease: "power2.out" },
          "-=1.0"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const songDisplayName = duet.song
    .split("/")
    .pop()!
    .replace(".mp3", "")
    .replace(/_/g, " ");

  return (
    <section
      ref={sectionRef}
      className="scene scene-bg py-24"
      aria-label={`${duet.flowerName} duet`}
    >
      <div className="duet-layout">
        {/* Flower */}
        <div ref={flowerRef} className="portrait-wrap justify-self-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={duet.flowerSrc}
            alt={duet.altFlower}
            className="w-full max-w-[380px] h-[min(65vh,500px)] object-cover rounded-[1px]"
          />
          <p
            className="mt-3 text-center text-sm tracking-widest uppercase opacity-50"
            style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1rem" }}
          >
            {duet.flowerName}
          </p>
        </div>

        {/* Vine connector */}
        <div className="relative flex items-center justify-center h-full">
          <svg
            viewBox="0 0 80 400"
            className="vine-svg h-64 w-20"
            aria-hidden="true"
          >
            <path
              ref={vineRef}
              d="M40,10 C40,100 40,220 40,390"
              className="vine-path"
              strokeDasharray="none"
            />
          </svg>
          {/* Song title at midpoint */}
          <span
            ref={songTitleRef}
            className="absolute text-xs tracking-wider uppercase text-white/50 text-center leading-tight max-w-[70px]"
            style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "0.7rem", opacity: 0 }}
          >
            {songDisplayName}
          </span>
        </div>

        {/* Portrait */}
        <div ref={portraitRef} className="portrait-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={duet.portraitSrc}
            alt={duet.altPortrait}
            className="w-full max-w-[380px] h-[min(65vh,500px)] object-cover rounded-[1px]"
          />
        </div>
      </div>
    </section>
  );
}
