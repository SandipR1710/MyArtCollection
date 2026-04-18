export interface DuetData {
  flowerName: string;
  flowerSrc: string;
  portraitSrc: string;
  song: string;
  altFlower: string;
  altPortrait: string;
  palette: string; // dominant hsl hue hint for CSS vars
}

export const duetsData: DuetData[] = [
  {
    flowerName: "Wild Rose",
    flowerSrc: "/images/Wild_Rose.jpg",
    portraitSrc: "/images/img.jpeg",
    song: "/audio/Tum_Ho_Toh.mp3",
    altFlower: "Close-up of a wild rose bloom",
    altPortrait: "Portrait inspired by a wild rose",
    palette: "350", // deep crimson hue
  },
  {
    flowerName: "Pink Rose",
    flowerSrc: "/images/Pink_Rose.jpg",
    portraitSrc: "/images/img12.jpeg",
    song: "/audio/Raat_Akeli_Thi.mp3",
    altFlower: "Pink rose petals",
    altPortrait: "Portrait inspired by a pink rose",
    palette: "330", // midnight pink hue
  },
  {
    flowerName: "Monkey Flower",
    flowerSrc: "/images/Monkey_Flower.jpeg",
    portraitSrc: "/images/img13.jpeg",
    song: "/audio/Dhun.mp3",
    altFlower: "Monkey flower with speckled petals",
    altPortrait: "Portrait inspired by the monkey flower",
    palette: "30", // speckled gold / orange hue
  },
  {
    flowerName: "Jasmine",
    flowerSrc: "/images/Jasmine.jpg",
    portraitSrc: "/images/img9.jpeg",
    song: "/audio/Samjhawan.mp3",
    altFlower: "White jasmine blossoms",
    altPortrait: "Portrait inspired by jasmine",
    palette: "200", // silver moonlight hue
  },
  {
    flowerName: "Lavender",
    flowerSrc: "/images/Lavender.jpg",
    portraitSrc: "/images/img10.jpeg",
    song: "/audio/Jab_Tak.mp3",
    altFlower: "Lavender spikes in bloom",
    altPortrait: "Portrait inspired by lavender",
    palette: "270", // soft violet hue
  },
  {
    flowerName: "Sunflower",
    flowerSrc: "/images/Sunflower.jpg",
    portraitSrc: "/images/img11.jpeg",
    song: "/audio/Pehli_Nazar_Mein_Race.mp3",
    altFlower: "Sunflower facing the light",
    altPortrait: "Portrait inspired by a sunflower",
    palette: "45", // warm amber / gold hue
  },
];
