"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

interface AudioContextValue {
  playScene: (songSrc: string) => void;
  muted: boolean;
  toggleMute: () => void;
  currentSong: string | null;
  analyserNode: AnalyserNode | null;
}

const AudioCtx = createContext<AudioContextValue>({
  playScene: () => {},
  muted: false,
  toggleMute: () => {},
  currentSong: null,
  analyserNode: null,
});

export function useAudio() {
  return useContext(AudioCtx);
}

export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const howlRef = useRef<Howl | null>(null);
  const [muted, setMuted] = useState(false);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const setupAnalyser = useCallback((howl: Howl) => {
    try {
      // @ts-expect-error — Howler exposes _sounds internally
      const node = howl._sounds?.[0]?._node;
      if (!node) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      const src = ctx.createMediaElementSource(node);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    } catch {
      // Web Audio not available — orb will skip visualization
    }
  }, []);

  const playScene = useCallback(
    (songSrc: string) => {
      if (!unlockedRef.current) {
        unlockedRef.current = true;
      }

      if (howlRef.current) {
        const prev = howlRef.current;
        prev.fade(prev.volume(), 0, 800);
        setTimeout(() => prev.unload(), 900);
      }

      const howl = new Howl({
        src: [songSrc],
        html5: true,
        loop: true,
        volume: muted ? 0 : 0.55,
        onplay: () => setupAnalyser(howl),
      });

      howl.play();
      howlRef.current = howl;
      setCurrentSong(songSrc);
    },
    [muted, setupAnalyser]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      howlRef.current?.volume(next ? 0 : 0.55);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      howlRef.current?.unload();
    };
  }, []);

  return (
    <AudioCtx.Provider
      value={{ playScene, muted, toggleMute, currentSong, analyserNode: analyserRef.current }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
