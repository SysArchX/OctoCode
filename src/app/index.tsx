import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import EntryScreen from "@/components/EntryScreen";
import FloatingDock from "@/components/FloatingDock";
import Hud from "@/components/Hud";
import Mascot from "@/components/Mascot";
import Walkthrough from "@/components/Walkthrough";
import {
  AppText,
  PressableScale,
  ProgressBar,
  ProgressRing,
  Screen,
  StatChip,
  Surface,
} from "@/components/ui";
import { getTrack, getUnits } from "@/data/curriculum";
import { useAuth } from "@/lib/auth";
import { buildPath, useProgress } from "@/lib/progress";
import { hasSeenWalkthrough, markWalkthroughSeen } from "@/lib/walkthrough";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { state, hydrated } = useProgress();
  const { hydrated: authReady, user, guest } = useAuth();
  const [greeting, setGreeting] = useState("Olá");
  const [tourOpen, setTourOpen] = useState(false);

  const signedIn = Boolean(user || guest);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite");
  }, []);

  useEffect(() => {
    if (hydrated && signedIn && !state.onboarded) router.replace("/onboarding");
  }, [hydrated, state.onboarded, signedIn]);

  useEffect(() => {
    if (!hydrated || !state.onboarded) return;
    let active = true;
    hasSeenWalkthrough().then((seen) => {
      if (active && !seen) setTourOpen(true);
    });
    return () => {
      active = false;
    };
  }, [hydrated, state.onboarded]);

  const track = getTrack(state.track);
  const units = getUnits(state.track);
  const path = buildPath(units, state.completed, state.placementPassed);

  const nextLesson = useMemo(() => {
    const currentNode = path.flatMap((unit) => unit.lessons).find((lesson) => lesson.state === "current");
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        if (currentNode ? lesson.id === currentNode.id : !state.completed.includes(lesson.id)) {
          return { lesson, unit };
        }
      }
    }
    return null;
  }, [path, units, state.completed]);

  const goalXp = state.dailyGoal * 2;
  const goalPercent = Math.round((state.xpToday / goalXp) * 100);

  if (!authReady || !hydrated) {
    return <Screen />;
  }

  if (!signedIn) {
    return <EntryScreen />;
  }

  if (!state.onboarded) {
    return <Screen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll bottomInset={false}>
        <Hud />
        <View style={styles.content}>
          <Surface padding={20}>
            <View style={styles.heroRow}>
              <View
                style={[
                  styles.mascotCircle,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Mascot mood="happy" size={78} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="eyebrow" color={colors.faint}>
                  {greeting}, explorador
                </AppText>
                <AppText variant="title" style={styles.heroTitle}>
                  Sua próxima descoberta está aqui.
                </AppText>
                <View style={styles.trackLine}>
                  <Feather name={track.icon} size={12} color={colors.accentInk} />
                  <AppText variant="small" color={colors.muted}>
                    {track.name} · Unidade {nextLesson?.unit.index ?? 3} de 3
                  </AppText>
                </View>
              </View>
            </View>
          </Surface>

          <Surface padding={18}>
            <View style={styles.goalRow}>
              <ProgressRing percent={goalPercent} caption="meta" />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.goalLabel}>
                  <Feather name="target" size={12} color={colors.faint} />
                  <AppText variant="eyebrow" color={colors.faint}>
                    Meta diária
                  </AppText>
                </View>
                <AppText style={styles.goalValue}>
                  {state.xpToday} de {goalXp} XP hoje
                </AppText>
                <AppText variant="small" color={colors.muted}>
                  {state.dailyGoal} min por dia · sem pressa, sem punição
                </AppText>
                <View style={styles.statRow}>
                  <StatChip icon="zap" value={state.streak} tint={colors.streak} label="Ofensiva" />
                  <StatChip icon="hexagon" value={state.gems} tint={colors.gem} label="Gemas" />
                  <StatChip icon="star" value={state.xpTotal} label="XP total" />
                </View>
              </View>
            </View>
          </Surface>

          {nextLesson ? (
            <PressableScale
              onPress={() => router.push(`/lesson/${nextLesson.lesson.id}`)}
              accessibilityLabel={`Continuar lição ${nextLesson.lesson.title}`}
            >
              <View
                style={[
                  styles.continueCard,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
              >
                <View style={styles.continueDecor} />
                <View style={styles.continueDecorSmall} />
                <AppText
                  variant="eyebrow"
                  color={colors.primaryInk}
                  style={{ opacity: 0.72, fontSize: 10.5 }}
                >
                  Continuar de onde parou
                </AppText>
                <AppText style={[styles.continueTitle, { color: colors.primaryInk }]}>
                  {nextLesson.lesson.title}
                </AppText>
                <AppText style={[styles.continueMeta, { color: colors.primaryInk }]}>
                  {nextLesson.unit.title} · {nextLesson.lesson.minutes} min ·{" "}
                  {nextLesson.lesson.exercises.length} exercícios
                </AppText>
                <View
                  style={[styles.continueButton, { backgroundColor: colors.primaryInk }]}
                >
                  <AppText style={[styles.continueButtonText, { color: colors.primary }]}>
                    Continuar lição
                  </AppText>
                  <Feather name="arrow-right" size={15} color={colors.primary} />
                </View>
              </View>
            </PressableScale>
          ) : (
            <Surface padding={18}>
              <AppText variant="eyebrow" color={colors.faint}>
                Trilha concluída
              </AppText>
              <AppText variant="subtitle" style={{ marginTop: 6 }}>
                Você terminou as 3 unidades de {track.name}.
              </AppText>
              <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
                Revise qualquer lição no mapa ou escolha outra trilha no topo.
              </AppText>
            </Surface>
          )}

          <Surface padding={16}>
            <View style={styles.sectionHeader}>
              <View>
                <AppText variant="eyebrow" color={colors.faint}>
                  Sua trilha
                </AppText>
                <AppText variant="subtitle" style={{ marginTop: 3 }}>
                  Do zero à primeira aplicação
                </AppText>
              </View>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/learn")}
                style={styles.mapLink}
              >
                <AppText variant="caption" color={colors.accentInk} style={{ fontFamily: fonts.semibold }}>
                  Ver mapa
                </AppText>
                <Feather name="arrow-right" size={12} color={colors.accentInk} />
              </Pressable>
            </View>

            {units.map((unit, index) => {
              const unitState = path.find((item) => item.id === unit.id);
              const percent = unitState
                ? Math.round((unitState.completedCount / unit.lessons.length) * 100)
                : 0;
              const done = unitState?.completedCount === unit.lessons.length;
              return (
                <View key={unit.id} style={[styles.unitRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                  <View
                    style={[
                      styles.unitBadge,
                      {
                        backgroundColor: done ? colors.accent : colors.accentSoft,
                      },
                    ]}
                  >
                    {done ? (
                      <Feather name="check" size={15} color="#FFFFFF" />
                    ) : unit.index === 3 ? (
                      <Feather name="award" size={15} color={colors.accentInk} />
                    ) : (
                      <AppText style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.accentInk }}>
                        {String(unit.index).padStart(2, "0")}
                      </AppText>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.unitTitle} numberOfLines={1}>
                      {unit.title}
                    </AppText>
                    <AppText variant="caption" color={colors.muted}>
                      {unitState?.completedCount ?? 0} de {unit.lessons.length} lições
                    </AppText>
                  </View>
                  <View style={styles.unitProgress}>
                    <ProgressBar percent={percent} height={5} />
                    <AppText variant="caption" color={colors.faint} style={{ width: 28, textAlign: "right" }}>
                      {percent}%
                    </AppText>
                  </View>
                </View>
              );
            })}
          </Surface>

          <View style={styles.footer}>
            <Feather name="feather" size={11} color={colors.faint} />
            <AppText variant="caption" color={colors.faint}>
              Gratuito para sempre · sem anúncios · offline
            </AppText>
          </View>
          <View style={{ height: 96 }} />
        </View>
      </Screen>

      <FloatingDock />

      {tourOpen ? (
        <Walkthrough
          onDone={() => {
            markWalkthroughSeen();
            setTourOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  mascotCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 19,
    lineHeight: 24,
    marginTop: 5,
  },
  trackLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  goalValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginTop: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  continueCard: {
    borderRadius: radii.xl,
    padding: 20,
    overflow: "hidden",
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  continueDecor: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.10)",
    right: -46,
    top: -54,
  },
  continueDecorSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.06)",
    right: 30,
    bottom: -46,
  },
  continueTitle: {
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.4,
    marginTop: 6,
  },
  continueMeta: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    opacity: 0.76,
    marginTop: 4,
  },
  continueButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 16,
  },
  continueButtonText: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingBottom: 6,
  },
  mapLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  unitBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  unitTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  unitProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 82,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
  },
});
