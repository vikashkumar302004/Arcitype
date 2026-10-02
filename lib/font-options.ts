export type TypingFont =
  | "geist-mono"
  | "roboto-mono"
  | "jetbrains-mono"
  | "fira-code"
  | "ibm-plex-mono"
  | "source-code-pro"
  | "inconsolata"
  | "ubuntu-mono"
  | "overpass-mono"
  | "comfortaa"
  | "space-grotesk"
  | "inter-tight"
  | "nunito"
  | "montserrat"
  | "atkinson-hyperlegible";

export interface FontOption {
  cssFamily: string;
  googleFamily: string | null;
  id: TypingFont;
  label: string;
  tag?: "mono" | "sans";
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "geist-mono",
    label: "Geist Mono",
    googleFamily: null,
    cssFamily: "var(--font-mono)",
    tag: "mono",
  },
  {
    id: "roboto-mono",
    label: "Roboto Mono",
    googleFamily: "Roboto+Mono:wght@400;500;700",
    cssFamily: "'Roboto Mono', monospace",
    tag: "mono",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    googleFamily: "JetBrains+Mono:wght@400;500;700",
    cssFamily: "'JetBrains Mono', monospace",
    tag: "mono",
  },
  {
    id: "fira-code",
    label: "Fira Code",
    googleFamily: "Fira+Code:wght@400;500;700",
    cssFamily: "'Fira Code', monospace",
    tag: "mono",
  },
  {
    id: "ibm-plex-mono",
    label: "IBM Plex Mono",
    googleFamily: "IBM+Plex+Mono:wght@400;500;700",
    cssFamily: "'IBM Plex Mono', monospace",
    tag: "mono",
  },
  {
    id: "source-code-pro",
    label: "Source Code Pro",
    googleFamily: "Source+Code+Pro:wght@400;500;700",
    cssFamily: "'Source Code Pro', monospace",
    tag: "mono",
  },
  {
    id: "inconsolata",
    label: "Inconsolata",
    googleFamily: "Inconsolata:wght@400;500;700",
    cssFamily: "'Inconsolata', monospace",
    tag: "mono",
  },
  {
    id: "ubuntu-mono",
    label: "Ubuntu Mono",
    googleFamily: "Ubuntu+Mono:wght@400;700",
    cssFamily: "'Ubuntu Mono', monospace",
    tag: "mono",
  },
  {
    id: "overpass-mono",
    label: "Overpass Mono",
    googleFamily: "Overpass+Mono:wght@400;600;700",
    cssFamily: "'Overpass Mono', monospace",
    tag: "mono",
  },
  {
    id: "comfortaa",
    label: "Comfortaa",
    googleFamily: "Comfortaa:wght@400;600;700",
    cssFamily: "'Comfortaa', cursive",
    tag: "sans",
  },
  {
    id: "inter-tight",
    label: "Inter Tight",
    googleFamily: "Inter+Tight:wght@400;500;700",
    cssFamily: "'Inter Tight', sans-serif",
    tag: "sans",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    googleFamily: "Space+Grotesk:wght@400;500;700",
    cssFamily: "'Space Grotesk', sans-serif",
    tag: "sans",
  },
  {
    id: "nunito",
    label: "Nunito",
    googleFamily: "Nunito:wght@400;600;700",
    cssFamily: "'Nunito', sans-serif",
    tag: "sans",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    googleFamily: "Montserrat:wght@400;600;700",
    cssFamily: "'Montserrat', sans-serif",
    tag: "sans",
  },
  {
    id: "atkinson-hyperlegible",
    label: "Atkinson Hyperlegible",
    googleFamily: "Atkinson+Hyperlegible:wght@400;700",
    cssFamily: "'Atkinson Hyperlegible', sans-serif",
    tag: "sans",
  },
];
