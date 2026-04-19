"use client";

import { motion } from "framer-motion";
import { favoritePortrait, galleryPortraits } from "@/data/scenes";
import { duetsData } from "@/data/duets";

// All 14 portrait thumbnails (favorite + gallery + duet portraits)
const allThumbs = [
  favoritePortrait.src,
  ...galleryPortraits.map((p) => p.src),
  ...duetsData.map((d) => d.portraitSrc),
];

export default function Scene13_Outro() {
  return (
    <section
      className="scene scene-bg flex-col gap-8 py-24"
      aria-label="Outro"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-10"
      >
        {/* Petal-flower mosaic — all portraits in rose pattern */}
        <div className="relative w-64 h-64" aria-hidden="true">
          {allThumbs.map((src, i) => {
            // Two concentric rings for 14 thumbnails (7 outer + 7 inner)
            const isOuter = i % 2 === 0;
            const ringIdx = Math.floor(i / 2);
            const ringCount = Math.ceil(allThumbs.length / 2);
            const angle = (ringIdx / ringCount) * Math.PI * 2 + (isOuter ? 0 : Math.PI / ringCount);
            const r = isOuter ? 100 : 58;
            const size = isOuter ? 48 : 40;
            return (
              <motion.div
                key={src + i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.85, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.06, ease: "backOut" }}
                viewport={{ once: true }}
                className="absolute rounded-full overflow-hidden"
                style={{
                  width: size,
                  height: size,
                  left: `calc(50% + ${Math.cos(angle) * r}px - ${size / 2}px)`,
                  top: `calc(50% + ${Math.sin(angle) * r}px - ${size / 2}px)`,
                  boxShadow: "0 0 0 1.5px rgba(255,255,255,0.13), 0 2px 10px rgba(0,0,0,0.55)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0.2, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.4 }}
          viewport={{ once: true }}
          className="entrance-title text-white/85 text-center px-8"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
        >
          I will always love you.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1.6 }}
          viewport={{ once: true }}
          style={{
            fontFamily: "var(--font-caveat), cursive",
            fontSize: "1.5rem",
            color: "white",
          }}
        >
          — Sandip
        </motion.p>
      </motion.div>
    </section>
  );
}
