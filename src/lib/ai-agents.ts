import { languages } from "@/lib/languages";

export type AgentId = "planner" | "guide";

export interface AgentConfig {
  id: AgentId;
  /** Short label shown on cards & headers */
  label: string;
  /** One line description */
  tagline: string;
  /** Emoji used as the visual mark */
  emoji: string;
  /** Tailwind gradient classes for the accent */
  gradient: string;
  /** Greeting shown in the empty state */
  greeting: string;
  /** Example prompts shown as quick starters */
  starters: string[];
}

export const agents: Record<AgentId, AgentConfig> = {
  planner: {
    id: "planner",
    label: "Tour Planner",
    tagline: "Build a custom Sri Lanka trip — budget, stays, food & activities",
    emoji: "🧭",
    gradient: "from-primary to-accent",
    greeting:
      "Hi! I'm your Sri Lanka tour planner. Tell me your dates, budget, interests and group size, and I'll build a day-by-day plan with where to stay, where to eat, and the best activities & sports for you.",
    starters: [
      "Plan a 7-day trip for 2 people, mid budget, beaches & culture",
      "I have $500 and 4 days — make me a surf & food itinerary",
      "Family trip with kids for a week, relaxed pace",
      "Where should I stay and eat in Ella for 3 nights?",
    ],
  },
  guide: {
    id: "guide",
    label: "Travel Q&A Guide",
    tagline: "Ask anything — history, culture, etiquette, laws & tips",
    emoji: "💬",
    gradient: "from-chart-4 to-accent",
    greeting:
      "Ask me anything about Sri Lanka — its history, culture, religions, food, etiquette, local laws or travel tips. I'll explain clearly in your language.",
    starters: [
      "I want to learn about Sri Lankan history",
      "What should I wear when visiting temples?",
      "Tell me about Sinhala & Tamil New Year traditions",
      "Is it safe to travel solo? Any local laws I should know?",
    ],
  },
};

export const agentList = Object.values(agents);

export function isAgentId(value: string): value is AgentId {
  return value === "planner" || value === "guide";
}

/** Build the server-side system prompt for an agent in a given language. */
export function buildSystemPrompt(agentId: AgentId, languageName: string): string {
  const langRule =
    `\n\nIMPORTANT: Always reply in ${languageName}. Write the entire response in ${languageName}, ` +
    `including headings and labels. Use simple, friendly, easy-to-understand wording. ` +
    `Keep place names and proper nouns in their common form. Format with clean Markdown ` +
    `(short headings, bullet points, and tables where useful).`;

  if (agentId === "guide") {
    return (
      `You are "Visit Sri Lanka Guide", a warm and knowledgeable expert on Sri Lanka. ` +
      `You answer travellers' questions accurately and engagingly about Sri Lankan history, ` +
      `culture, religions and festivals, food, language, geography, wildlife, etiquette, ` +
      `customs, local laws and safety, and practical travel tips. ` +
      `Be concise but rich. If a question is sensitive (religion, politics, law), stay neutral, ` +
      `respectful and factual. If you are unsure, say so. Encourage responsible, respectful tourism.` +
      langRule
    );
  }

  // planner
  return (
    `You are "Visit Sri Lanka Planner", an expert Sri Lanka travel planner that customises tours. ` +
    `Your job is to turn the traveller's wishes into a clear, realistic plan. ` +
    `If key details are missing (trip length/dates, budget, interests, travel style, group size, ` +
    `start city), ask 1-3 short questions first — but if the user gives enough, just plan. ` +
    `When you produce a plan, always include these sections with Markdown headings:\n` +
    `1. **Overview** — a one-paragraph summary of the trip.\n` +
    `2. **Budget** — a Markdown table estimating costs per category (stay, food, transport, ` +
    `activities, misc) with a total, shown in both USD and LKR (approx. 1 USD ≈ 300 LKR).\n` +
    `3. **Day-by-day itinerary** — each day with the area, what to see/do, and travel notes.\n` +
    `4. **Where to stay** — 1-2 accommodation suggestions per area across budget levels.\n` +
    `5. **Where to eat** — local dishes and types of eateries to try in each area.\n` +
    `6. **Activities & sports** — relevant options like surfing, hiking, safari, snorkelling/diving, ` +
    `whale watching, cycling, white-water rafting, tea trekking, etc.\n` +
    `Keep advice practical, safe and respectful of local culture. Be encouraging and friendly.` +
    langRule
  );
}

/** Resolve a language code to a human display name for the AI. */
export function languageNameForCode(code: string): string {
  const lang = languages.find((l) => l.code === code);
  return lang ? `${lang.name} (${lang.native})` : "English";
}
