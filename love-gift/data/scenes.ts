export interface PortraitScene {
  src: string;
  alt: string;
  song: string;
  quote?: [string, string];
}

export const favoritePortrait = {
  src: "/images/img7.jpeg",
  alt: "Favorite portrait",
  song: "/audio/Kahani_Suno_2.0.mp3",
};

// Gallery portraits in order (scenes 2-4), index 1-8 (excluding img7 which is favorite)
export const galleryPortraits: PortraitScene[] = [
  { src: "/images/img1.jpeg", alt: "Portrait 1", song: "/audio/I_Love_You.mp3" },
  { src: "/images/img2.jpeg", alt: "Portrait 2", song: "/audio/Enna_Sona.mp3" },
  { src: "/images/img3.jpeg", alt: "Portrait 3", song: "/audio/Kaun_Tujhe.mp3" },
  { src: "/images/img4.jpeg", alt: "Portrait 4", song: "/audio/Humnava.mp3",   quote: ["You arrived like quiet rain.", "My storms learned to rest."] },
  { src: "/images/img5.jpeg", alt: "Portrait 5", song: "/audio/Maand.mp3",     quote: ["Moonlight learns your name.", "Softly, the night agrees."] },
  { src: "/images/img6.jpeg", alt: "Portrait 6", song: "/audio/Nazar_Na.mp3",  quote: ["When you breathe, rooms soften.", "Even clocks keep gentler time."] },
  { src: "/images/img8.jpeg", alt: "Portrait 7", song: "/audio/Tum_Hi_Ho.mp3" },
  { src: "/images/img.jpeg",  alt: "Portrait 8", song: "/audio/Jhol_Acoustic.mp3", quote: ["Every street hums lighter.", "You fold distance into nearness."] },
];

export const artistPortrait = {
  src: "/images/Artist.JPG",
  alt: "Sandip — the artist",
  song: "/audio/O_Radhe_Radhe.mp3",
};

export const restSong = "/audio/Maand.mp3";
