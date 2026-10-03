export type LanguageId =
  | "english"
  | "hinglish"
  | "spanish"
  | "french"
  | "german"
  | "italian"
  | "portuguese"
  | "dutch"
  | "javascript"
  | "python"
  | "cpp";

export interface LanguageOption {
  id: LanguageId;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { id: "english", name: "english", nativeName: "English" },
  { id: "hinglish", name: "hinglish", nativeName: "Hinglish" },
  { id: "spanish", name: "spanish", nativeName: "Español" },
  { id: "french", name: "french", nativeName: "Français" },
  { id: "german", name: "german", nativeName: "Deutsch" },
  { id: "italian", name: "italian", nativeName: "Italiano" },
  { id: "portuguese", name: "portuguese", nativeName: "Português" },
  { id: "dutch", name: "dutch", nativeName: "Nederlands" },
  { id: "javascript", name: "javascript", nativeName: "JavaScript Code" },
  { id: "python", name: "python", nativeName: "Python Code" },
  { id: "cpp", name: "cpp", nativeName: "C++ Code" },
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
