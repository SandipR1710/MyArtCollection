"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useInView } from "framer-motion";
import { artistPortrait, galleryPortraits, favoritePortrait } from "@/data/scenes";
import { duetsData } from "@/data/duets";
import { artistMessage } from "@/data/poems";
import { useAudio } from "@/components/providers/AudioProvider";

gsap.registerPlugin(TextPlugin, DrawSVGPlugin, ScrollTrigger);

// All 14 drawn portraits (favorite + gallery + duet portraits) — constellation
const allPortraits = [
  favoritePortrait,
  ...galleryPortraits,
  ...duetsData.map((d) => ({ src: d.portraitSrc, alt: d.altPortrait })),
];

const DOT_SIZE    = 40;
const PAD         = DOT_SIZE / 2 + 14; // extra clearance so dots never clip

function buildLayout(rx: number, ry: number, centerSize: number) {
  const positions = allPortraits.map((_, i) => {
    const angle = (i / allPortraits.length) * Math.PI * 2 - Math.PI / 2;
    return { x: rx * Math.cos(angle), y: ry * Math.sin(angle) };
  });
  const cx = rx + PAD;
  const cy = ry + PAD;
  return { positions, cx, cy, w: cx * 2, h: cy * 2, centerSize };
}

export default function Scene12_Artist() {
  const sectionRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { playScene } = useAudio();
  const isInView = useInView(sectionRef, { once: true, margin: "-15%" });
  const played = useRef(false);

  // Responsive constellation radii
  const [layout, setLayout] = useState(() => buildLayout(180, 150, 116));

  useEffect(() => {
    const compute = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 800;
      const isMobile = vw < 640;
      // Reserve 90px on right for ambient orb
      const safe = vw - 90;
      const rx = Math.min(isMobile ? 130 : 200, safe * (isMobile ? 0.34 : 0.38));
      const ry = Math.min(isMobile ? 120 : 170, safe * (isMobile ? 0.32 : 0.36));
      // Center photo scales with the ring so it never crowds the thumbnails
      const centerSize = isMobile ? 96 : 120;
      setLayout(buildLayout(rx, ry, centerSize));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (!isInView || played.current) return;
    played.current = true;
    playScene(artistPortrait.song);
    document.documentElement.style.setProperty("--scene-h", "220");

    const ctx = gsap.context(() => {
      // Type the artist message AFTER constellation has had time to appear
      gsap.to(messageRef.current, {
        duration: artistMessage.length * 0.035,
        text: { value: artistMessage, delimiter: "" },
        ease: "none",
        delay: 2.2,
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
            stagger: 0.08,
            ease: "power1.inOut",
            delay: 0.8,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isInView, playScene]);

  const { positions, cx, cy, w: SVG_W, h: SVG_H, centerSize } = layout;

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center py-20 overflow-hidden"
      style={{ background: "var(--background)", minHeight: "100vh" }}
      aria-label="The artist"
    >
      {/* Constellation: SVG lines + portrait thumbnails */}
      <div
        className="relative"
        style={{ width: SVG_W, height: SVG_H }}
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
          {positions.map((p, i) => (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${cx + p.x} ${cy + p.y}`}
              className="constellation-line"
              fill="none"
              stroke="hsl(220, 40%, 55%)"
              strokeWidth="0.6"
              opacity="0.35"
            />
          ))}
        </svg>

        {/* Portrait thumbnails (circles) */}
        {allPortraits.map((portrait, i) => (
          <motion.div
            key={portrait.src + i}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 0.75, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 * i, ease: "backOut" }}
            viewport={{ once: true }}
            className="constellation-dot"
            style={{
              position: "absolute",
              width: DOT_SIZE,
              height: DOT_SIZE,
              left: cx + positions[i].x - DOT_SIZE / 2,
              top:  cy + positions[i].y - DOT_SIZE / 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait.src} alt="" className="w-full h-full object-cover rounded-full" />
          </motion.div>
        ))}

        {/* Artist photo — circular center matching thumbnail style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-10 rounded-full overflow-hidden"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: centerSize,
            height: centerSize,
            boxShadow: "0 0 0 2px hsla(220,40%,60%,0.35), 0 0 40px 8px hsla(220,60%,50%,0.25)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artistPortrait.src}
            alt={artistPortrait.alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Typed message — clearly below constellation, never overlapping */}
      <div className="mt-12 max-w-xl mx-auto px-6 text-center">
        <p
          ref={messageRef}
          className="text-white/70 leading-relaxed"
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
