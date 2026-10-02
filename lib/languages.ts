export type LanguageId =
  | "english"
  | "hindi"
  | "hinglish"
  | "spanish"
  | "french"
  | "german";

export interface LanguageOption {
  id: LanguageId;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { id: "english", name: "english", nativeName: "English" },
  { id: "hindi", name: "hindi", nativeName: "हिन्दी" },
  { id: "hinglish", name: "hinglish", nativeName: "Hinglish" },
  { id: "spanish", name: "spanish", nativeName: "Español" },
  { id: "french", name: "french", nativeName: "Français" },
  { id: "german", name: "german", nativeName: "Deutsch" },
];

const wordCache = new Map<string, string[]>();

export async function fetchLanguageWords(
  language: LanguageId = "english",
  hard = false
): Promise<string[]> {
  const key = language === "english" && hard ? "english_1k" : language;
  if (wordCache.has(key)) {
    return wordCache.get(key)!;
  }

  let res = await fetch(`/languages/${key}.json`);
  if (!res.ok && key !== "english") {
    res = await fetch("/languages/english.json");
  }
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { words: string[] };
  wordCache.set(key, data.words);
  return data.words;
}
