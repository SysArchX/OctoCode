export type UiStyle = "material" | "glass";
export type ColorMode = "light" | "dark";

export const BRAND = "#5B21B6";
export const BRAND_LIGHT = "#C4B5FD";

export interface Accent {
  /** Official language colour, used for fills such as progress bars. */
  base: string;
  /** Readable variant for text and icons on the current surface. */
  ink: string;
  /** Tinted surface behind icons and chips. */
  soft: string;
}

const accentsLight: Record<string, { base: string; ink: string; soft: string }> = {
  python: { base: "#3776AB", ink: "#2B5F8C", soft: "#E8F1FA" },
  javascript: { base: "#F7DF1E", ink: "#8A6D00", soft: "#FBF6D8" },
  typescript: { base: "#3178C6", ink: "#265F9F", soft: "#E7F0FA" },
  rust: { base: "#DEA584", ink: "#A35C33", soft: "#FBEDE5" },
  cpp: { base: "#00599C", ink: "#00477D", soft: "#E3EEF7" },
  linux: { base: "#EAB308", ink: "#92680A", soft: "#FDF4D6" },
  hacking: { base: "#DC2626", ink: "#B91C1C", soft: "#FBE7E7" },
  logic: { base: BRAND, ink: BRAND, soft: "#EDE4FF" },
};

const accentsDark: Record<string, { base: string; ink: string; soft: string }> = {
  python: { base: "#6FB0DE", ink: "#9ACBEE", soft: "rgba(55,118,171,0.24)" },
  javascript: { base: "#F7DF1E", ink: "#F7DF1E", soft: "rgba(247,223,30,0.16)" },
  typescript: { base: "#6FA9E5", ink: "#9CC6F0", soft: "rgba(49,120,198,0.24)" },
  rust: { base: "#DEA584", ink: "#EBC3A9", soft: "rgba(222,165,132,0.2)" },
  cpp: { base: "#4C9BD6", ink: "#8CC0E8", soft: "rgba(0,89,156,0.3)" },
  linux: { base: "#FACC15", ink: "#FDE68A", soft: "rgba(234,179,8,0.18)" },
  hacking: { base: "#F87171", ink: "#FCA5A5", soft: "rgba(220,38,38,0.22)" },
  logic: { base: BRAND_LIGHT, ink: BRAND_LIGHT, soft: "rgba(196,181,253,0.18)" },
};

export function getAccent(track: string, mode: ColorMode): Accent {
  const set = mode === "dark" ? accentsDark : accentsLight;
  return set[track] ?? set.logic;
}

export interface Palette {
  bg: string;
  gradient: [string, string, string];
  surface: string;
  surfaceAlt: string;
  surface3: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  primary: string;
  primaryInk: string;
  primarySoft: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  heart: string;
  gem: string;
  streak: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  glassTint: string;
  glassBorder: string;
  glassHighlight: string;
  glassEdge: string;
  navBg: string;
  shadow: string;
}

const materialLight = (accent: Accent): Palette => ({
  bg: "#F6F4FB",
  gradient: ["#F6F4FB", "#F0ECFA", "#FAF8FF"],
  surface: "#FFFFFF",
  surfaceAlt: "#F3F0FA",
  surface3: "#E7E2F3",
  ink: "#1B1526",
  muted: "#5E5673",
  faint: "#8C85A1",
  line: "transparent",
  primary: BRAND,
  primaryInk: "#FFFFFF",
  primarySoft: "#EDE4FF",
  accent: accent.base,
  accentInk: accent.ink,
  accentSoft: accent.soft,
  heart: "#FF4D67",
  gem: "#0EA5B7",
  streak: "#F97316",
  success: "#15803D",
  successSoft: "rgba(21,128,61,0.12)",
  danger: "#E11D48",
  dangerSoft: "rgba(225,29,72,0.12)",
  glassTint: "transparent",
  glassBorder: "transparent",
  glassHighlight: "transparent",
  glassEdge: "transparent",
  navBg: "#FFFFFF",
  shadow: "rgba(51,32,92,0.14)",
});

const materialDark = (accent: Accent): Palette => ({
  bg: "#131118",
  gradient: ["#131118", "#1A1622", "#15121C"],
  surface: "#1E1B25",
  surfaceAlt: "#272230",
  surface3: "#332D3F",
  ink: "#ECE7F5",
  muted: "#ADA6BE",
  faint: "#827B94",
  line: "transparent",
  primary: BRAND_LIGHT,
  primaryInk: "#2A1150",
  primarySoft: "#2E2542",
  accent: accent.base,
  accentInk: accent.ink,
  accentSoft: accent.soft,
  heart: "#FF6B81",
  gem: "#3FD0DD",
  streak: "#FB923C",
  success: "#4ADE80",
  successSoft: "rgba(74,222,128,0.14)",
  danger: "#FB7185",
  dangerSoft: "rgba(251,113,133,0.16)",
  glassTint: "transparent",
  glassBorder: "transparent",
  glassHighlight: "transparent",
  glassEdge: "transparent",
  navBg: "#221F29",
  shadow: "#000000",
});

const glassLight = (accent: Accent): Palette => ({
  bg: "#E9ECF6",
  gradient: ["#E5DBFF", "#D8ECFF", "#FFE1F0"],
  surface: "rgba(255,255,255,0.62)",
  surfaceAlt: "rgba(255,255,255,0.5)",
  surface3: "rgba(255,255,255,0.34)",
  ink: "#15131D",
  muted: "#4C4859",
  faint: "#7B7789",
  line: "rgba(21,19,29,0.08)",
  primary: BRAND,
  primaryInk: "#FFFFFF",
  primarySoft: "rgba(91,33,182,0.10)",
  accent: accent.base,
  accentInk: accent.ink,
  accentSoft: "rgba(255,255,255,0.42)",
  heart: "#F43F5E",
  gem: "#0891B2",
  streak: "#EA580C",
  success: "#15803D",
  successSoft: "rgba(21,128,61,0.14)",
  danger: "#E11D48",
  dangerSoft: "rgba(225,29,72,0.14)",
  glassTint: "rgba(255,255,255,0.30)",
  glassBorder: "rgba(255,255,255,0.65)",
  glassHighlight: "rgba(255,255,255,0.45)",
  glassEdge: "rgba(255,255,255,0.45)",
  navBg: "rgba(255,255,255,0.5)",
  shadow: "rgba(31,22,56,0.20)",
});

const glassDark = (accent: Accent): Palette => ({
  bg: "#0B0B12",
  gradient: ["#1C1440", "#0B2033", "#241126"],
  surface: "rgba(20,26,42,0.55)",
  surfaceAlt: "rgba(255,255,255,0.08)",
  surface3: "rgba(255,255,255,0.06)",
  ink: "#F2F4FA",
  muted: "#B6BBCB",
  faint: "#8A90A4",
  line: "rgba(255,255,255,0.10)",
  primary: BRAND_LIGHT,
  primaryInk: "#1C1136",
  primarySoft: "rgba(196,181,253,0.16)",
  accent: accent.base,
  accentInk: accent.ink,
  accentSoft: accent.soft,
  heart: "#FB7185",
  gem: "#22D3EE",
  streak: "#FDBA74",
  success: "#4ADE80",
  successSoft: "rgba(74,222,128,0.16)",
  danger: "#FB7185",
  dangerSoft: "rgba(251,113,133,0.16)",
  glassTint: "rgba(15,23,42,0.40)",
  glassBorder: "rgba(255,255,255,0.16)",
  glassHighlight: "rgba(255,255,255,0.45)",
  glassEdge: "rgba(255,255,255,0.22)",
  navBg: "rgba(17,23,38,0.58)",
  shadow: "#000000",
});

export function getPalette(ui: UiStyle, mode: ColorMode, accent: Accent): Palette {
  if (ui === "material") return mode === "light" ? materialLight(accent) : materialDark(accent);
  return mode === "light" ? glassLight(accent) : glassDark(accent);
}

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
  mono: "JetBrainsMono_400Regular",
  monoBold: "JetBrainsMono_600SemiBold",
};

export const typography = {
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase" as const },
  hero: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8, lineHeight: 31 },
  title: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.5, lineHeight: 26 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: -0.2, lineHeight: 20 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 15 },
  code: { fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 19 },
};
