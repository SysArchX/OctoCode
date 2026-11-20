import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Switch, View } from "react-native";
import PageHeader from "@/components/PageHeader";
import { AppText, PressableScale, Screen, Surface } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { selectionFeedback, tapFeedback } from "@/lib/haptics";
import { useProgress } from "@/lib/progress";
import { resetWalkthrough } from "@/lib/walkthrough";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

const goals = [5, 10, 15];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { state, setDailyGoal, toggleMuted, resetProgress } = useProgress();
  const { user, guest, signOut } = useAuth();
  const [resetOpen, setResetOpen] = useState(false);

  const reviewTour = async () => {
    await resetWalkthrough();
    tapFeedback();
    router.replace("/");
  };

  const confirmReset = () => {
    resetProgress();
    setResetOpen(false);
    router.replace("/");
  };

  const switchAccount = async () => {
    tapFeedback();
    await signOut();
    router.replace("/");
  };

  return (
    <Screen scroll>
      <PageHeader title="Configurações" eyebrow="Ajustes do app" />

      <View style={styles.content}>
        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Conta
          </AppText>
          <View style={styles.accountRow}>
            <View style={[styles.accountIcon, { backgroundColor: colors.accentSoft }]}>
              <Feather name={user ? "user-check" : "user"} size={17} color={colors.accentInk} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.rowTitle}>
                {user ? user.email ?? "Conta conectada" : "Modo visitante"}
              </AppText>
              <AppText variant="caption" color={colors.faint}>
                {user
                  ? "Progresso e ranking global sincronizados"
                  : "Sem ranking global · progresso só neste aparelho"}
              </AppText>
            </View>
          </View>

          <PressableScale onPress={switchAccount} style={{ marginTop: 12 }}>
            <View style={[styles.action, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name={user ? "log-out" : "log-in"} size={16} color={colors.accentInk} />
              <AppText style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.accentInk }}>
                {user ? "Sair da conta" : "Entrar com Google"}
              </AppText>
              <Feather name="arrow-right" size={14} color={colors.accentInk} />
            </View>
          </PressableScale>
          {guest ? (
            <AppText variant="caption" color={colors.faint} style={{ marginTop: 8 }}>
              Entrar agora mantém o que você já estudou neste aparelho.
            </AppText>
          ) : null}
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Aparência
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
            {Platform.OS === "android"
              ? "Material You Expressive, com as cores e as formas do seu Android."
              : "Liquid Glass, com vidro translúcido e reflexos do iPhone."}
          </AppText>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.rowTitle}>Modo escuro</AppText>
              <AppText variant="caption" color={colors.faint}>
                Contraste calibrado nas duas paletas
              </AppText>
            </View>
            <Switch
              value={mode === "dark"}
              onValueChange={(value) => {
                selectionFeedback();
                setMode(value ? "dark" : "light");
              }}
              trackColor={{ true: colors.primary, false: colors.surface3 }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
              <Feather name="droplet" size={11} color={colors.accentInk} />
              <AppText variant="caption" color={colors.accentInk}>
                Vidro e cor por linguagem
              </AppText>
            </View>
          </View>
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Experiência
          </AppText>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.rowTitle}>Sons e vibração</AppText>
              <AppText variant="caption" color={colors.faint}>
                Feedback tátil ao acertar, errar e subir de nível
              </AppText>
            </View>
            <Switch
              value={!state.muted}
              onValueChange={() => {
                selectionFeedback();
                toggleMuted();
              }}
              trackColor={{ true: colors.primary, false: colors.surface3 }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.split}>
            <AppText style={styles.rowTitle}>Meta diária</AppText>
            <View style={styles.goalRow}>
              {goals.map((minutes) => {
                const active = state.dailyGoal === minutes;
                return (
                  <Pressable
                    key={minutes}
                    onPress={() => {
                      selectionFeedback();
                      setDailyGoal(minutes);
                    }}
                    style={[
                      styles.goalChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surfaceAlt,
                        borderColor: active ? colors.primary : colors.line,
                      },
                    ]}
                  >
                    <AppText
                      style={{
                        fontFamily: fonts.semibold,
                        fontSize: 12,
                        color: active ? colors.primaryInk : colors.muted,
                      }}
                    >
                      {minutes} min
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Tutorial
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
            Relembre o menu na borda, os corações e o OctoAI no cantinho.
          </AppText>
          <PressableScale onPress={reviewTour} style={{ marginTop: 12 }}>
            <View style={[styles.action, { backgroundColor: colors.primarySoft }]}>
              <Feather name="play-circle" size={16} color={colors.primary} />
              <AppText style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.primary }}>
                Rever Tutorial
              </AppText>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </View>
          </PressableScale>

          <PressableScale onPress={() => setResetOpen(true)} style={{ marginTop: 10 }}>
            <View style={[styles.action, { backgroundColor: colors.dangerSoft }]}>
              <Feather name="trash-2" size={16} color={colors.danger} />
              <AppText style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.danger }}>
                Apagar progresso deste dispositivo
              </AppText>
            </View>
          </PressableScale>

          {resetOpen ? (
            <View style={[styles.confirm, { borderColor: colors.danger }]}>
              <AppText variant="small" color={colors.muted}>
                Isso remove lições concluídas, XP, gemas e anotações. Não pode ser desfeito.
              </AppText>
              <View style={styles.confirmRow}>
                <Pressable onPress={() => setResetOpen(false)} style={styles.confirmButton}>
                  <AppText variant="caption" color={colors.muted}>
                    Cancelar
                  </AppText>
                </Pressable>
                <Pressable onPress={confirmReset} style={styles.confirmButton}>
                  <AppText variant="caption" color={colors.danger} style={{ fontFamily: fonts.bold }}>
                    Apagar tudo
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : null}
        </Surface>

        <View style={styles.footer}>
          <Feather name="shield" size={12} color={colors.faint} />
          <AppText variant="caption" color={colors.faint}>
            OctoCode 1.0 · seus dados ficam com você
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
    paddingBottom: 112,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  rowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  split: {
    marginTop: 18,
  },
  goalRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  goalChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  confirm: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    marginTop: 10,
    gap: 8,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
  },
  confirmButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
});
