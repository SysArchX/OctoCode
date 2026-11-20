import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Mascot from "@/components/Mascot";
import { AppText, PressableScale, Screen, Surface } from "@/components/ui";
import { errorFeedback, tapFeedback } from "@/lib/haptics";
import { getTrack } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { OFF_TOPIC_REPLY, askTutor, isOnTopic, type TutorSource } from "@/lib/tutor";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
  sources?: TutorSource[];
  blocked?: boolean;
}

const suggestions = [
  "O que é uma variável em Python?",
  "Como funcionam permissões no Linux?",
  "Diferença entre nmap -sS e -sV",
];

const GREETING = "Qual é a sua dúvida sobre a aula ou sobre o código?";

export default function TutorScreen() {
  const { colors, ui } = useTheme();
  const insets = useSafeAreaInsets();
  const { state } = useProgress();
  const track = getTrack(state.track);
  const scrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "hello",
      role: "tutor",
      text: GREETING,
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  const send = async (question: string) => {
    const text = question.trim();
    if (!text || loading) return;
    tapFeedback();
    setInput("");
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((current) => [...current, userMessage]);

    if (!isOnTopic(text)) {
      errorFeedback();
      setMessages((current) => [
        ...current,
        {
          id: `t-${Date.now()}`,
          role: "tutor",
          text: OFF_TOPIC_REPLY,
          blocked: true,
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const reply = await askTutor(
        text,
        `Trilha atual: ${track.name}. Lições concluídas: ${state.completed.length}.`,
      );
      setMessages((current) => [
        ...current,
        {
          id: `t-${Date.now()}`,
          role: "tutor",
          text: reply.answer || "Não consegui montar uma resposta agora. Tente reformular a pergunta.",
          sources: reply.sources,
        },
      ]);
    } catch (error) {
      errorFeedback();
      setMessages((current) => [
        ...current,
        {
          id: `t-${Date.now()}`,
          role: "tutor",
          text: "Não consegui falar com o OctoAI agora. Verifique a conexão e tente de novo em instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bottomInset={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar o chat"
          hitSlop={10}
          onPress={() => {
            tapFeedback();
            router.back();
          }}
          style={[styles.closeButton, { backgroundColor: colors.surfaceAlt }]}
        >
          <Feather name="x" size={17} color={colors.muted} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Mascot mood="thinking" size={30} animated={false} />
          <View>
            <AppText variant="subtitle">OctoAI</AppText>
            <AppText variant="caption" color={colors.faint}>
              {track.name} · responde com fontes
            </AppText>
          </View>
        </View>
        <View style={styles.closeButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) =>
            message.role === "user" ? (
              <View
                key={message.id}
                style={[styles.userBubble, { backgroundColor: colors.primary }]}
              >
                <AppText style={{ color: colors.primaryInk, fontSize: 13.5, lineHeight: 20 }}>
                  {message.text}
                </AppText>
              </View>
            ) : (
              <Surface key={message.id} padding={14}>
                <View style={styles.tutorHeader}>
                  <View
                    style={[
                      styles.tutorAvatar,
                      { backgroundColor: message.blocked ? colors.dangerSoft : colors.primarySoft },
                    ]}
                  >
                    <Feather
                      name={message.blocked ? "slash" : "cpu"}
                      size={13}
                      color={message.blocked ? colors.danger : colors.primary}
                    />
                  </View>
                  <AppText variant="caption" color={colors.faint}>
                    OctoAI
                  </AppText>
                </View>
                <AppText
                  variant="small"
                  color={message.blocked ? colors.danger : colors.ink}
                  style={{ marginTop: 8 }}
                >
                  {message.text}
                </AppText>
                {message.sources && message.sources.length > 0 ? (
                  <View style={styles.sources}>
                    <AppText variant="caption" color={colors.faint}>
                      Fontes consultadas
                    </AppText>
                    {message.sources.slice(0, 3).map((source) => (
                      <View key={source.url} style={styles.sourceRow}>
                        <Feather name="link" size={11} color={colors.primary} />
                        <AppText variant="caption" color={colors.primary} numberOfLines={1} style={{ flex: 1 }}>
                          {source.title || source.url}
                        </AppText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Surface>
            ),
          )}

          {loading ? (
            <Surface padding={14}>
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="small" color={colors.muted}>
                  Procurando a melhor explicação…
                </AppText>
              </View>
            </Surface>
          ) : null}

          {messages.length === 1 ? (
            <View style={styles.suggestions}>
              {suggestions.map((suggestion) => (
                <PressableScale key={suggestion} onPress={() => send(suggestion)}>
                  <View
                    style={[
                      styles.suggestion,
                      { backgroundColor: colors.surfaceAlt, borderColor: colors.line },
                    ]}
                  >
                    <Feather name="corner-down-right" size={12} color={colors.primary} />
                    <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
                      {suggestion}
                    </AppText>
                  </View>
                </PressableScale>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              paddingBottom: insets.bottom + 12,
              backgroundColor: colors.bg,
              borderTopColor: colors.line,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.surface, borderColor: colors.line },
              ui === "glass" ? { borderColor: colors.glassBorder } : null,
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte sobre código, Linux ou segurança"
              placeholderTextColor={colors.faint}
              style={[styles.input, { color: colors.ink }]}
              multiline
              onSubmitEditing={() => send(input)}
              blurOnSubmit={false}
            />
            <Pressable
              accessibilityLabel="Enviar pergunta"
              onPress={() => send(input)}
              disabled={!input.trim() || loading}
              style={[
                styles.send,
                {
                  backgroundColor: input.trim() ? colors.primary : colors.surfaceAlt,
                  opacity: loading ? 0.5 : 1,
                },
              ]}
            >
              <Feather
                name="arrow-up"
                size={16}
                color={input.trim() ? colors.primaryInk : colors.faint}
              />
            </Pressable>
          </View>
          <AppText variant="caption" color={colors.faint} style={{ marginTop: 7, textAlign: "center" }}>
            Código, Linux e segurança · respostas com fontes reais
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "86%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 6,
  },
  tutorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  tutorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sources: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(140,133,161,0.16)",
    gap: 5,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  suggestions: {
    gap: 8,
    marginTop: 4,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 6,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 40,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    paddingTop: 10,
    paddingBottom: 10,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
