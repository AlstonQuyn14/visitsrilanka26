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

  // ===== Famous, iconic & religious places =====
  { id: "anuradhapura", name: "Anuradhapura Sacred City", region: "North Central", category: "Historical", image: destSigiriya, rating: 4.8, reviews: 7820, tagline: "Ancient capital of stupas & sacred Bodhi tree", popular: true, lat: 8.3114, lng: 80.4037 },
  { id: "polonnaruwa", name: "Polonnaruwa Ancient City", region: "North Central", category: "Historical", image: destGalle, rating: 4.7, reviews: 6210, tagline: "Royal ruins & the Gal Vihara rock Buddhas", lat: 7.9403, lng: 81.0188 },
  { id: "dambulla", name: "Dambulla Cave Temple", region: "Central Province", category: "Temples", image: destKandy, rating: 4.8, reviews: 9450, tagline: "Golden cave shrines with 150+ Buddha statues", popular: true, lat: 7.8567, lng: 80.6492 },
  { id: "sri-pada", name: "Adam's Peak (Sri Pada)", region: "Sabaragamuwa", category: "Temples", image: destElla, rating: 4.9, reviews: 8130, tagline: "Sacred summit pilgrimage & sunrise climb", popular: true, lat: 6.8096, lng: 80.4994 },
  { id: "kelaniya", name: "Kelaniya Raja Maha Vihara", region: "Western Province", category: "Temples", image: destKandy, rating: 4.7, reviews: 5340, tagline: "Ancient temple of vivid murals near Colombo", lat: 6.9553, lng: 79.9219 },
  { id: "jaya-sri-maha-bodhi", name: "Jaya Sri Maha Bodhi", region: "Anuradhapura", category: "Temples", image: destKandy, rating: 4.9, reviews: 6890, tagline: "World's oldest documented sacred fig tree", lat: 8.3447, lng: 80.3964 },
  { id: "mihintale", name: "Mihintale", region: "North Central", category: "Temples", image: destSigiriya, rating: 4.6, reviews: 3920, tagline: "Cradle of Buddhism in Sri Lanka", lat: 8.3517, lng: 80.5089 },
  { id: "ruwanwelisaya", name: "Ruwanwelisaya Stupa", region: "Anuradhapura", category: "Temples", image: destSigiriya, rating: 4.8, reviews: 5120, tagline: "Majestic white dagoba glowing at dusk", lat: 8.3494, lng: 80.3964 },
  { id: "nallur-kovil", name: "Nallur Kandaswamy Kovil", region: "Jaffna", category: "Temples", image: destKandy, rating: 4.7, reviews: 4380, tagline: "Golden Hindu temple of the north", lat: 9.6766, lng: 80.0264 },
  { id: "munneswaram", name: "Munneswaram Temple", region: "Chilaw", category: "Temples", image: destKandy, rating: 4.5, reviews: 2670, tagline: "Ancient Shiva temple complex", lat: 7.6097, lng: 79.8186 },
  { id: "koneswaram", name: "Koneswaram Temple", region: "Trincomalee", category: "Temples", image: destBeach, rating: 4.8, reviews: 5630, tagline: "Cliff-top Hindu shrine over the ocean", popular: true, lat: 8.5828, lng: 81.2453 },
  { id: "gangaramaya", name: "Gangaramaya Temple", region: "Colombo", category: "Temples", image: destKandy, rating: 4.6, reviews: 7240, tagline: "Eclectic city temple & museum treasures", lat: 6.9166, lng: 79.8562 },
  { id: "nine-arch", name: "Nine Arch Bridge", region: "Ella", category: "Historical", image: destElla, rating: 4.8, reviews: 10240, tagline: "Iconic colonial-era viaduct in the tea hills", popular: true, lat: 6.8767, lng: 81.0606 },
  { id: "nuwara-eliya", name: "Nuwara Eliya", region: "Central Province", category: "Nature", image: destElla, rating: 4.7, reviews: 8410, tagline: "Little England amid cool emerald highlands", popular: true, lat: 6.9497, lng: 80.7891 },
  { id: "horton-plains", name: "Horton Plains & World's End", region: "Central Province", category: "Nature", image: destYala, rating: 4.7, reviews: 5980, tagline: "Misty plateau with a sheer cliff drop", lat: 6.8019, lng: 80.8064 },
  { id: "ravana-falls", name: "Ravana Falls", region: "Ella", category: "Nature", image: destElla, rating: 4.5, reviews: 4310, tagline: "Cascading waterfall steeped in legend", lat: 6.8487, lng: 81.0458 },
  { id: "pinnawala", name: "Pinnawala Elephant Orphanage", region: "Sabaragamuwa", category: "Nature", image: destYala, rating: 4.4, reviews: 9120, tagline: "Herds bathing in the river daily", lat: 7.3006, lng: 80.3853 },
  { id: "udawalawe", name: "Udawalawe National Park", region: "Sabaragamuwa", category: "Nature", image: destYala, rating: 4.7, reviews: 5470, tagline: "Best place to see wild elephants up close", lat: 6.4389, lng: 80.8889 },
  { id: "arugam-bay", name: "Arugam Bay", region: "Eastern Province", category: "Beaches", image: destBeach, rating: 4.7, reviews: 6890, tagline: "World-class surf point & laid-back vibes", popular: true, lat: 6.8403, lng: 81.836 },
  { id: "unawatuna", name: "Unawatuna Beach", region: "Southern Province", category: "Beaches", image: destBeach, rating: 4.6, reviews: 7430, tagline: "Crescent bay of calm turquoise water", lat: 6.0094, lng: 80.2497 },
  { id: "trincomalee", name: "Trincomalee & Nilaveli", region: "Eastern Province", category: "Beaches", image: destBeach, rating: 4.7, reviews: 5210, tagline: "Pristine white sands & Pigeon Island reefs", lat: 8.5874, lng: 81.2152 },
  { id: "pasikuda", name: "Pasikuda Beach", region: "Eastern Province", category: "Beaches", image: destBeach, rating: 4.5, reviews: 3980, tagline: "Shallow lagoon perfect for wading & swims", lat: 7.9242, lng: 81.5644 },
  { id: "colombo", name: "Colombo City", region: "Western Province", category: "Historical", image: destGalle, rating: 4.5, reviews: 11320, tagline: "Vibrant capital of markets, food & history", lat: 6.9271, lng: 79.8612 },
  { id: "jaffna-fort", name: "Jaffna Fort", region: "Northern Province", category: "Historical", image: destGalle, rating: 4.5, reviews: 3640, tagline: "Dutch sea fort at the island's northern tip", lat: 9.6615, lng: 80.0255 },
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
  { id: "ai", label: "AI Planner", icon: "Sparkles", to: "/planner", tone: "sun" },
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

export type HotelCategory =
  | "Luxury Resort"
  | "Beach Resort"
  | "Boutique Hotel"
  | "Heritage"
  | "Villa & Rental"
  | "Eco Lodge";

export interface Hotel {
  id: string;
  name: string;
  category: HotelCategory;
  location: string;
  hotline: string;
  priceFrom: string;
  rating: number;
  emoji: string;
  description: string;
  rentable?: boolean;
}

export const hotels: Hotel[] = [
  {
    id: "shangri-la-colombo",
    name: "Shangri-La Colombo",
    category: "Luxury Resort",
    location: "Galle Face, Colombo",
    hotline: "+94 11 788 8288",
    priceFrom: "$220 / night",
    rating: 4.8,
    emoji: "🏙️",
    description:
      "Five-star oceanfront tower on Galle Face with infinity pool, spa and multiple fine-dining restaurants.",
  },
  {
    id: "cinnamon-grand",
    name: "Cinnamon Grand Colombo",
    category: "Luxury Resort",
    location: "Colombo 03",
    hotline: "+94 11 243 7437",
    priceFrom: "$150 / night",
    rating: 4.6,
    emoji: "🌆",
    description:
      "Iconic city hotel with 14 restaurants, large pool and easy access to shopping and business districts.",
  },
  {
    id: "galle-face-hotel",
    name: "Galle Face Hotel",
    category: "Heritage",
    location: "Galle Face, Colombo",
    hotline: "+94 11 254 1010",
    priceFrom: "$170 / night",
    rating: 4.5,
    emoji: "🏛️",
    description:
      "Historic colonial-era seafront hotel since 1864, famous for its checkerboard terrace and sunsets.",
  },
  {
    id: "heritance-kandalama",
    name: "Heritance Kandalama",
    category: "Eco Lodge",
    location: "Dambulla",
    hotline: "+94 66 555 5000",
    priceFrom: "$140 / night",
    rating: 4.7,
    emoji: "🌿",
    description:
      "Geoffrey Bawa-designed eco hotel built into a cliff overlooking Kandalama lake near Sigiriya.",
  },
  {
    id: "jetwing-lighthouse",
    name: "Jetwing Lighthouse",
    category: "Beach Resort",
    location: "Galle",
    hotline: "+94 91 222 3744",
    priceFrom: "$160 / night",
    rating: 4.6,
    emoji: "🏖️",
    description:
      "Cliffside beach resort near Galle Fort with two pools, spa and dramatic ocean views.",
  },
  {
    id: "anantara-peace-haven",
    name: "Anantara Peace Haven Tangalle",
    category: "Luxury Resort",
    location: "Tangalle",
    hotline: "+94 47 720 6060",
    priceFrom: "$300 / night",
    rating: 4.8,
    emoji: "🌴",
    description:
      "Secluded south-coast luxury resort set in a coconut plantation with a private beach and pool villas.",
  },
  {
    id: "amangalla",
    name: "Amangalla",
    category: "Boutique Hotel",
    location: "Galle Fort",
    hotline: "+94 91 223 3388",
    priceFrom: "$450 / night",
    rating: 4.9,
    emoji: "🕌",
    description:
      "Ultra-luxury boutique hotel inside the UNESCO Galle Fort, restored from a 17th-century building.",
  },
  {
    id: "98-acres-resort",
    name: "98 Acres Resort & Spa",
    category: "Eco Lodge",
    location: "Ella",
    hotline: "+94 57 205 0050",
    priceFrom: "$180 / night",
    rating: 4.7,
    emoji: "⛰️",
    description:
      "Tea-estate resort in Ella with chalets overlooking Little Adam's Peak and Ella Gap.",
  },
  {
    id: "wild-coast-tented",
    name: "Wild Coast Tented Lodge",
    category: "Eco Lodge",
    location: "Yala",
    hotline: "+94 47 723 9450",
    priceFrom: "$400 / night",
    rating: 4.8,
    emoji: "🐆",
    description:
      "Luxury tented camp on the edge of Yala National Park, perfect for leopard safaris.",
  },
  {
    id: "heritance-ahungalla",
    name: "Heritance Ahungalla",
    category: "Beach Resort",
    location: "Ahungalla",
    hotline: "+94 91 555 5000",
    priceFrom: "$130 / night",
    rating: 4.5,
    emoji: "🌊",
    description:
      "West-coast beach resort with one of the longest hotel pools in the country and golden sands.",
  },
  {
    id: "ceylon-tea-trails",
    name: "Ceylon Tea Trails",
    category: "Boutique Hotel",
    location: "Hatton",
    hotline: "+94 11 774 5730",
    priceFrom: "$500 / night",
    rating: 4.9,
    emoji: "🍃",
    description:
      "Restored colonial tea-planter bungalows by Castlereagh Lake in the central highlands, all-inclusive.",
  },
  {
    id: "uga-bay",
    name: "Uga Bay",
    category: "Beach Resort",
    location: "Pasikuda",
    hotline: "+94 65 738 0380",
    priceFrom: "$150 / night",
    rating: 4.6,
    emoji: "🐚",
    description:
      "East-coast resort on the calm shallow bay of Pasikuda, ideal for families and swimming.",
  },
  {
    id: "villa-bentota",
    name: "Villa Bentota Rentals",
    category: "Villa & Rental",
    location: "Bentota",
    hotline: "+94 34 227 5311",
    priceFrom: "$120 / night",
    rating: 4.4,
    emoji: "🏡",
    description:
      "Private riverside and beach villas with staff, perfect for groups wanting their own space.",
    rentable: true,
  },
  {
    id: "galle-fort-villas",
    name: "Galle Fort Heritage Villas",
    category: "Villa & Rental",
    location: "Galle Fort",
    hotline: "+94 91 224 2870",
    priceFrom: "$200 / night",
    rating: 4.7,
    emoji: "🔑",
    description:
      "Whole-house rentals inside historic Galle Fort — courtyard homes with private chefs available.",
    rentable: true,
  },
  {
    id: "ella-eco-cabins",
    name: "Ella Eco Cabins & Rentals",
    category: "Villa & Rental",
    location: "Ella",
    hotline: "+94 76 555 1234",
    priceFrom: "$60 / night",
    rating: 4.3,
    emoji: "🛖",
    description:
      "Affordable mountain cabins and homestays to rent with valley views and home-cooked meals.",
    rentable: true,
  },
];

export const hotelCategories: (HotelCategory | "All")[] = [
  "All",
  "Luxury Resort",
  "Beach Resort",
  "Boutique Hotel",
  "Heritage",
  "Villa & Rental",
  "Eco Lodge",
];
