import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform, useColorScheme } from "react-native";
import { useProgress } from "@/lib/progress";
import { getAccent, getPalette, type ColorMode, type Palette, type UiStyle } from "./tokens";

const MODE_KEY = "octocode.mode";

/**
 * The visual language follows the real device, exactly like native apps do:
 * Android gets Material 3 Expressive, iPhone gets Apple Liquid Glass.
 * There is no manual switch — and no reason for one.
 */
function detectUi(): UiStyle {
  const forced = (globalThis as { __OCTO_UI__?: UiStyle }).__OCTO_UI__;
  if (forced === "material" || forced === "glass") return forced;
  if (Platform.OS === "android") return "material";
  if (Platform.OS === "ios") return "glass";
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    return /Android/i.test(navigator.userAgent) ? "material" : "glass";
  }
  return "glass";
}

interface ThemeContextValue {
  ui: UiStyle;
  mode: ColorMode;
  colors: Palette;
  hydrated: boolean;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const { state } = useProgress();
  const [ui] = useState<UiStyle>(detectUi);
  const [mode, setModeState] = useState<ColorMode>(systemScheme === "dark" ? "dark" : "light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(MODE_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        if (stored === "light" || stored === "dark") setModeState(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
    // the system scheme is only the initial guess
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(MODE_KEY, mode).catch(() => undefined);
  }, [mode, hydrated]);

  const setMode = useCallback((next: ColorMode) => setModeState(next), []);
  const toggleMode = useCallback(
    () => setModeState((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  const accent = useMemo(() => getAccent(state.track, mode), [state.track, mode]);
  const colors = useMemo(() => getPalette(ui, mode, accent), [ui, mode, accent]);

  const value = useMemo(
    () => ({ ui, mode, colors, hydrated, setMode, toggleMode }),
    [ui, mode, colors, hydrated, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme precisa estar dentro do ThemeProvider");
  return context;
}
