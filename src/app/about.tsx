import { Feather } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import LogoIcon from "@/components/LogoIcon";
import Mascot from "@/components/Mascot";
import PageHeader from "@/components/PageHeader";
import { AppText, Screen, Surface } from "@/components/ui";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

const sources = [
  "Python.org · documentação oficial",
  "MDN Web Docs · JavaScript e CSS",
  "ISO C++ / cppreference",
  "Rust Book · doc.rust-lang.org",
  "Linux Man Pages",
  "OWASP Top 10",
  "CS50 · Harvard",
];

export default function AboutScreen() {
  const { colors, ui, mode } = useTheme();

  return (
    <Screen scroll>
      <PageHeader title="Sobre" eyebrow="OctoCode 1.0" />

      <View style={styles.content}>
        <Surface padding={20}>
          <View style={styles.brandRow}>
            <LogoIcon size={40} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="hero">OctoCode</AppText>
              <AppText variant="small" color={colors.muted}>
                aprender fazendo, do zero à primeira aplicação
              </AppText>
            </View>
            <Mascot mood="idle" size={58} />
          </View>
          <View style={styles.chips}>
            <View style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
              <AppText variant="caption" color={colors.primary}>
                {ui === "material" ? "Material You" : "Liquid Glass"}
              </AppText>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
              <AppText variant="caption" color={colors.muted}>
                {mode === "dark" ? "Escuro" : "Claro"}
              </AppText>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
              <AppText variant="caption" color={colors.muted}>
                Expo SDK 58 · nativo
              </AppText>
            </View>
          </View>
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Como o app funciona
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            Lógica com Portugol abre a jornada, com visualizador de memória, e faz a ponte para a
            linguagem escolhida. Cada trilha tem quatro módulos: fundamentos, estruturas de dados,
            avançado e projeto final guiado. As lições alternam micro-leitura, montagem, previsão de
            saída, caça ao bug e laboratório no terminal.
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            Nada de colar código durante avaliações: as variáveis e alternativas são randomizadas e o
            editor bloqueia colagem. Sair do app no meio da lição encerra a sessão depois dos dois
            primeiros avisos.
          </AppText>
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Fontes oficiais
          </AppText>
          <View style={{ marginTop: 8, gap: 7 }}>
            {sources.map((source) => (
              <View key={source} style={styles.sourceRow}>
                <Feather name="check-circle" size={12} color={colors.primary} />
                <AppText variant="caption" color={colors.muted}>
                  {source}
                </AppText>
              </View>
            ))}
          </View>
        </Surface>

        <Surface padding={16}>
          <AppText variant="eyebrow" color={colors.faint}>
            Privacidade
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            Progresso, notas e preferências ficam no seu dispositivo. O OctoAI só recebe a pergunta
            quando ela é sobre programação, Linux ou segurança, e responde com fontes reais sem
            entregar respostas prontas.
          </AppText>
        </Surface>

        <View style={styles.footer}>
          <Feather name="feather" size={12} color={colors.faint} />
          <AppText variant="caption" color={colors.faint}>
            feito para aprender de verdade · SysArchX
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
});
