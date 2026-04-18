"use client";

import { useState } from "react";
import Scene00_Entrance from "@/components/scenes/Scene00_Entrance";
import Scene01_Favorite from "@/components/scenes/Scene01_Favorite";
import Scene02_Gallery from "@/components/scenes/Scene02_Gallery";
import Scene05_Interlude from "@/components/scenes/Scene05_Interlude";
import Scene06_Duet from "@/components/scenes/Scene06_Duet";
import Scene12_Artist from "@/components/scenes/Scene12_Artist";
import Scene13_Outro from "@/components/scenes/Scene13_Outro";
import { galleryPortraits } from "@/data/scenes";
import { duetsData } from "@/data/duets";

// Split gallery portraits into 3 sections (scenes 2, 3, 4)
const gallerySection1 = galleryPortraits.slice(0, 3);
const gallerySection2 = galleryPortraits.slice(3, 6);
const gallerySection3 = galleryPortraits.slice(6, 8);

// The song that plays after the interlude silence cut
const INTERLUDE_NEXT_SONG = duetsData[0].song; // Tum Ho Toh

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main>
      {/* Scene 0 — Entrance overlay (unmounts after "Begin") */}
      {!started && <Scene00_Entrance onBegin={() => setStarted(true)} />}

      {/* Scene 1 — Favorite portrait + poem (pinned) */}
      <Scene01_Favorite />

      {/* Scenes 2–4 — Gallery portraits */}
      <Scene02_Gallery portraits={gallerySection1} sceneIndex={2} />
      <Scene02_Gallery portraits={gallerySection2} sceneIndex={3} />
      <Scene02_Gallery portraits={gallerySection3} sceneIndex={4} />

      {/* Scene 5 — Interlude */}
      <Scene05_Interlude nextSong={INTERLUDE_NEXT_SONG} />

      {/* Scenes 6–11 — Flower-portrait duets */}
      {duetsData.map((duet) => (
        <Scene06_Duet key={duet.flowerName} duet={duet} />
      ))}

      {/* Scene 12 — The artist */}
      <Scene12_Artist />

      {/* Scene 13 — Outro */}
      <Scene13_Outro />
    </main>
  );
}
