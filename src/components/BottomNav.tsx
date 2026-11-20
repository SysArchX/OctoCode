import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tapFeedback } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";
import { AppText } from "./ui";

const items: {
  href: "/" | "/learn" | "/journal";
  label: string;
  icon: "home" | "map" | "book-open";
}[] = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/learn", label: "Trilha", icon: "map" },
  { href: "/journal", label: "Diário", icon: "book-open" },
];

export default function BottomNav() {
  const { colors, ui, mode } = useTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <View
        style={[
          styles.inner,
          {
            shadowColor: colors.shadow,
            backgroundColor: ui === "glass" ? "transparent" : colors.navBg,
            borderColor: ui === "glass" ? colors.glassBorder : "transparent",
          },
        ]}
      >
        {ui === "glass" ? (
          <>
            <BlurView
              intensity={mode === "dark" ? 60 : 70}
              tint={mode === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.navBg, borderRadius: radii.pill }]}
            />
          </>
        ) : null}

        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(item.href);
          return (
            <Pressable
              key={item.href}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
              onPress={() => {
                tapFeedback();
                router.replace(item.href);
              }}
              style={[
                styles.item,
                active ? { backgroundColor: colors.primary } : null,
              ]}
            >
              <Feather
                name={item.icon}
                size={17}
                color={active ? colors.primaryInk : colors.muted}
              />
              <AppText
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 11.5,
                  color: active ? colors.primaryInk : colors.muted,
                }}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    padding: 6,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
});
