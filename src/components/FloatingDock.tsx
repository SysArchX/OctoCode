import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/components/ui";
import { tapFeedback } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";

const items = [
  { href: "/learn" as const, label: "Trilhas", icon: "map" as const },
  { href: "/terminal" as const, label: "Terminal", icon: "terminal" as const },
  { href: "/journal" as const, label: "Caderno de Estudos", icon: "book-open" as const },
];

/**
 * Floating capsule (Liquid Glass on iOS, tonal surface on Android) with the
 * three destinations a student uses while studying. OctoAI lives in the
 * peeking mascot, so it is intentionally not here.
 */
export default function FloatingDock() {
  const { colors, ui, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const glass = ui === "glass";

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 16 }]}>
      <View
        style={[
          styles.dock,
          {
            backgroundColor: glass ? colors.glassTint : colors.surface,
            borderColor: glass ? colors.glassBorder : "transparent",
            shadowColor: colors.shadow,
          },
        ]}
      >
        {glass ? (
          <BlurView
            intensity={mode === "dark" ? 70 : 82}
            tint={mode === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {glass ? (
          <View style={[styles.specular, { backgroundColor: colors.glassEdge }]} pointerEvents="none" />
        ) : null}

        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <PressableScale
              key={item.href}
              accessibilityLabel={item.label}
              onPress={() => {
                tapFeedback();
                router.push(item.href);
              }}
            >
              <View style={[styles.item, active ? { backgroundColor: colors.accentSoft } : null]}>
                <Feather
                  name={item.icon}
                  size={18}
                  color={active ? colors.accentInk : colors.muted}
                />
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  dock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 1,
  },
  item: {
    width: 46,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});
