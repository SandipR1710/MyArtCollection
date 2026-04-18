"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import InkReveal, { type InkRevealHandle } from "@/components/shared/InkReveal";
import { useAudio } from "@/components/providers/AudioProvider";
import type { PortraitScene } from "@/data/scenes";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  portraits: PortraitScene[];
  sceneIndex: number;
}

export default function Scene02_Gallery({ portraits, sceneIndex }: Props) {
  return (
    <section aria-label={`Gallery section ${sceneIndex}`}>
      {portraits.map((portrait) => (
        <PortraitReveal key={portrait.src} portrait={portrait} />
      ))}
    </section>
  );
}

function PortraitReveal({ portrait }: { portrait: PortraitScene }) {
  const ref = useRef<HTMLDivElement>(null);
  const inkRef = useRef<InkRevealHandle>(null);
  const [dims] = useState({ w: 520, h: 640 });
  const { playScene, currentSong } = useAudio();
  const revealed = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 60%",
        once: true,
        onEnter: () => {
          if (revealed.current) return;
          revealed.current = true;
          if (currentSong !== portrait.song) playScene(portrait.song);
          inkRef.current?.reveal(2000);
        },
      });
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="scene flex flex-col items-center justify-center py-20"
      style={{ minHeight: "100vh" }}
    >
      {/* Portrait with ink-reveal */}
      <div
        className="portrait-wrap relative"
        style={{ width: dims.w, height: dims.h }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait.src}
          alt={portrait.alt}
          className="w-full h-full object-cover rounded-[1px]"
        />
        <InkReveal ref={inkRef} width={dims.w} height={dims.h} />
      </div>

      {/* Floating quote */}
      {portrait.quote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          viewport={{ once: true }}
          className="mt-10 text-center max-w-sm px-4"
        >
          <p
            className="text-white/60 leading-relaxed"
            style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}
          >
            {portrait.quote[0]}
          </p>
          <p
            className="text-white/35 mt-2 leading-relaxed"
            style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
          >
            {portrait.quote[1]}
          </p>
        </motion.div>
      )}
    </div>
  );
}
