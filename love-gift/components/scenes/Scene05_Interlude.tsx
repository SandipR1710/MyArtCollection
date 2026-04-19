"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useAudio } from "@/components/providers/AudioProvider";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Props {
  nextSong: string;
}

export default function Scene05_Interlude({ nextSong }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef = useRef<(HTMLParagraphElement | null)[]>([]);
  const { playScene, stopScene } = useAudio();
  const triggered = useRef(false);

  const interludeLines = ["Six flowers.", "Six portraits.", "One language."];

  useEffect(() => {
    const ctx = gsap.context(() => {
      linesRef.current.forEach((line, i) => {
        if (!line) return;
        gsap.fromTo(
          line,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: line,
              start: "top 70%",
              once: true,
            },
            delay: i * 0.3,
          }
        );
      });

      // Trigger the silence-to-music cut when this section enters
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 50%",
        once: true,
        onEnter: () => {
          if (triggered.current) return;
          triggered.current = true;
          // Hard fade-out current song immediately (500ms),
          // then hold ~1.2s of genuine silence before the next track lifts in.
          stopScene(500);
          setTimeout(() => playScene(nextSong), 1700);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [nextSong, playScene, stopScene]);

  return (
    <section
      ref={sectionRef}
      className="scene scene-bg flex-col gap-10"
      aria-label="Interlude"
    >
      <div className="flex flex-col items-center gap-8 px-8">
        {interludeLines.map((text, i) => (
          <p
            key={text}
            ref={(el) => { linesRef.current[i] = el; }}
            className="interlude-line text-white/80"
            style={{
              fontSize: `clamp(${1.8 + i * 0.8}rem, ${3 + i * 1.5}vw, ${3.5 + i * 1.5}rem)`,
              fontWeight: 300,
              letterSpacing: "0.1em",
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}
