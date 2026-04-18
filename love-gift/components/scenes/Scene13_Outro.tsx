"use client";

import { motion } from "framer-motion";

export default function Scene13_Outro() {
  return (
    <section
      className="scene scene-bg flex-col gap-8"
      aria-label="Outro"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 2 }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-4"
      >
        {/* Petal-flower mosaic made of portrait thumbnails */}
        <div className="relative w-48 h-48 mb-4" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 68;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: "backOut" }}
                viewport={{ once: true }}
                className="absolute w-14 h-14 rounded-full overflow-hidden"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * r}px - 28px)`,
                  top: `calc(50% + ${Math.sin(angle) * r}px - 28px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/img${i + 1}.jpeg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.4 }}
          viewport={{ once: true }}
          className="entrance-title text-white/80 text-center px-8"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
        >
          I will always love you.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 2.5 }}
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
