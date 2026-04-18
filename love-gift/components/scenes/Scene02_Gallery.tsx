"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import { usePortraitSize } from "@/hooks/usePortraitSize";
import type { PortraitScene } from "@/data/scenes";

interface Props {
  portraits: PortraitScene[];
  sceneIndex: number;
}

export default function Scene02_Gallery({ portraits, sceneIndex }: Props) {
  return (
    <section aria-label={`Gallery section ${sceneIndex}`}>
      {portraits.map((portrait, i) => (
        <PortraitReveal key={portrait.src} portrait={portrait} index={i} />
      ))}
    </section>
  );
}

function PortraitReveal({ portrait, index }: { portrait: PortraitScene; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { w, h } = usePortraitSize(460, 580);
  const { playScene, currentSong } = useAudio();
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const played = useRef(false);

  useEffect(() => {
    if (!isInView || played.current) return;
    played.current = true;
    if (currentSong !== portrait.song) playScene(portrait.song);
  }, [isInView, currentSong, playScene, portrait.song]);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center justify-center py-24"
      style={{ minHeight: "100vh" }}
    >
      {/* Subtle scene glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, hsla(var(--scene-h),40%,18%,0.35) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative flex flex-col items-center gap-10"
        style={{ maxWidth: "min(90vw, 700px)" }}
      >
        {/* Portrait frame */}
        <motion.div
          initial={{ opacity: 0, y: 36, filter: "blur(18px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="portrait-wrap relative"
          style={{ width: w, height: h }}
        >
          {/* Paper border frame */}
          <div
            className="absolute inset-0 rounded-[2px] pointer-events-none z-10"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(240,236,228,0.08), 0 0 60px 12px rgba(0,0,0,0.55)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait.src}
            alt={portrait.alt}
            className="w-full h-full object-cover rounded-[2px]"
            style={{ display: "block" }}
          />
          {/* Corner accent marks */}
          <span className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20 rounded-tl-sm" />
          <span className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20 rounded-tr-sm" />
          <span className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20 rounded-bl-sm" />
          <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20 rounded-br-sm" />
        </motion.div>

        {/* Floating quote */}
        {portrait.quote && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.9, ease: "easeOut" }}
            className="text-center px-4"
            style={{ maxWidth: Math.min(w + 40, 520) }}
          >
            <p
              className="text-white/65 leading-relaxed"
              style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)" }}
            >
              {portrait.quote[0]}
            </p>
            {portrait.quote[1] && (
              <p
                className="text-white/35 mt-1 leading-relaxed"
                style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)" }}
              >
                {portrait.quote[1]}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
