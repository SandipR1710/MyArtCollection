"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/components/providers/AudioProvider";

export default function AmbientOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { muted, toggleMute, analyserNode, currentSong } = useAudio();
  const [hovered, setHovered] = useState(false);

  const songName = currentSong
    ? currentSong.split("/").pop()!.replace(".mp3", "").replace(/_/g, " ")
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const SIZE = 52;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2;
    const dataArray = analyserNode
      ? new Uint8Array(analyserNode.frequencyBinCount)
      : null;

    let tick = 0;

    const draw = () => {
      tick++;
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Get audio data
      if (analyserNode && dataArray) {
        analyserNode.getByteTimeDomainData(dataArray);
      }

      // Build 32-point deformed circle
      const points = 32;
      const baseR = 18;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let audioAmp = 0;
        if (dataArray) {
          const idx = Math.floor((i / points) * dataArray.length);
          audioAmp = (dataArray[idx] - 128) / 128;
        }
        // Simplex-like organic drift using sin/cos harmonics
        const drift =
          Math.sin(angle * 3 + tick * 0.02) * 2 +
          Math.cos(angle * 5 - tick * 0.015) * 1.5;
        const r = baseR + drift + audioAmp * 6;
        const x = cx + Math.cos(angle) * r;
        const y = cx + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Glow fill
      const grad = ctx.createRadialGradient(cx, cx, 2, cx, cx, baseR + 8);
      grad.addColorStop(
        0,
        `hsla(${getComputedStyle(document.documentElement).getPropertyValue("--scene-h")}, 60%, 70%, ${muted ? 0.2 : 0.5})`
      );
      grad.addColorStop(1, "hsla(220, 20%, 30%, 0.1)");
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = `hsla(${getComputedStyle(document.documentElement).getPropertyValue("--scene-h")}, 50%, 70%, ${muted ? 0.15 : 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserNode, muted]);

  return (
    <div
      className="ambient-orb"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={toggleMute}
      role="button"
      aria-label={muted ? "Unmute music" : "Mute music"}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleMute(); }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Song tooltip on hover */}
      {hovered && songName && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/80 whitespace-nowrap pointer-events-none"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {songName}
          <span className="ml-2 opacity-50">{muted ? "muted" : "♪"}</span>
        </div>
      )}
    </div>
  );
}
