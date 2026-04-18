"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import type { PortraitScene } from "@/data/scenes";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  portraits: PortraitScene[];
  sceneIndex: number; // 2, 3, or 4
}

export default function Scene02_Gallery({ portraits, sceneIndex }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { playScene, currentSong } = useAudio();

  return (
    <section
      ref={sectionRef}
      className="relative"
      aria-label={`Gallery section ${sceneIndex}`}
    >
      {portraits.map((portrait, i) => (
        <PortraitReveal
          key={portrait.src}
          portrait={portrait}
          index={i}
          onEnter={() => {
            if (currentSong !== portrait.song) playScene(portrait.song);
          }}
        />
      ))}
    </section>
  );
}

function PortraitReveal({
  portrait,
  index,
  onEnter,
}: {
  portrait: PortraitScene;
  index: number;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ink-wash reveal: image starts very blurred + transparent, a radial mask expands
      gsap.set(imgRef.current, { opacity: 0, filter: "blur(30px) saturate(0.3)" });

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 65%",
        onEnter: () => {
          onEnter();
          gsap.to(imgRef.current, {
            opacity: 1,
            filter: "blur(0px) saturate(1)",
            duration: 1.8,
            ease: "power2.out",
          });
        },
        once: true,
      });
    }, ref);

    return () => ctx.revert();
  }, [onEnter]);

  return (
    <div
      ref={ref}
      className="scene flex flex-col items-center justify-center py-20"
      style={{ minHeight: "100vh" }}
    >
      {/* Portrait */}
      <div className="portrait-wrap relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={portrait.src}
          alt={portrait.alt}
          className="w-[min(72vw,520px)] h-[min(80vh,640px)] object-cover rounded-[1px]"
        />
      </div>

      {/* Floating quote if present */}
      {portrait.quote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-10 text-center max-w-sm px-4"
        >
          <p className="font-[family-name:var(--font-caveat)] text-2xl text-white/60 leading-relaxed">
            {portrait.quote[0]}
          </p>
          <p className="font-[family-name:var(--font-caveat)] text-xl text-white/40 mt-2 leading-relaxed">
            {portrait.quote[1]}
          </p>
        </motion.div>
      )}
    </div>
  );
}
