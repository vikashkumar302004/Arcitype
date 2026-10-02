import type { KeyboardThemeName } from "@/components/ui/keyboard";

export const THEME_OPTIONS: {
  id: KeyboardThemeName;
  label: string;
  colors: [string, string, string]; // [light, dark, accent]
}[] = [
  { id: "royal", label: "Royal", colors: ["#324974", "#3A3B35", "#E4D440"] },
  {
    id: "emerald",
    label: "Emerald",
    colors: ["#182F25", "#2D5A46", "#34D399"],
  },
  {
    id: "sakura",
    label: "Sakura",
    colors: ["#2D1B28", "#5B3A4D", "#FFB7C5"],
  },
  {
    id: "amber",
    label: "Amber",
    colors: ["#1F1913", "#3D2B1D", "#F59E0B"],
  },
  {
    id: "classic",
    label: "Classic",
    colors: ["#F5F5F5", "#737373", "#F57644"],
  },
  { id: "mint", label: "Mint", colors: ["#EEEEEE", "#447B82", "#86C8AC"] },
  { id: "dolch", label: "Dolch", colors: ["#4F5E78", "#3E3B4C", "#D73E42"] },
  { id: "sand", label: "Sand", colors: ["#EFEFEF", "#893D36", "#C94E41"] },
  {
    id: "scarlet",
    label: "Scarlet",
    colors: ["#E4D7D7", "#D5868A", "#E1E1E1"],
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    colors: ["#2A085C", "#FF007F", "#00F0FF"],
  },
  {
    id: "dracula",
    label: "Dracula",
    colors: ["#282A36", "#44475A", "#BD93F9"],
  },
  {
    id: "nord",
    label: "Nord",
    colors: ["#3B4252", "#4C566A", "#88C0D0"],
  },
  {
    id: "catppuccin",
    label: "Catppuccin",
    colors: ["#1E1E2E", "#585B70", "#CBA6F7"],
  },
  {
    id: "matrix",
    label: "Matrix",
    colors: ["#051A0B", "#003311", "#00FF66"],
  },
];
