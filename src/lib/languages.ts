export type Language = {
  code: string;
  /** English name */
  name: string;
  /** Name written in its own script */
  native: string;
  /** Flag emoji for quick visual ID */
  flag: string;
};

/** 15 main languages supported across the app. */
export const languages: Language[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "si", name: "Sinhala", native: "සිංහල", flag: "🇱🇰" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", name: "Mandarin", native: "中文", flag: "🇨🇳" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
];

export const LANGUAGE_STORAGE_KEY = "serendib:language";

export function getStoredLanguage(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "en";
}

export function setStoredLanguage(code: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
}
