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

  // Trigger ink reveal shortly after mount (portrait should appear quickly)
  useEffect(() => {
    const t = setTimeout(() => inkRef.current?.reveal(2000), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin scene for 200vh of scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=200vh",
        pin: pinRef.current,
        pinSpacing: true,
      });

      // Poem lines stagger in as user scrolls through the pin
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150vh",
          scrub: 1.4,
        },
      });

      lineRefs.current.forEach((line, i) => {
        tl.fromTo(
          line,
          { opacity: 0, y: 20, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.2, ease: "power2.out" },
          0.1 + i * 0.18
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 px-8 max-w-5xl mx-auto w-full">

          {/* Portrait — always visible; InkReveal canvas sits on top and erases itself */}
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

          {/* Poem lines scroll in */}
          <div className="flex flex-col gap-5 max-w-xs">
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
