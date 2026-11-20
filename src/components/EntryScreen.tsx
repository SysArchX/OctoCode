import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoIcon from "@/components/LogoIcon";
import Mascot from "@/components/Mascot";
import { AppText, PressableScale } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { selectionFeedback, tapFeedback } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

/**
 * First entry: the real Octo presents the app and the student chooses how to
 * keep their progress. Only Google and guest mode are offered for now.
 */
export default function EntryScreen() {
  const { colors, ui, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { signInWith, continueAsGuest, busy, configured, error, clearError } = useAuth();
  const [guestOpen, setGuestOpen] = useState(false);
  const glass = ui === "glass";

  useEffect(() => {
    if (guestOpen) clearError();
  }, [guestOpen, clearError]);

  const acceptGuest = async () => {
    tapFeedback();
    await continueAsGuest();
    setGuestOpen(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 18 }]}>
        <View style={styles.brandRow}>
          <LogoIcon size={30} />
          <AppText style={styles.brand}>OctoCode</AppText>
        </View>

        <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
          <View
            style={[
              styles.mascotGlow,
              {
                backgroundColor: colors.primarySoft,
                borderColor: glass ? colors.glassBorder : "transparent",
              },
            ]}
          >
            {glass ? <View style={[styles.specular, { backgroundColor: colors.glassHighlight }]} /> : null}
            <Mascot mood="happy" size={196} />
          </View>
          <AppText variant="eyebrow" color={colors.accentInk} style={styles.eyebrow}>
            aprender fazendo
          </AppText>
          <AppText variant="hero" style={styles.title}>
            Seu primeiro código{"\n"}começa agora.
          </AppText>
          <AppText variant="small" color={colors.muted} style={styles.subtitle}>
            Lógica, Python, JavaScript, Linux e segurança ofensiva com prática real, offline e sem
            anúncios.
          </AppText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(420)}
          style={[
            styles.sheet,
            {
              backgroundColor: glass ? colors.glassTint : colors.surface,
              borderColor: glass ? colors.glassBorder : "transparent",
              paddingBottom: insets.bottom + 18,
            },
          ]}
        >
          {glass ? (
            <View style={[styles.sheetSpecular, { backgroundColor: colors.glassEdge }]} pointerEvents="none" />
          ) : null}

          <AppText variant="eyebrow" color={colors.faint} style={{ marginBottom: 10 }}>
            Guardar meu progresso
          </AppText>

          <AuthOption
            label="Continuar com Google"
            detail="Progresso e ranking global"
            icon={<FontAwesome5 name="google" size={16} color="#EA4335" />}
            background={mode === "dark" ? "rgba(255,255,255,0.10)" : "#FFFFFF"}
            ink={mode === "dark" ? "#FFFFFF" : "#15131D"}
            border={colors.line}
            disabled={busy}
            onPress={() => {
              selectionFeedback();
              void signInWith("google");
            }}
          />

          {error ? (
            <View
              style={[
                styles.error,
                { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
              ]}
            >
              <Feather name="alert-triangle" size={13} color={colors.danger} />
              <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>
                {error}
              </AppText>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar sem login"
            onPress={() => {
              tapFeedback();
              setGuestOpen(true);
            }}
            style={styles.guestLink}
          >
            <AppText style={[styles.guestText, { color: colors.muted }]}>Entrar sem login</AppText>
            <Feather name="arrow-right" size={13} color={colors.muted} />
          </Pressable>

          <AppText variant="caption" color={colors.faint} style={styles.footnote}>
            {configured
              ? "Seus dados ficam no aparelho e são sincronizados quando você entra."
              : "Modo offline pronto. O login fica disponível assim que a conexão estiver configurada."}
          </AppText>
        </Animated.View>
      </View>

      <Modal visible={guestOpen} transparent animationType="fade" onRequestClose={() => setGuestOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setGuestOpen(false)} />
          <Animated.View
            entering={FadeInDown.duration(260)}
            style={[
              styles.modalCard,
              {
                backgroundColor: mode === "dark" ? "#1B1725" : "#FFFFFF",
                borderColor: glass ? colors.glassBorder : "transparent",
              },
            ]}
          >
            <Mascot mood="thinking" size={92} animated={false} />
            <AppText variant="title" style={{ textAlign: "center", marginTop: 10 }}>
              Continuar sem conta?
            </AppText>
            <AppText variant="small" color={colors.muted} style={styles.modalText}>
              Sem fazer login, você não participa do Ranking Global e perde todo o seu progresso se
              desinstalar o app ou trocar de celular. Deseja continuar mesmo assim?
            </AppText>

            <View style={styles.modalActions}>
              <PressableScale
                onPress={() => {
                  tapFeedback();
                  setGuestOpen(false);
                }}
              >
                <View style={[styles.primaryAction, { backgroundColor: colors.primary }]}>
                  <Feather name="log-in" size={15} color={colors.primaryInk} />
                  <AppText style={[styles.actionLabel, { color: colors.primaryInk }]}>
                    Fazer Login
                  </AppText>
                </View>
              </PressableScale>

              <PressableScale onPress={acceptGuest}>
                <View style={[styles.ghostAction, { borderColor: colors.line }]}>
                  <AppText style={[styles.actionLabel, { color: colors.muted }]}>
                    Continuar sem conta
                  </AppText>
                </View>
              </PressableScale>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function AuthOption({
  label,
  detail,
  icon,
  background,
  ink,
  border,
  disabled,
  onPress,
}: {
  label: string;
  detail: string;
  icon: React.ReactNode;
  background: string;
  ink: string;
  border: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={{ width: "100%" }}>
      <View style={[styles.authButton, { backgroundColor: background, borderColor: border }]}>
        <View style={styles.authIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <AppText style={[styles.authLabel, { color: ink }]}>{label}</AppText>
          <AppText style={[styles.authDetail, { color: ink, opacity: 0.66 }]}>{detail}</AppText>
        </View>
        <Feather name="arrow-right" size={16} color={ink} style={{ opacity: 0.6 }} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.5,
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 12,
  },
  mascotGlow: {
    width: 236,
    height: 236,
    borderRadius: 118,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 18,
  },
  specular: {
    position: "absolute",
    top: 10,
    left: 34,
    right: 34,
    height: 1.5,
    borderRadius: 1,
  },
  eyebrow: { letterSpacing: 2.2, fontSize: 10.5 },
  title: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 30,
    lineHeight: 35,
  },
  subtitle: {
    textAlign: "center",
    marginTop: 10,
    maxWidth: 320,
  },
  sheet: {
    borderRadius: radii.xl + 4,
    borderWidth: 1,
    padding: 16,
    gap: 9,
  },
  sheetSpecular: {
    position: "absolute",
    top: 0,
    left: 26,
    right: 26,
    height: 1,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 58,
  },
  authIcon: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  authLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
  },
  authDetail: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    marginTop: 1,
  },
  error: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 10,
  },
  guestLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
  },
  guestText: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    textDecorationLine: "underline",
  },
  footnote: {
    textAlign: "center",
    lineHeight: 15,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(9,7,18,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    borderRadius: 30,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },
  modalText: {
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },
  modalActions: {
    width: "100%",
    gap: 9,
    marginTop: 18,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    borderRadius: radii.pill,
  },
  ghostAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  actionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
