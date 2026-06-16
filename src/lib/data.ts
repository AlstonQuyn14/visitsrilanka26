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
  },
];

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
  { id: "sos", label: "Safety SOS", icon: "ShieldAlert", to: "/explore", tone: "accent" },
  { id: "transport", label: "Book Ride", icon: "Car", to: "/explore", tone: "primary" },
  { id: "guides", label: "Find a Guide", icon: "UserRound", to: "/explore", tone: "nature" },
  { id: "ai", label: "AI Planner", icon: "Sparkles", to: "/explore", tone: "sun" },
  { id: "translate", label: "Translate", icon: "Languages", to: "/explore", tone: "primary" },
  { id: "grocery", label: "Essentials", icon: "ShoppingBag", to: "/explore", tone: "nature" },
  { id: "group", label: "Group Trip", icon: "Users", to: "/explore", tone: "sun" },
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
