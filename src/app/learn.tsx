import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Hud from "@/components/Hud";
import Mascot from "@/components/Mascot";
import { AppText, PressableScale, ProgressBar, Screen, Surface } from "@/components/ui";
import { getTrack, getUnits } from "@/data/curriculum";
import { buildPath, useProgress } from "@/lib/progress";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

const offsets = [-30, 18, 34, 12, -24, -36, -12, 26];

function PulseHalo({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.42, { duration: 1900, easing: Easing.out(Easing.quad) }), -1);
    opacity.value = withRepeat(withTiming(0, { duration: 1900, easing: Easing.out(Easing.quad) }), -1);
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.halo, { backgroundColor: color }, style]}
    />
  );
}

export default function LearnScreen() {
  const { colors, ui, mode } = useTheme();
  const { state, hydrated } = useProgress();

  useEffect(() => {
    if (hydrated && !state.onboarded) router.replace("/onboarding");
  }, [hydrated, state.onboarded]);

  if (!hydrated || !state.onboarded) return <Screen />;

  const track = getTrack(state.track);
  const units = getUnits(state.track);
  const path = buildPath(units, state.completed, state.placementPassed);
  const totalLessons = units.reduce((total, unit) => total + unit.lessons.length, 0);
  const doneLessons = state.completed.filter((id) =>
    units.some((unit) => unit.lessons.some((lesson) => lesson.id === id)),
  ).length;

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll bottomInset={false}>
        <Hud />

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.eyebrowRow}>
              <Feather name={track.icon} size={12} color={track.color} />
              <AppText variant="eyebrow" color={colors.faint}>
                Trilha ativa
              </AppText>
            </View>
            <AppText variant="hero" style={{ marginTop: 6 }}>
              {track.name}
            </AppText>
            <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
              {doneLessons} de {totalLessons} lições · prática real, sem decoreba
            </AppText>
          </View>
          <Mascot mood="idle" size={64} />
        </View>

        <View style={styles.units}>
          {path.map((unitState) => {
            const unit = units.find((item) => item.id === unitState.id);
            if (!unit) return null;
            const percent = Math.round((unitState.completedCount / unit.lessons.length) * 100);

            return (
              <Surface key={unit.id} padding={14}>
                <View style={styles.unitHeader}>
                  <View
                    style={[
                      styles.unitBadge,
                      {
                        backgroundColor: unitState.unlocked ? colors.primarySoft : colors.surfaceAlt,
                      },
                    ]}
                  >
                    {unit.index === 3 ? (
                      <Feather
                        name="award"
                        size={16}
                        color={unitState.unlocked ? colors.primary : colors.faint}
                      />
                    ) : (
                      <AppText
                        style={{
                          fontFamily: fonts.bold,
                          fontSize: 11.5,
                          color: unitState.unlocked ? colors.primary : colors.faint,
                        }}
                      >
                        {String(unit.index).padStart(2, "0")}
                      </AppText>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.unitTitleRow}>
                      <AppText style={styles.unitTitle} numberOfLines={1}>
                        {unit.title}
                      </AppText>
                      {!unitState.unlocked ? (
                        <Feather name="lock" size={11} color={colors.faint} />
                      ) : null}
                    </View>
                    <AppText variant="caption" color={colors.muted} numberOfLines={2} style={{ marginTop: 2 }}>
                      {unit.description}
                    </AppText>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <AppText variant="caption" color={colors.primary} style={{ fontFamily: fonts.bold, fontSize: 12 }}>
                      {percent}%
                    </AppText>
                    <AppText variant="caption" color={colors.faint} style={{ fontSize: 10 }}>
                      {unitState.completedCount}/{unit.lessons.length}
                    </AppText>
                  </View>
                </View>

                <View
                  style={[
                    styles.pathArea,
                    { backgroundColor: ui === "glass" ? colors.surfaceAlt : colors.surfaceAlt },
                    ui === "glass" ? { borderWidth: 1, borderColor: colors.line } : null,
                  ]}
                >
                  {unitState.lessons.map((node, index) => {
                    const lesson = unit.lessons.find((item) => item.id === node.id);
                    if (!lesson) return null;
                    const locked = node.state === "locked";
                    const active = node.state === "current";
                    const done = node.state === "done";

                    const circleStyle = {
                      backgroundColor: done
                        ? colors.primarySoft
                        : active
                          ? colors.primary
                          : colors.surface3,
                      borderColor: done ? colors.primary : "transparent",
                      borderWidth: 2,
                    };

                    return (
                      <View
                        key={node.id}
                        style={[
                          styles.nodeWrapper,
                          { transform: [{ translateX: offsets[index % offsets.length] }] },
                        ]}
                      >
                        {locked ? (
                          <View style={styles.node} accessibilityLabel={`${lesson.title}, bloqueada`}>
                            <View style={[styles.nodeCircle, circleStyle]}>
                              <Feather name="lock" size={18} color={colors.faint} />
                            </View>
                            <AppText variant="caption" color={colors.faint} style={styles.nodeLabel} numberOfLines={1}>
                              {lesson.title}
                            </AppText>
                          </View>
                        ) : (
                          <PressableScale
                            onPress={() => router.push(`/lesson/${node.id}`)}
                            accessibilityLabel={`${lesson.title}${done ? ", concluída" : ""}`}
                            haptic={false}
                          >
                            <View style={styles.node}>
                              <View style={styles.circleWrap}>
                                {active ? <PulseHalo color={colors.primary} /> : null}
                                <View style={[styles.nodeCircle, circleStyle]}>
                                  {done ? (
                                    <Feather name="check" size={21} color={colors.primary} />
                                  ) : (
                                    <Feather name="play" size={19} color={colors.primaryInk} />
                                  )}
                                </View>
                              </View>
                              <AppText style={styles.nodeLabel} numberOfLines={1}>
                                {lesson.title}
                              </AppText>
                              <AppText
                                variant="caption"
                                color={active ? colors.primary : colors.faint}
                                style={[styles.nodeMeta, active && { fontFamily: fonts.semibold }]}
                              >
                                {done ? "Concluída" : active ? "Continuar" : `${lesson.minutes} min`}
                              </AppText>
                            </View>
                          </PressableScale>
                        )}
                      </View>
                    );
                  })}
                </View>
              </Surface>
            );
          })}
        </View>

        <View style={[styles.noteCard, { backgroundColor: colors.surfaceAlt }]}>
          <Mascot mood="happy" size={40} />
          <AppText variant="small" color={colors.muted} style={{ flex: 1 }}>
            Cada lição termina com resumo automático no diário. Você escreve com suas palavras.
          </AppText>
          <Pressable onPress={() => router.push("/journal")} accessibilityLabel="Abrir diário">
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  units: {
    paddingHorizontal: 16,
    gap: 12,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  unitBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  unitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unitTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  pathArea: {
    marginTop: 12,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
    gap: 14,
  },
  nodeWrapper: {
    alignItems: "center",
  },
  node: {
    alignItems: "center",
    width: 140,
  },
  circleWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  nodeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B21B6",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nodeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 6,
  },
  nodeMeta: {
    fontSize: 9.5,
    marginTop: 1,
  },
  noteCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radii.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
