"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { useAudio } from "@/components/providers/AudioProvider";
import { favoritePortrait } from "@/data/scenes";

gsap.registerPlugin(MorphSVGPlugin, SplitText);

interface Props {
  onBegin: () => void;
}

export default function Scene00_Entrance({ onBegin }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { playScene } = useAudio();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      // Start with everything hidden
      gsap.set([titleRef.current, btnRef.current], { opacity: 0, y: 30 });
      gsap.set(imgRef.current, { opacity: 0 });

      // Step 1: morph dot → flower petals → oval frame
      tl.from("#morph-path", {
        duration: 2.5,
        morphSVG: { shape: "M 100 100 L 100 100 Z", type: "rotational" },
        ease: "power1.inOut",
      })
        // Step 2: portrait fades in behind the oval
        .to(imgRef.current, { opacity: 1, duration: 1.2 }, "-=0.8")
        // Step 3: title appears
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.9 }, "-=0.3")
        // Step 4: begin button
        .to(btnRef.current, { opacity: 1, y: 0, duration: 0.6 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleBegin = () => {
    playScene(favoritePortrait.song);
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      onComplete: onBegin,
    });
  };

  return (
    <div
      ref={containerRef}
      className="scene fixed inset-0 z-50 bg-[#06080d] flex flex-col items-center justify-center"
    >
      {/* Morphing SVG shape */}
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="absolute w-[min(60vw,400px)] h-[min(60vw,400px)] opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <path
          id="morph-path"
          d="M100,20 C120,20 150,40 160,70 C175,110 155,150 130,165 C110,177 90,177 70,165 C45,150 25,110 40,70 C50,40 80,20 100,20 Z"
          fill="none"
          stroke="hsl(220,40%,60%)"
          strokeWidth="1"
        />
      </svg>

      {/* Portrait behind the morph */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={favoritePortrait.src}
        alt={favoritePortrait.alt}
        className="absolute w-[min(55vw,380px)] h-[min(70vh,540px)] object-cover rounded-[2px] opacity-0"
        style={{ clipPath: "ellipse(42% 48% at 50% 50%)" }}
      />

      {/* Title */}
      <h1
        ref={titleRef}
        className="entrance-title relative z-10 mt-[60vh]"
      >
        I drew this world for you
      </h1>

      {/* Begin button */}
      <button
        ref={btnRef}
        onClick={handleBegin}
        className="relative z-10 mt-8 px-10 py-3 text-base tracking-widest uppercase font-light border border-white/20 rounded-full text-white/70 hover:text-white hover:border-white/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        style={{ opacity: 0 }}
      >
        Begin
      </button>
    </div>
  );
}
