export type ArchiveEntry = {
  id: string;
  animeTitle: string;
  character: string;
  phrase: string;
  poem: string;
  era: string;
};

export const archiveMockData: ArchiveEntry[] = [
  {
    id: "1",
    animeTitle: "Neon Genesis Evangelion",
    character: "Shinji Ikari",
    phrase: "I held the sky like static",
    poem: "In the cockpit of dusk, I whispered to a city of blue sirens.",
    era: "1990s",
  },
  {
    id: "2",
    animeTitle: "Cowboy Bebop",
    character: "Spike Spiegel",
    phrase: "See you in the smoke",
    poem: "Jazz rain slid off the neon roofs while memory counted backwards.",
    era: "1990s",
  },
  {
    id: "3",
    animeTitle: "Fruits Basket",
    character: "Tohru Honda",
    phrase: "Kindness bends but does not break",
    poem: "I folded my grief into rice balls and fed the moon anyway.",
    era: "2000s",
  },
  {
    id: "4",
    animeTitle: "Naruto",
    character: "Sasuke Uchiha",
    phrase: "Ash remembers the fire",
    poem: "At the edge of a valley, silence sharpened itself into a vow.",
    era: "2000s",
  },
  {
    id: "5",
    animeTitle: "Attack on Titan",
    character: "Mikasa Ackerman",
    phrase: "Steel in winter hands",
    poem: "I stitched tomorrow from torn banners and the sound of marching hearts.",
    era: "2010s",
  },
  {
    id: "6",
    animeTitle: "Your Name",
    character: "Mitsuha Miyamizu",
    phrase: "Threads between worlds",
    poem: "Comets wrote our names in water, then asked us to remember.",
    era: "2010s",
  },
  {
    id: "7",
    animeTitle: "Demon Slayer",
    character: "Tanjiro Kamado",
    phrase: "Breath like sunrise",
    poem: "I carried the mountain in my lungs and exhaled mercy.",
    era: "2010s",
  },
  {
    id: "8",
    animeTitle: "Jujutsu Kaisen",
    character: "Satoru Gojo",
    phrase: "Infinity wears a grin",
    poem: "Between two fingers, the storm paused and called it style.",
    era: "2020s",
  },
];
