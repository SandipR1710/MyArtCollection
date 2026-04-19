"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

interface AudioContextValue {
  playScene: (songSrc: string) => void;
  stopScene: (fadeMs?: number) => void;
  muted: boolean;
  toggleMute: () => void;
  currentSong: string | null;
  analyserNode: AnalyserNode | null;
}

const AudioCtx = createContext<AudioContextValue>({
  playScene: () => {},
  stopScene: () => {},
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
  // Use state (not just ref) so consumers re-render when analyser is ready
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Track which audio element is already connected (MediaElementSource is one-per-element)
  const connectedNodes = useRef<WeakSet<HTMLMediaElement>>(new WeakSet());
  const mutedRef = useRef(false);

  const setupAnalyser = useCallback((howl: Howl) => {
    try {
      // @ts-expect-error — Howler exposes _sounds internally
      const node: HTMLMediaElement | undefined = howl._sounds?.[0]?._node;
      if (!node) return;

      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Only create MediaElementSource once per element — calling it twice throws
      if (!connectedNodes.current.has(node)) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        const src = ctx.createMediaElementSource(node);
        src.connect(analyser);
        analyser.connect(ctx.destination);
        connectedNodes.current.add(node);
        setAnalyserNode(analyser);
      }
    } catch {
      // Web Audio unavailable — orb animates via harmonics only
    }
  }, []);

  const currentSrcRef = useRef<string | null>(null);

  const playScene = useCallback(
    (songSrc: string) => {
      // Skip if already playing this song (prevents pool exhaustion on rapid scroll)
      if (currentSrcRef.current === songSrc) return;
      currentSrcRef.current = songSrc;

      // Fade out previous
      if (howlRef.current) {
        const prev = howlRef.current;
        prev.fade(prev.volume(), 0, 700);
        setTimeout(() => prev.unload(), 800);
      }

      const vol = mutedRef.current ? 0 : 0.55;
      const howl = new Howl({
        src: [songSrc],
        html5: true,
        loop: true,
        volume: 0,
        onplay: () => {
          howl.fade(0, vol, 800);
          setupAnalyser(howl);
        },
      });

      howl.play();
      howlRef.current = howl;
      setCurrentSong(songSrc);
    },
    [setupAnalyser]
  );

  const stopScene = useCallback((fadeMs = 500) => {
    const prev = howlRef.current;
    if (prev) {
      prev.fade(prev.volume(), 0, fadeMs);
      setTimeout(() => prev.unload(), fadeMs + 100);
    }
    howlRef.current = null;
    currentSrcRef.current = null;
    // Intentionally leave currentSong state alone so the ambient orb
    // stays visible during a deliberate silence.
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      howlRef.current?.volume(next ? 0 : 0.55);
      return next;
    });
  }, []);

  useEffect(() => () => { howlRef.current?.unload(); }, []);

  return (
    <AudioCtx.Provider value={{ playScene, stopScene, muted, toggleMute, currentSong, analyserNode }}>
      {children}
    </AudioCtx.Provider>
  );
}
