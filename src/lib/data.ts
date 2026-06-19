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
  { id: "events", label: "Main Events", icon: "CalendarDays", to: "/events", tone: "primary" },
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

export type EventCategory =
  | "Religious"
  | "Cultural"
  | "National"
  | "Festival"
  | "Poya Day";

export interface SriLankaEvent {
  id: string;
  name: string;
  month: string;
  date: string;
  category: EventCategory;
  emoji: string;
  description: string;
  publicHoliday: boolean;
}

/** Common annual events, festivals & holidays across Sri Lanka. */
export const sriLankaEvents: SriLankaEvent[] = [
  {
    id: "duruthu-poya",
    name: "Duruthu Poya",
    month: "January",
    date: "Full moon, January",
    category: "Poya Day",
    emoji: "🌕",
    description: "Marks the Buddha's first visit to Sri Lanka, celebrated with the grand Kelaniya perahera.",
    publicHoliday: true,
  },
  {
    id: "thai-pongal",
    name: "Thai Pongal",
    month: "January",
    date: "14 January",
    category: "Cultural",
    emoji: "🌾",
    description: "Tamil Hindu harvest thanksgiving festival honouring the Sun God with sweet pongal rice.",
    publicHoliday: true,
  },
  {
    id: "independence-day",
    name: "National Independence Day",
    month: "February",
    date: "4 February",
    category: "National",
    emoji: "🇱🇰",
    description: "Sri Lanka's freedom from British rule, marked with parades, flag ceremonies and cultural shows.",
    publicHoliday: true,
  },
  {
    id: "navam-poya",
    name: "Navam Poya",
    month: "February",
    date: "Full moon, February",
    category: "Poya Day",
    emoji: "🌕",
    description: "Famous Gangaramaya Navam Perahera in Colombo with elephants, dancers and drummers.",
    publicHoliday: true,
  },
  {
    id: "maha-sivarathri",
    name: "Maha Sivarathri",
    month: "February / March",
    date: "Feb–Mar",
    category: "Religious",
    emoji: "🕉️",
    description: "Hindu night of devotion to Lord Shiva, observed with fasting and all-night prayers.",
    publicHoliday: true,
  },
  {
    id: "milad-un-nabi",
    name: "Milad un-Nabi (Prophet's Birthday)",
    month: "Varies",
    date: "Islamic calendar",
    category: "Religious",
    emoji: "🕌",
    description: "Muslim celebration of the birth of the Prophet Muhammad with prayers and charity.",
    publicHoliday: true,
  },
  {
    id: "good-friday",
    name: "Good Friday",
    month: "March / April",
    date: "Mar–Apr",
    category: "Religious",
    emoji: "✝️",
    description: "Christian observance of the crucifixion of Jesus Christ with church services.",
    publicHoliday: true,
  },
  {
    id: "sinhala-tamil-new-year",
    name: "Sinhala & Tamil New Year (Aluth Avurudda)",
    month: "April",
    date: "13–14 April",
    category: "Cultural",
    emoji: "🪔",
    description: "Sri Lanka's biggest cultural festival with traditional games, sweets and family rituals.",
    publicHoliday: true,
  },
  {
    id: "vesak-poya",
    name: "Vesak Poya",
    month: "May",
    date: "Full moon, May",
    category: "Religious",
    emoji: "🏮",
    description: "Holiest Buddhist festival marking the birth, enlightenment and passing of the Buddha. Streets glow with lanterns and dansala stalls.",
    publicHoliday: true,
  },
  {
    id: "poson-poya",
    name: "Poson Poya",
    month: "June",
    date: "Full moon, June",
    category: "Religious",
    emoji: "🌕",
    description: "Celebrates the arrival of Buddhism in Sri Lanka, centred on the sacred city of Mihintale.",
    publicHoliday: true,
  },
  {
    id: "esala-perahera",
    name: "Esala Perahera (Kandy)",
    month: "July / August",
    date: "Jul–Aug",
    category: "Festival",
    emoji: "🐘",
    description: "Spectacular 10-night procession in Kandy honouring the Sacred Tooth Relic with decorated elephants and dancers.",
    publicHoliday: true,
  },
  {
    id: "hajj-festival",
    name: "Hajj Festival (Eid al-Adha)",
    month: "Varies",
    date: "Islamic calendar",
    category: "Religious",
    emoji: "🕋",
    description: "Muslim Festival of Sacrifice marking the end of the Hajj pilgrimage with prayers and feasts.",
    publicHoliday: true,
  },
  {
    id: "ramadan-eid",
    name: "Eid al-Fitr (Ramazan Festival)",
    month: "Varies",
    date: "Islamic calendar",
    category: "Religious",
    emoji: "🌙",
    description: "Joyful festival ending the holy month of Ramadan fasting, celebrated with family feasts.",
    publicHoliday: true,
  },
  {
    id: "deepavali",
    name: "Deepavali (Diwali)",
    month: "October / November",
    date: "Oct–Nov",
    category: "Religious",
    emoji: "🪔",
    description: "Hindu festival of lights celebrating the triumph of light over darkness with oil lamps and sweets.",
    publicHoliday: true,
  },
  {
    id: "christmas",
    name: "Christmas Day",
    month: "December",
    date: "25 December",
    category: "Religious",
    emoji: "🎄",
    description: "Christian celebration of the birth of Jesus, marked with carols, lights and festive markets island-wide.",
    publicHoliday: true,
  },
  {
    id: "unduvap-poya",
    name: "Unduvap Poya",
    month: "December",
    date: "Full moon, December",
    category: "Poya Day",
    emoji: "🌕",
    description: "Commemorates the arrival of the sacred Bo sapling at Anuradhapura.",
    publicHoliday: true,
  },
];

export const eventCategories: (EventCategory | "All")[] = [
  "All",
  "Religious",
  "Cultural",
  "National",
  "Festival",
  "Poya Day",
];
