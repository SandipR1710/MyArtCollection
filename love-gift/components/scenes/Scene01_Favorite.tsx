"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkReveal, { type InkRevealHandle } from "@/components/shared/InkReveal";
import { usePortraitSize } from "@/hooks/usePortraitSize";
import { favoritePortrait } from "@/data/scenes";
import { favoriteNoteLines } from "@/data/poems";

gsap.registerPlugin(ScrollTrigger);

export default function Scene01_Favorite() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef     = useRef<HTMLDivElement>(null);
  const inkRef     = useRef<InkRevealHandle>(null);
  const lineRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const { w: IMG_W, h: IMG_H } = usePortraitSize(340, 480, 0.85);

  // Ink reveal fires on mount, then poem lines stagger in after portrait appears
  useEffect(() => {
    const t = setTimeout(() => {
      inkRef.current?.reveal(1600);
      // Stagger poem lines in after ink completes
      gsap.fromTo(
        lineRefs.current,
        { opacity: 0, y: 18, filter: "blur(6px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 0.8, stagger: 0.35, ease: "power2.out",
          delay: 1.7,
        }
      );
    }, 350);
    return () => clearTimeout(t);
  }, []);

  // Pin the scene for 180vh of scroll — portrait stays center stage
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=180vh",
        pin: pinRef.current,
        pinSpacing: true,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      aria-label="Featured portrait"
    >
      <div ref={pinRef} className="scene-pin w-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 px-8 max-w-5xl mx-auto w-full">

          {/* Portrait */}
          <div
            className="portrait-wrap flex-shrink-0 relative"
            style={{ width: IMG_W, height: IMG_H }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={favoritePortrait.src}
              alt={favoritePortrait.alt}
              className="w-full h-full object-cover rounded-[2px]"
            />
            <InkReveal ref={inkRef} width={IMG_W} height={IMG_H} />
          </div>

          {/* Poem lines — stagger in after ink reveal */}
          <div className="flex flex-col gap-4 max-w-xs">
            {favoriteNoteLines.map((line, i) => (
              <span
                key={i}
                ref={(el) => { lineRefs.current[i] = el; }}
                className="poem-line block"
                style={{ opacity: 0 }}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
