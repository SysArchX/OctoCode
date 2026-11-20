import { Feather } from "@expo/vector-icons";
import { useRef, useState, type ComponentRef } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageHeader from "@/components/PageHeader";
import { AppText, Screen } from "@/components/ui";
import { tapFeedback } from "@/lib/haptics";
import { initialShell, runCommand, type Line } from "@/lib/octocore";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts } from "@/theme/tokens";

const TERM = {
  bg: "#0B0B12",
  panel: "#12111A",
  ink: "#E9E5F5",
  muted: "#8E88A5",
  accent: "#C4B5FD",
  success: "#4ADE80",
  danger: "#FB7185",
};

function toneColor(tone: Line["tone"]) {
  if (tone === "art") return TERM.accent;
  if (tone === "accent") return TERM.accent;
  if (tone === "muted") return TERM.muted;
  if (tone === "success") return TERM.success;
  if (tone === "danger") return TERM.danger;
  return TERM.ink;
}

export default function TerminalScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const [shell, setShell] = useState(initialShell);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { text: "OctoCoreOS 1.0 · octosh", tone: "accent" },
    { text: "Digite help ou octofetch para começar.", tone: "muted" },
  ]);
  const [history, setHistory] = useState<string[]>([]);

  const prompt = `${shell.sudo ? "root" : shell.user}@octocore:${shell.cwd}$`;

  const execute = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    tapFeedback();
    setHistory((current) => [...current, command]);
    const header: Line = { text: `${prompt} ${command}`, tone: "muted" };
    const result = runCommand(command, shell);
    setShell(result.state);
    setInput("");
    setLines((current) =>
      result.clear ? [] : [...current, header, ...result.lines],
    );
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const goHistory = () => {
    if (history.length === 0) return;
    setInput(history[history.length - 1]);
  };

  return (
    <Screen bottomInset={false}>
      <PageHeader
        title="Terminal"
        eyebrow="OctoCoreOS · offline"
        right={
          <Pressable
            accessibilityLabel="Histórico"
            onPress={goHistory}
            style={[styles.historyButton, { backgroundColor: colors.surfaceAlt }]}
          >
            <Feather name="rotate-ccw" size={14} color={colors.muted} />
          </Pressable>
        }
      />

      <View style={styles.wrap}>
        <View style={styles.terminal}>
          <View style={styles.titleBar}>
            <View style={styles.dot} />
            <View style={[styles.dot, { backgroundColor: "#FBBF24" }]} />
            <View style={[styles.dot, { backgroundColor: "#34D399" }]} />
            <AppText style={styles.titleText}>octo@octocore — octosh</AppText>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.lines}
            keyboardShouldPersistTaps="handled"
          >
            {lines.map((line, index) => (
              <AppText
                key={`${index}-${line.text}`}
                style={[
                  styles.line,
                  line.tone === "art" ? styles.artLine : null,
                  { color: toneColor(line.tone) },
                ]}
              >
                {line.text || " "}
              </AppText>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <AppText style={[styles.prompt, { color: TERM.accent }]} numberOfLines={1}>
              {prompt}
            </AppText>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => execute(input)}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              blurOnSubmit={false}
              placeholder="digite um comando"
              placeholderTextColor={TERM.muted}
              style={[styles.input, { color: TERM.ink }]}
              accessibilityLabel="Comando do terminal"
            />
            <Pressable onPress={() => execute(input)} accessibilityLabel="Executar comando">
              <Feather name="corner-down-left" size={16} color={TERM.accent} />
            </Pressable>
          </View>
        </View>

        <View style={styles.quickRow}>
          {["octofetch", "ls", "whoami", "help"].map((command) => (
            <Pressable
              key={command}
              onPress={() => execute(command)}
              style={[styles.quick, { backgroundColor: colors.surfaceAlt, borderColor: colors.line }]}
            >
              <AppText variant="caption" color={colors.muted} style={{ fontFamily: fonts.mono }}>
                {command}
              </AppText>
            </Pressable>
          ))}
        </View>

        <AppText variant="caption" color={colors.faint} style={{ textAlign: "center", marginTop: 6 }}>
          Toque nos atalhos ou digite livremente · ambiente de prática offline
        </AppText>
        <View style={{ height: insets.bottom + 16 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  terminal: {
    flex: 1,
    backgroundColor: TERM.bg,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196,181,253,0.16)",
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: TERM.panel,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,181,253,0.12)",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FB7185",
  },
  titleText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: TERM.muted,
    marginLeft: 8,
  },
  lines: {
    padding: 14,
    gap: 2,
  },
  line: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    lineHeight: 17,
  },
  artLine: {
    fontSize: 10,
    lineHeight: 10.6,
    letterSpacing: 0,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(196,181,253,0.12)",
    backgroundColor: TERM.panel,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    maxWidth: "46%",
  },
  input: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 12,
    paddingVertical: 2,
  },
  historyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  quickRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  quick: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
});
