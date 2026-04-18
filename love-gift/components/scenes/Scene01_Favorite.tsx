"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkReveal, { type InkRevealHandle } from "@/components/shared/InkReveal";
import { favoritePortrait } from "@/data/scenes";
import { favoriteNoteLines } from "@/data/poems";

gsap.registerPlugin(ScrollTrigger);

// Dimensions used for both the img and InkReveal canvas
const IMG_W = 340;
const IMG_H = 480;

export default function Scene01_Favorite() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<InkRevealHandle>(null);
  const poemRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const revealed = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin this scene for 200vh of scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=200vh",
        pin: pinRef.current,
        pinSpacing: true,
      });

      // Scrubbed timeline: reveal + poem appear as user scrolls
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200vh",
          scrub: 1.2,
        },
      });

      // At 10% scroll progress — trigger ink reveal (one-shot)
      tl.add(() => {
        if (!revealed.current) {
          revealed.current = true;
          inkRef.current?.reveal(2200);
        }
      }, 0.1);

      // Portrait wrapper scale in
      tl.fromTo(
        wrapRef.current,
        { scale: 0.93, opacity: 0.4 },
        { scale: 1, opacity: 1, duration: 0.2 },
        0
      );

      // Poem lines stagger in from 25%–90% of scroll progress
      lineRefs.current.forEach((line, i) => {
        tl.fromTo(
          line,
          { opacity: 0, y: 22, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.18, ease: "power2.out" },
          0.25 + i * 0.16
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "300vh" }}
      aria-label="Featured portrait"
    >
      <div ref={pinRef} className="scene-pin w-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 px-8 max-w-5xl mx-auto w-full">

          {/* Portrait with ink-reveal overlay */}
          <div
            ref={wrapRef}
            className="portrait-wrap flex-shrink-0 relative"
            style={{ width: IMG_W, height: IMG_H }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={favoritePortrait.src}
              alt={favoritePortrait.alt}
              className="w-full h-full object-cover rounded-[2px]"
            />
            <InkReveal
              ref={inkRef}
              width={IMG_W}
              height={IMG_H}
            />
          </div>

          {/* Poem */}
          <div ref={poemRef} className="flex flex-col gap-6 max-w-xs">
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
