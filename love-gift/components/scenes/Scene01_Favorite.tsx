"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { favoritePortrait } from "@/data/scenes";
import { favoriteNoteLines } from "@/data/poems";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export default function Scene01_Favorite() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const poemRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

      // Poem lines write in as scroll progresses through the pin
      const poemTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200vh",
          scrub: 1,
        },
      });

      // Portrait reveals with a scale + opacity on scroll entry
      poemTl.fromTo(
        imgRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2 }
      );

      // Poem lines stagger in
      lineRefs.current.forEach((line, i) => {
        poemTl.fromTo(
          line,
          { opacity: 0, y: 18, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.18 },
          0.2 + i * 0.15
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
      <div
        ref={pinRef}
        className="scene-pin w-full"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 px-8 max-w-5xl mx-auto w-full">
          {/* Portrait */}
          <div className="portrait-wrap flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={favoritePortrait.src}
              alt={favoritePortrait.alt}
              className="w-[min(42vw,340px)] h-[min(55vh,480px)] object-cover rounded-[2px]"
              style={{ opacity: 0 }}
            />
          </div>

          {/* Poem */}
          <div
            ref={poemRef}
            className="flex flex-col gap-5"
          >
            {favoriteNoteLines.map((line, i) => (
              <span
                key={i}
                ref={(el) => { lineRefs.current[i] = el; }}
                className="poem-line block"
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
