import { Feather } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Mascot from "@/components/Mascot";
import PageHeader from "@/components/PageHeader";
import { AppText, ProgressBar, Screen, Surface } from "@/components/ui";
import { getUnits, tracks } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const { state } = useProgress();

  const leagues = tracks.map((track) => {
    const lessons = getUnits(track.id).flatMap((unit) => unit.lessons);
    const done = lessons.filter((lesson) => state.completed.includes(lesson.id)).length;
    const xp = done * 10;
    return { track, total: lessons.length, done, xp };
  });

  const best = leagues.reduce((top, item) => (item.xp > top.xp ? item : top), leagues[0]);

  return (
    <Screen scroll>
      <PageHeader title="Ranking" eyebrow="Ligas por linguagem" />

      <View style={styles.content}>
        <Surface padding={18}>
          <View style={styles.hero}>
            <View style={{ flex: 1 }}>
              <AppText variant="eyebrow" color={colors.faint}>
                Sua posição local
              </AppText>
              <AppText variant="hero" style={{ marginTop: 6 }}>
                {state.xpTotal} XP
              </AppText>
              <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
                Melhor liga: {best.track.name} · {best.xp} XP na trilha
              </AppText>
            </View>
            <Mascot mood="happy" size={68} />
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
              <Feather name="award" size={13} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} style={{ fontFamily: fonts.semibold }}>
                Ofensiva de {state.streak} dias
              </AppText>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="hexagon" size={13} color={colors.gem} />
              <AppText variant="caption" color={colors.muted}>
                {state.gems} gemas
              </AppText>
            </View>
          </View>
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Ligas
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
            Cada linguagem tem sua própria liga. Seu XP na trilha sobe a cada lição concluída.
          </AppText>

          <View style={{ marginTop: 12, gap: 12 }}>
            {leagues.map((item) => {
              const percent = item.total === 0 ? 0 : Math.round((item.done / item.total) * 100);
              return (
                <View key={item.track.id}>
                  <View style={styles.leagueRow}>
                    <View style={[styles.leagueIcon, { backgroundColor: item.track.soft }]}>
                      <Feather name={item.track.icon} size={14} color={item.track.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.leagueName}>{item.track.name}</AppText>
                      <AppText variant="caption" color={colors.faint}>
                        {item.done}/{item.total} lições
                      </AppText>
                    </View>
                    <AppText style={[styles.leagueXp, { color: item.track.color }]}>
                      {item.xp} XP
                    </AppText>
                  </View>
                  <View style={{ marginTop: 6 }}>
                    <ProgressBar percent={percent} height={4} />
                  </View>
                </View>
              );
            })}
          </View>
        </Surface>

        <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
          <Feather name="cloud" size={14} color={colors.primary} />
          <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
            Seu XP sobe para o ranking global por linguagem e continua salvo no aparelho, então
            funciona offline e sincroniza de novo quando a conexão volta.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leagueIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  leagueName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  leagueXp: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: radii.md,
    padding: 12,
  },
});
