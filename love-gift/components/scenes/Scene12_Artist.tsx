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

// Ellipse layout: 14 thumbnails arranged around a central artist photo
// Using smaller radii so the whole thing fits inside most viewports
const ELLIPSE_RX = 230;
const ELLIPSE_RY = 160;
const DOT_SIZE   = 52;
const PAD        = DOT_SIZE; // padding so edge dots don't clip

const POSITIONS = allPortraits.map((_, i) => {
  const angle = (i / allPortraits.length) * Math.PI * 2 - Math.PI / 2;
  return {
    x: ELLIPSE_RX * Math.cos(angle),
    y: ELLIPSE_RY * Math.sin(angle),
  };
});

// Center of the SVG coordinate space
const CX = ELLIPSE_RX + PAD;
const CY = ELLIPSE_RY + PAD;
const SVG_W = CX * 2;
const SVG_H = CY * 2;

function buildConstellationPaths(): string[] {
  return POSITIONS.map(
    (p) => `M ${CX} ${CY} L ${CX + p.x} ${CY + p.y}`
  );
}

export default function Scene12_Artist() {
  const sectionRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { playScene } = useAudio();
  const isInView = useInView(sectionRef, { once: true, margin: "-15%" });
  const played = useRef(false);

  useEffect(() => {
    if (!isInView || played.current) return;
    played.current = true;
    playScene(artistPortrait.song);
    document.documentElement.style.setProperty("--scene-h", "220");

    const ctx = gsap.context(() => {
      // Type the artist message
      gsap.to(messageRef.current, {
        duration: artistMessage.length * 0.042,
        text: { value: artistMessage, delimiter: "" },
        ease: "none",
        delay: 1.4,
      });

      // Draw constellation lines one by one
      const lines = svgRef.current?.querySelectorAll(".constellation-line");
      if (lines?.length) {
        gsap.fromTo(
          lines,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 0.4,
            stagger: 0.1,
            ease: "power1.inOut",
            delay: 0.8,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isInView, playScene]);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center py-28"
      style={{ minHeight: "180vh", background: "var(--background)" }}
      aria-label="The artist"
    >
      {/* Constellation: SVG lines + portrait thumbnails */}
      <div
        className="relative"
        style={{ width: SVG_W, height: SVG_H, maxWidth: "95vw", overflow: "visible" }}
      >

        {/* SVG lines */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        >
          {buildConstellationPaths().map((d, i) => (
            <path
              key={i}
              d={d}
              className="constellation-line"
              fill="none"
              stroke="hsl(220, 40%, 55%)"
              strokeWidth="0.6"
              opacity="0.35"
            />
          ))}
        </svg>

        {/* Portrait thumbnails */}
        {allPortraits.map((portrait, i) => (
          <motion.div
            key={portrait.src}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 0.75, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 * i, ease: "backOut" }}
            viewport={{ once: true }}
            className="constellation-dot"
            style={{
              position: "absolute",
              width: DOT_SIZE,
              height: DOT_SIZE,
              left: CX + POSITIONS[i].x - DOT_SIZE / 2,
              top:  CY + POSITIONS[i].y - DOT_SIZE / 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait.src} alt="" className="w-full h-full object-cover rounded-full" />
          </motion.div>
        ))}

        {/* Artist photo — center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="portrait-wrap relative z-10"
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artistPortrait.src}
            alt={artistPortrait.alt}
            className="object-cover rounded-sm"
            style={{ width: 200, height: 270 }}
          />
        </motion.div>
      </div>

      {/* Typed message */}
      <div className="mt-16 max-w-xl mx-auto px-6 text-center">
        <p
          ref={messageRef}
          className="text-white/65 leading-relaxed"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
            fontStyle: "italic",
            minHeight: "6em",
          }}
        />
      </div>
    </section>
  );
}
