import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProgress } from "@/lib/progress";
import { tapFeedback } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";
import LogoIcon from "./LogoIcon";
import Mascot from "./Mascot";
import { AppText, StatChip } from "./ui";

type MenuItem = {
  href: "/learn" | "/terminal" | "/leaderboard" | "/journal" | "/settings" | "/about";
  label: string;
  detail: string;
  icon: React.ComponentProps<typeof Feather>["name"];
};

const sections: { title: string; items: MenuItem[] }[] = [
  {
    title: "Aprender",
    items: [
      { href: "/learn", label: "Trilhas & Cursos", detail: "Lógica, linguagens, Linux e hacking", icon: "map" },
      { href: "/terminal", label: "Terminal OctoCoreOS", detail: "Shell POSIX e CyberSuite", icon: "terminal" },
      { href: "/leaderboard", label: "Ranking Global", detail: "Ligas por linguagem", icon: "award" },
    ],
  },
  {
    title: "Ferramentas",
    items: [
      { href: "/journal", label: "Caderno de Estudos", detail: "Anotações e resumos", icon: "book-open" },
    ],
  },
  {
    title: "OctoCode",
    items: [
      { href: "/settings", label: "Configurações", detail: "Tema, modo, sons e tutorial", icon: "sliders" },
      { href: "/about", label: "Sobre", detail: "Versão, fontes e privacidade", icon: "info" },
    ],
  },
];

const SPRING = { damping: 22, stiffness: 210, mass: 0.9 };

export default function AppDrawer() {
  const { colors, ui, mode } = useTheme();
  const { state } = useProgress();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(320, Math.round(width * 0.84));

  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  const openDrawer = useCallback(() => {
    tapFeedback();
    progress.value = withSpring(1, SPRING);
    setOpen(true);
  }, [progress]);

  const closeDrawer = useCallback(() => {
    progress.value = withSpring(0, SPRING, (finished) => {
      if (finished) runOnJS(setOpen)(false);
    });
  }, [progress]);

  const edgeGesture = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetY([-26, 26])
    .onUpdate((event) => {
      if (event.translationX > 0) {
        progress.value = Math.min(1, event.translationX / drawerWidth);
      }
    })
    .onEnd((event) => {
      const shouldOpen = event.translationX > drawerWidth * 0.26 || event.velocityX > 620;
      if (shouldOpen) {
        progress.value = withSpring(1, SPRING);
        runOnJS(setOpen)(true);
        runOnJS(tapFeedback)();
      } else {
        progress.value = withSpring(0, SPRING);
      }
    });

  const closeGesture = Gesture.Pan()
    .activeOffsetX(-10)
    .onUpdate((event) => {
      if (event.translationX < 0) {
        progress.value = Math.max(0, 1 + event.translationX / drawerWidth);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -drawerWidth * 0.22 || event.velocityX < -520) {
        progress.value = withSpring(0, SPRING, (finished) => {
          if (finished) runOnJS(setOpen)(false);
        });
      } else {
        progress.value = withSpring(1, SPRING);
      }
    });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-drawerWidth - 16, 0]) }],
  }));

  const go = (href: MenuItem["href"]) => {
    closeDrawer();
    if (pathname === href) return;
    setTimeout(() => router.push(href), 120);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {!open ? (
        <GestureDetector gesture={edgeGesture}>
          <View style={styles.edge} accessibilityLabel="Abrir menu: arraste da borda esquerda" />
        </GestureDetector>
      ) : null}

      <Animated.View
        style={[styles.overlay, { backgroundColor: "rgba(9,7,18,0.55)" }, overlayStyle]}
        pointerEvents={open ? "auto" : "none"}
      >
        <GestureDetector gesture={closeGesture}>
          <Pressable
            accessibilityLabel="Fechar menu"
            style={StyleSheet.absoluteFill}
            onPress={closeDrawer}
          />
        </GestureDetector>

        <Animated.View
          style={[
            styles.panel,
            {
              width: drawerWidth,
              paddingTop: insets.top + 16,
              shadowColor: colors.shadow,
              borderColor: ui === "glass" ? colors.glassBorder : colors.line,
            },
            panelStyle,
          ]}
        >
          {ui === "glass" ? (
            <BlurView
              intensity={mode === "dark" ? 70 : 80}
              tint={mode === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor:
                  ui === "glass"
                    ? mode === "dark"
                      ? "rgba(12,12,20,0.82)"
                      : "rgba(255,255,255,0.82)"
                    : colors.bg,
              },
            ]}
          />
          {ui === "glass" ? (
            <View
              pointerEvents="none"
              style={[styles.specular, { backgroundColor: colors.glassHighlight }]}
            />
          ) : null}

          <View style={styles.header}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="OctoCode, início"
              onPress={() => go("/learn")}
              style={styles.brand}
            >
              <LogoIcon size={26} color={colors.primary} />
              <View>
                <AppText style={styles.brandText}>OctoCode</AppText>
                <AppText variant="caption" color={colors.faint}>
                  aprender fazendo
                </AppText>
              </View>
            </Pressable>
            <Pressable
              onPress={closeDrawer}
              accessibilityLabel="Fechar menu"
              hitSlop={10}
              style={[styles.close, { backgroundColor: colors.surfaceAlt }]}
            >
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
          </View>

          <View style={[styles.profile, { backgroundColor: colors.surfaceAlt }]}>
            <Mascot mood="idle" size={54} />
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={colors.faint}>
                Explorador octo
              </AppText>
              <AppText style={styles.profileName}>{state.xpTotal} XP acumulados</AppText>
              <View style={styles.chips}>
                <StatChip icon="zap" value={state.streak} tint={colors.streak} label="Ofensiva" />
                <StatChip icon="hexagon" value={state.gems} tint={colors.gem} label="Gemas" />
              </View>
            </View>
          </View>

          <View style={styles.items}>
            {sections.map((section) => (
              <View key={section.title} style={{ gap: 2 }}>
                <AppText variant="eyebrow" color={colors.faint} style={styles.sectionTitle}>
                  {section.title}
                </AppText>
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Pressable
                      key={item.href}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: active }}
                      onPress={() => go(item.href)}
                      style={[
                        styles.item,
                        { backgroundColor: active ? colors.primarySoft : "transparent" },
                      ]}
                    >
                      <View
                        style={[
                          styles.itemIcon,
                          { backgroundColor: active ? colors.primary : colors.surfaceAlt },
                        ]}
                      >
                        <Feather
                          name={item.icon}
                          size={15}
                          color={active ? colors.primaryInk : colors.muted}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          style={{
                            fontFamily: fonts.semibold,
                            fontSize: 13.5,
                            color: active ? colors.primary : colors.ink,
                          }}
                        >
                          {item.label}
                        </AppText>
                        <AppText variant="caption" color={colors.faint} numberOfLines={1}>
                          {item.detail}
                        </AppText>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={14}
                        color={active ? colors.primary : colors.faint}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: colors.line }]}>
            <View style={styles.swipeHint}>
              <Feather name="chevrons-left" size={12} color={colors.faint} />
              <AppText variant="caption" color={colors.faint}>
                arraste para a esquerda para fechar
              </AppText>
            </View>
                          <AppText variant="caption" color={colors.faint}>
                OctoCode 1.0 · funciona offline
              </AppText>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 22,
    zIndex: 30,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 18, height: 0 },
    elevation: 16,
  },
  specular: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    height: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brandText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.4,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 14,
    padding: 12,
    borderRadius: radii.lg,
  },
  profileName: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    marginTop: 1,
  },
  chips: {
    flexDirection: "row",
    gap: 5,
    marginTop: 7,
  },
  items: {
    paddingHorizontal: 12,
    paddingTop: 14,
    gap: 12,
  },
  sectionTitle: {
    paddingHorizontal: 8,
    paddingBottom: 3,
    fontSize: 9.5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
