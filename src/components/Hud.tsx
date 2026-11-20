import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tracks } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";
import LogoIcon from "./LogoIcon";
import ThemeSwitch from "./ThemeSwitch";
import { AppText, StatChip, Surface } from "./ui";

export default function Hud() {
  const { colors, ui, mode } = useTheme();
  const { state, setTrack } = useProgress();
  const [trackSheet, setTrackSheet] = useState(false);
  const insets = useSafeAreaInsets();
  const track = tracks.find((item) => item.id === state.track) ?? tracks[0];
  const glass = ui === "glass";

  return (
    <View style={styles.header}>
      <Surface padding={8} radius={26} contentStyle={styles.topRow}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="OctoCode, início"
          onPress={() => router.replace("/")}
          style={styles.brand}
        >
          <LogoIcon size={26} />
          <AppText style={styles.brandText}>OctoCode</AppText>
        </Pressable>

        <View style={styles.actions}>
          <ThemeSwitch />
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Caderno de Estudos"
            hitSlop={8}
            onPress={() => router.push("/journal")}
            style={styles.bookButton}
          >
            <Feather name="book-open" size={17} color={colors.muted} />
          </Pressable>
        </View>
      </Surface>

      <View style={styles.statsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher trilha"
          onPress={() => setTrackSheet(true)}
          style={[
            styles.trackPill,
            {
              backgroundColor: colors.accentSoft,
              borderColor: glass ? colors.line : "transparent",
            },
          ]}
        >
          <View style={[styles.trackIcon, { backgroundColor: colors.surface }]}>
            <Feather name={track.icon} size={12} color={colors.accentInk} />
          </View>
          <AppText style={[styles.trackName, { color: colors.accentInk }]} numberOfLines={1}>
            {track.short}
          </AppText>
          <Feather name="chevron-down" size={12} color={colors.accentInk} />
        </Pressable>

        <StatChip icon="zap" value={state.streak} tint={colors.streak} label="Ofensiva" />
        <StatChip icon="hexagon" value={state.gems} tint={colors.gem} label="Gemas" />
      </View>

      <Modal
        visible={trackSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setTrackSheet(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setTrackSheet(false)}>
          <Pressable style={styles.sheetWrapper} onPress={() => undefined}>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: glass ? colors.glassTint : colors.surface,
                  borderColor: glass ? colors.glassBorder : "transparent",
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
              <View style={{ padding: 16, paddingBottom: insets.bottom + 12, gap: 6 }}>
                <View style={styles.grabber} />
                <AppText variant="eyebrow" color={colors.faint} style={{ marginTop: 8 }}>
                  Escolha sua trilha
                </AppText>
                {tracks.map((item) => {
                  const active = item.id === track.id;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => {
                        setTrack(item.id);
                        setTrackSheet(false);
                      }}
                      style={[
                        styles.trackOption,
                        { backgroundColor: active ? colors.accentSoft : "transparent" },
                      ]}
                    >
                      <View style={[styles.optionIcon, { backgroundColor: item.soft }]}>
                        <Feather name={item.icon} size={16} color={item.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText style={{ fontFamily: fonts.semibold, fontSize: 13.5 }}>
                          {item.name}
                        </AppText>
                        <AppText variant="caption" color={colors.muted}>
                          {item.tagline}
                        </AppText>
                      </View>
                      {active ? (
                        <Feather name="check" size={16} color={colors.accentInk} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  bookButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  trackPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 5,
    paddingRight: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    maxWidth: 142,
  },
  trackIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  trackName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    flexShrink: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,6,20,0.45)",
    justifyContent: "flex-end",
  },
  sheetWrapper: {
    padding: 12,
  },
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 26,
    right: 26,
    height: 1,
  },
  grabber: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(140,130,160,0.4)",
  },
  trackOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    padding: 8,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
