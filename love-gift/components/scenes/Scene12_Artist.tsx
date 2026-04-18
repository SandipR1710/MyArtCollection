"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useInView } from "framer-motion";
import { artistPortrait, galleryPortraits, favoritePortrait } from "@/data/scenes";
import { artistMessage } from "@/data/poems";
import { useAudio } from "@/components/providers/AudioProvider";

gsap.registerPlugin(TextPlugin, DrawSVGPlugin, ScrollTrigger);

const allPortraits = [favoritePortrait, ...galleryPortraits];

// Polar layout for the constellation ellipse
const CONSTELLATION_POSITIONS = allPortraits.map((_, i) => {
  const angle = (i / allPortraits.length) * Math.PI * 2 - Math.PI / 2;
  const rx = 340, ry = 220;
  return {
    x: rx * Math.cos(angle),
    y: ry * Math.sin(angle),
  };
});

export default function Scene12_Artist() {
  const sectionRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const { playScene } = useAudio();
  const isInView = useInView(sectionRef, { once: true, margin: "-15%" });
  const played = useRef(false);

  useEffect(() => {
    if (!isInView || played.current) return;
    played.current = true;
    playScene(artistPortrait.song);
    // Reset to neutral palette
    document.documentElement.style.setProperty("--scene-h", "220");

    const ctx = gsap.context(() => {
      gsap.to(messageRef.current, {
        duration: artistMessage.length * 0.045,
        text: { value: artistMessage, delimiter: "" },
        ease: "none",
        delay: 1.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isInView, playScene]);

  return (
    <section
      ref={sectionRef}
      className="scene scene-bg flex-col py-28"
      style={{ minHeight: "200vh" }}
      aria-label="The artist"
    >
      <div className="relative flex items-center justify-center w-full max-w-5xl mx-auto px-8">
        {/* Constellation dots */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          {allPortraits.map((portrait, i) => (
            <motion.div
              key={portrait.src}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: "backOut" }}
              viewport={{ once: true }}
              className="constellation-dot"
              style={{
                transform: `translate(${CONSTELLATION_POSITIONS[i].x}px, ${CONSTELLATION_POSITIONS[i].y}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portrait.src}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Artist photo — center */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="portrait-wrap relative z-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artistPortrait.src}
            alt={artistPortrait.alt}
            className="w-[min(38vw,260px)] h-[min(50vh,360px)] object-cover rounded-[1px]"
          />
        </motion.div>
      </div>

      {/* Typed message */}
      <div className="mt-20 max-w-2xl mx-auto px-8 text-center">
        <p
          ref={messageRef}
          className="text-white/70 leading-relaxed"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            fontStyle: "italic",
          }}
        />
      </div>
    </section>
  );
}
