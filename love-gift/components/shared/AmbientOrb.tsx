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

  // Re-run whenever analyserNode or muted changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const SIZE = 52;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2;

    const dataArray = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;
    let tick = 0;

    cancelAnimationFrame(rafRef.current);

    const draw = () => {
      tick++;
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, SIZE, SIZE);

      if (analyserNode && dataArray) {
        analyserNode.getByteTimeDomainData(dataArray);
      }

      const points = 32;
      const baseR = 17;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let audioAmp = 0;
        if (dataArray) {
          const idx = Math.floor((i / points) * dataArray.length);
          audioAmp = (dataArray[idx] - 128) / 128;
        }
        const drift =
          Math.sin(angle * 3 + tick * 0.018) * 2.2 +
          Math.cos(angle * 5 - tick * 0.012) * 1.4;
        const r = baseR + drift + audioAmp * 7;
        const x = cx + Math.cos(angle) * r;
        const y = cx + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      const sceneH = getComputedStyle(document.documentElement)
        .getPropertyValue("--scene-h").trim() || "220";
      const alpha = muted ? 0.18 : 0.5;
      const strokeAlpha = muted ? 0.12 : 0.65;

      const grad = ctx.createRadialGradient(cx, cx, 2, cx, cx, baseR + 9);
      grad.addColorStop(0, `hsla(${sceneH}, 65%, 72%, ${alpha})`);
      grad.addColorStop(1, `hsla(${sceneH}, 30%, 30%, 0.05)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${sceneH}, 55%, 72%, ${strokeAlpha})`;
      ctx.lineWidth = 1.2;
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

      {hovered && songName && (
        <div
          className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white/80 whitespace-nowrap pointer-events-none"
          style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "0.85rem" }}
        >
          {songName}
          <span className="ml-2 opacity-40">{muted ? "muted" : "♪"}</span>
        </div>
      )}
    </div>
  );
}
