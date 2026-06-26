import phuketImg from "@/assets/phuket.jpg";
import bangkokImg from "@/assets/bangkok.jpg";
import chiangmaiImg from "@/assets/chiangmai.jpg";
import krabiImg from "@/assets/krabi.jpg";
import kohsamuiImg from "@/assets/kohsamui.jpg";

export interface EnrichedLocation {
  name: string;
  city: string;
  vibe: string;
  description: string;
  themeColor: string;
  image: any;
}

/** Hard-coded location data for the Locations section */
export const LOCATIONS: EnrichedLocation[] = [
  {
    name: "Phuket",
    city: "Phuket",
    vibe: "Fighter Island · Chill Vibes",
    description:
      "The perfect balance of serious training and lifestyle experience. International camps, high-quality gyms, and the beach after every session.",
    themeColor: "#f59e0b",
    image: phuketImg,
  },
  {
    name: "Bangkok",
    city: "Bangkok",
    vibe: "Hardcore · Old School · Legendary",
    description:
      "The heart of professional Muay Thai. Elite fighters, iconic stadiums, and training that pushes you harder than you thought possible.",
    themeColor: "#ef4444",
    image: bangkokImg,
  },
  {
    name: "Chiang Mai",
    city: "Chiang Mai",
    vibe: "Laid Back · Traditional · Immersive",
    description:
      "Traditional and focused training in a quieter setting. Smaller groups, disciplined culture, and full immersion in the art.",
    themeColor: "#10b981",
    image: chiangmaiImg,
  },
  {
    name: "Krabi",
    city: "Krabi",
    vibe: "Scenic · Raw · Hidden Gem",
    description:
      "Limestone cliffs, emerald waters, and a famous gym with outdoor training that feels like another world entirely.",
    themeColor: "#0ea5e9",
    image: krabiImg,
  },
  {
    name: "Koh Samui",
    city: "Koh Samui",
    vibe: "Exclusive · Premium · Great Fight Scene",
    description:
      "Premium camps with strong international community. High-quality facilities, experienced trainers, and a lifestyle-oriented experience.",
    themeColor: "#a855f7",
    image: kohsamuiImg,
  },
];
