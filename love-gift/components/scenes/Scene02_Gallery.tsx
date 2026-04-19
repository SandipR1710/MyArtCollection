"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import { usePortraitSize } from "@/hooks/usePortraitSize";
import InkReveal, { type InkRevealHandle } from "@/components/shared/InkReveal";
import type { PortraitScene } from "@/data/scenes";

// Hue hints per gallery portrait — subtle scene color shifts
const HUE_HINTS = [200, 180, 250, 210, 270, 20, 340, 40];

interface Props {
  portraits: PortraitScene[];
  sceneIndex: number;
}

export default function Scene02_Gallery({ portraits, sceneIndex }: Props) {
  return (
    <section aria-label={`Gallery section ${sceneIndex}`}>
      {portraits.map((portrait, i) => (
        <PortraitScene key={portrait.src} portrait={portrait} hue={HUE_HINTS[(sceneIndex - 2) * 3 + i] ?? 220} />
      ))}
    </section>
  );
}

function PortraitScene({ portrait, hue }: { portrait: PortraitScene; hue: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inkRef = useRef<InkRevealHandle>(null);
  const { w, h } = usePortraitSize(420, 540, 0.82);
  const { playScene, currentSong } = useAudio();
  const isInView = useInView(ref, { once: true, margin: "-25%" });
  const played = useRef(false);

  useEffect(() => {
    if (!isInView || played.current) return;
    played.current = true;
    if (currentSong !== portrait.song) playScene(portrait.song);
    document.documentElement.style.setProperty("--scene-h", String(hue));
    // Ink-reveal the portrait organically once it enters view
    const t = setTimeout(() => inkRef.current?.reveal(2000), 550);
    return () => clearTimeout(t);
  }, [isInView, currentSong, playScene, portrait.song, hue]);

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center"
      style={{ minHeight: "100vh", height: "100vh" }}
    >
      {/* Per-scene radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, hsla(${hue},40%,18%,0.45) 0%, transparent 70%)`,
          transition: "background 1.2s ease",
        }}
      />

      <div className="relative flex flex-col items-center gap-8 px-4">
        {/* Portrait frame */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="portrait-wrap relative"
          style={{ width: w, height: h }}
        >
          <div
            className="absolute inset-0 rounded-[2px] pointer-events-none z-10"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(240,236,228,0.10), 0 10px 50px 10px rgba(0,0,0,0.8), 0 0 90px 24px rgba(0,0,0,0.55)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait.src}
            alt={portrait.alt}
            className="w-full h-full object-cover rounded-[2px]"
            style={{ display: "block" }}
          />
          {/* Ink-wash reveal — draws the portrait organically */}
          <InkReveal ref={inkRef} width={Math.round(w)} height={Math.round(h)} />
          {/* Corner accent marks */}
          <span className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20 rounded-tl-sm z-10" />
          <span className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20 rounded-tr-sm z-10" />
          <span className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20 rounded-bl-sm z-10" />
          <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20 rounded-br-sm z-10" />
        </motion.div>

        {/* Floating quote — always shown (fallback for portraits without quotes) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 0.9, ease: "easeOut" }}
          className="text-center px-4"
          style={{ maxWidth: Math.min(w + 40, 520) }}
        >
          {portrait.quote ? (
            <>
              <p
                className="text-white/70 leading-relaxed"
                style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)" }}
              >
                {portrait.quote[0]}
              </p>
              <p
                className="text-white/40 mt-1 leading-relaxed"
                style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)" }}
              >
                {portrait.quote[1]}
              </p>
            </>
          ) : (
            <p
              className="text-white/30 leading-relaxed tracking-widest uppercase"
              style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "0.72rem", letterSpacing: "0.3em" }}
            >
              {portrait.song.split("/").pop()!.replace(".mp3", "").replace(/_/g, " ")}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
