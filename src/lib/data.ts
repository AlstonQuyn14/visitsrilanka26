import destSigiriya from "@/assets/dest-sigiriya.jpg";
import destBeach from "@/assets/dest-beach.jpg";
import destElla from "@/assets/dest-ella.jpg";
import destKandy from "@/assets/dest-kandy.jpg";
import destGalle from "@/assets/dest-galle.jpg";
import destYala from "@/assets/dest-yala.jpg";

export type PlaceCategory =
  | "Beaches"
  | "Historical"
  | "Nature"
  | "Temples"
  | "Hotels"
  | "Dining";

export interface Destination {
  id: string;
  name: string;
  region: string;
  category: PlaceCategory;
  image: string;
  rating: number;
  reviews: number;
  tagline: string;
  popular?: boolean;
  lat: number;
  lng: number;
}

export const destinations: Destination[] = [
  {
    id: "sigiriya",
    name: "Sigiriya Rock Fortress",
    region: "Central Province",
    category: "Historical",
    image: destSigiriya,
    rating: 4.9,
    reviews: 12480,
    tagline: "Ancient sky palace rising over the jungle",
    popular: true,
    lat: 7.957,
    lng: 80.7603,
  },
  {
    id: "mirissa",
    name: "Mirissa Beach",
    region: "Southern Province",
    category: "Beaches",
    image: destBeach,
    rating: 4.8,
    reviews: 9320,
    tagline: "Golden sand, whale watching & sunsets",
    popular: true,
    lat: 5.9483,
    lng: 80.4589,
  },
  {
    id: "ella",
    name: "Ella Tea Country",
    region: "Uva Province",
    category: "Nature",
    image: destElla,
    rating: 4.9,
    reviews: 8710,
    tagline: "Misty hills and emerald tea terraces",
    popular: true,
    lat: 6.8667,
    lng: 81.0466,
  },
  {
    id: "kandy",
    name: "Temple of the Tooth",
    region: "Kandy",
    category: "Temples",
    image: destKandy,
    rating: 4.7,
    reviews: 15030,
    tagline: "Sacred heart of Sri Lankan culture",
    popular: true,
    lat: 7.2936,
    lng: 80.6413,
  },
  {
    id: "galle",
    name: "Galle Fort",
    region: "Southern Province",
    category: "Historical",
    image: destGalle,
    rating: 4.8,
    reviews: 11200,
    tagline: "Colonial ramparts and ocean sunsets",
    popular: true,
    lat: 6.0269,
    lng: 80.217,
  },
  {
    id: "yala",
    name: "Yala National Park",
    region: "Southern Province",
    category: "Nature",
    image: destYala,
    rating: 4.6,
    reviews: 6740,
    tagline: "Leopards, elephants & wild safari plains",
    popular: true,
    lat: 6.3724,
    lng: 81.5185,
  },
];

/** Iconic landmarks shown as pins on the live map (no detail cards needed). */
export interface IconicPlace {
  id: string;
  name: string;
  region: string;
  category: PlaceCategory;
  emoji: string;
  lat: number;
  lng: number;
}

export const iconicPlaces: IconicPlace[] = [
  ...destinations.map((d) => ({
    id: d.id,
    name: d.name,
    region: d.region,
    category: d.category,
    emoji:
      d.category === "Beaches"
        ? "🏖️"
        : d.category === "Temples"
          ? "🛕"
          : d.category === "Nature"
            ? "🌿"
            : "🏛️",
    lat: d.lat,
    lng: d.lng,
  })),
  { id: "adams-peak", name: "Adam's Peak (Sri Pada)", region: "Sabaragamuwa", category: "Nature", emoji: "⛰️", lat: 6.8096, lng: 80.4994 },
  { id: "nine-arch", name: "Nine Arch Bridge", region: "Ella", category: "Historical", emoji: "🌉", lat: 6.8767, lng: 81.0606 },
  { id: "anuradhapura", name: "Anuradhapura Ruins", region: "North Central", category: "Historical", emoji: "🏛️", lat: 8.3114, lng: 80.4037 },
  { id: "polonnaruwa", name: "Polonnaruwa Ancient City", region: "North Central", category: "Historical", emoji: "🗿", lat: 7.9403, lng: 81.0188 },
  { id: "dambulla", name: "Dambulla Cave Temple", region: "Central", category: "Temples", emoji: "🛕", lat: 7.8567, lng: 80.6492 },
  { id: "nuwara-eliya", name: "Nuwara Eliya", region: "Central", category: "Nature", emoji: "🍃", lat: 6.9497, lng: 80.7891 },
  { id: "arugam-bay", name: "Arugam Bay", region: "Eastern", category: "Beaches", emoji: "🏄", lat: 6.8403, lng: 81.836 },
  { id: "unawatuna", name: "Unawatuna Beach", region: "Southern", category: "Beaches", emoji: "🏝️", lat: 6.0094, lng: 80.2497 },
  { id: "colombo", name: "Colombo City", region: "Western", category: "Dining", emoji: "🏙️", lat: 6.9271, lng: 79.8612 },
  { id: "trincomalee", name: "Trincomalee", region: "Eastern", category: "Beaches", emoji: "⚓", lat: 8.5874, lng: 81.2152 },
  { id: "jaffna", name: "Jaffna Fort", region: "Northern", category: "Historical", emoji: "🏰", lat: 9.6615, lng: 80.0255 },
];

/** Centre of Sri Lanka for the initial map view. */
export const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

export const placeCategories: { label: PlaceCategory | "All"; icon: string }[] = [
  { label: "All", icon: "Compass" },
  { label: "Beaches", icon: "Waves" },
  { label: "Historical", icon: "Landmark" },
  { label: "Nature", icon: "TreePalm" },
  { label: "Temples", icon: "Church" },
  { label: "Hotels", icon: "BedDouble" },
  { label: "Dining", icon: "UtensilsCrossed" },
];

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  to: string;
  tone: "primary" | "accent" | "nature" | "sun";
}

export const quickActions: QuickAction[] = [
  { id: "sos", label: "Safety SOS", icon: "ShieldAlert", to: "/safety", tone: "accent" },
  { id: "transport", label: "Book Ride", icon: "Car", to: "/transport", tone: "primary" },
  { id: "guides", label: "Find a Guide", icon: "UserRound", to: "/guides", tone: "nature" },
  { id: "ai", label: "AI Planner", icon: "Sparkles", to: "/explore", tone: "sun" },
  { id: "translate", label: "Translate", icon: "Languages", to: "/explore", tone: "primary" },
  { id: "grocery", label: "Essentials", icon: "ShoppingBag", to: "/grocery", tone: "nature" },
  { id: "group", label: "Group Trip", icon: "Users", to: "/group-trip", tone: "sun" },
  { id: "explore", label: "Explore", icon: "MapPinned", to: "/explore", tone: "accent" },
];

export interface WeatherInfo {
  location: string;
  tempC: number;
  condition: string;
  high: number;
  low: number;
  icon: string;
}

export const currentWeather: WeatherInfo = {
  location: "Colombo, Sri Lanka",
  tempC: 31,
  condition: "Sunny & humid",
  high: 33,
  low: 26,
  icon: "Sun",
};
