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
    const SIZE = 88;
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

      const points = 48;
      const baseR = 26;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let audioAmp = 0;
        if (dataArray) {
          const idx = Math.floor((i / points) * dataArray.length);
          audioAmp = (dataArray[idx] - 128) / 128;
        }
        const drift =
          Math.sin(angle * 3 + tick * 0.016) * 4.5 +
          Math.cos(angle * 5 - tick * 0.011) * 2.8 +
          Math.sin(angle * 7 + tick * 0.009) * 1.2;
        const r = baseR + drift + audioAmp * 14;
        const x = cx + Math.cos(angle) * r;
        const y = cx + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      const sceneH = getComputedStyle(document.documentElement)
        .getPropertyValue("--scene-h").trim() || "220";
      const alpha = muted ? 0.12 : 0.55;
      const strokeAlpha = muted ? 0.10 : 0.80;

      /* outer glow — two passes */
      ctx.save();
      ctx.shadowColor = `hsla(${sceneH}, 70%, 65%, ${muted ? 0.08 : 0.5})`;
      ctx.shadowBlur = muted ? 6 : 18;
      const grad = ctx.createRadialGradient(cx, cx, 3, cx, cx, baseR + 14);
      grad.addColorStop(0, `hsla(${sceneH}, 75%, 78%, ${alpha})`);
      grad.addColorStop(0.55, `hsla(${sceneH}, 55%, 55%, ${alpha * 0.6})`);
      grad.addColorStop(1, `hsla(${sceneH}, 30%, 30%, 0.0)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${sceneH}, 65%, 80%, ${strokeAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

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
