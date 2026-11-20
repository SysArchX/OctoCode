import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";
import Mascot from "./Mascot";
import { AppText, PrimaryButton } from "./ui";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function Walkthrough({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "O menu fica na borda",
      body: "Arraste o dedo da borda esquerda para a direita para abrir todos os acessos do OctoCode. Toque em qualquer área escura para voltar na hora.",
      icon: "menu" as const,
      target: { x: 0, y: height * 0.34, w: 54, h: 150 },
    },
    {
      title: "5 corações só na lição",
      body: "Os corações aparecem no topo da aula ativa. Se perder todos, você volta ao início e pode entrar de novo quantas vezes quiser — a lição recomeça do começo, sem espera.",
      icon: "heart" as const,
      target: { x: width - 152, y: insets.top + 56, w: 146, h: 44 },
    },
    {
      title: "Octo está sempre por aqui",
      body: "O polvo espiando no canto abre o OctoAI. Ele explica teoria, Linux e segurança citando fontes reais, sem entregar o código pronto do exercício.",
      icon: "message-circle" as const,
      target: { x: width - 104, y: height - insets.bottom - 62, w: 96, h: 60 },
    },
  ];

  const current = steps[step];
  const target = current.target;
  const cardTop = Math.min(
    Math.max(target.y + target.h + 18, insets.top + 80),
    height - 290,
  );

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      exiting={FadeOut.duration(200)}
      style={styles.root}
    >
      <View style={[styles.shade, { top: 0, left: 0, right: 0, height: Math.max(0, target.y) }]} />
      <View style={[styles.shade, { top: target.y, left: 0, width: Math.max(0, target.x), height: target.h }]} />
      <View
        style={[
          styles.shade,
          {
            top: target.y,
            left: target.x + target.w,
            right: 0,
            height: target.h,
          },
        ]}
      />
      <View style={[styles.shade, { top: target.y + target.h, left: 0, right: 0, bottom: 0 }]} />

      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            top: target.y,
            left: target.x,
            width: target.w,
            height: target.h,
            borderColor: colors.primary,
          },
        ]}
      />

      <View style={[styles.card, { top: cardTop, backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
            <Feather name={current.icon} size={17} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="eyebrow" color={colors.faint}>
              Passo {step + 1} de {steps.length}
            </AppText>
            <AppText variant="subtitle" style={{ marginTop: 2 }}>
              {current.title}
            </AppText>
          </View>
          <Mascot mood={step === 0 ? "happy" : step === 1 ? "thinking" : "idle"} size={52} />
        </View>

        <AppText variant="small" color={colors.muted} style={{ marginTop: 8 }}>
          {current.body}
        </AppText>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: index === step ? 20 : 7,
                    backgroundColor: index <= step ? colors.primary : colors.surface3,
                  },
                ]}
              />
            ))}
          </View>
          <Pressable onPress={onDone} hitSlop={8}>
            <AppText variant="caption" color={colors.faint}>
              Pular
            </AppText>
          </Pressable>
        </View>

        <PrimaryButton
          label={step === steps.length - 1 ? "Começar a aprender" : "Próximo"}
          onPress={() => (step === steps.length - 1 ? onDone() : setStep((value) => value + 1))}
          style={{ marginTop: 12 }}
        />
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
  },
  shade: {
    position: "absolute",
    backgroundColor: "rgba(9,7,18,0.78)",
  },
  ring: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 2,
  },
  card: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
