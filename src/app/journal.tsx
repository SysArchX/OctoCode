import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Hud from "@/components/Hud";
import Mascot from "@/components/Mascot";
import { AppText, PrimaryButton, PressableScale, Screen, Surface } from "@/components/ui";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

const allTags = ["#Lógica", "#Python", "#JS", "#Linux", "#Hacking"];

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function JournalScreen() {
  const { colors } = useTheme();
  const { state, addNote, removeNote } = useProgress();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState(allTags[0]);
  const [filter, setFilter] = useState("Todos");
  const [composerOpen, setComposerOpen] = useState(true);

  const notes = useMemo(
    () => (filter === "Todos" ? state.notes : state.notes.filter((note) => note.tags.includes(filter))),
    [state.notes, filter],
  );

  const save = () => {
    if (!body.trim()) return;
    addNote({ title: title.trim() || "Anotação rápida", body: body.trim(), tags: [tag] });
    setTitle("");
    setBody("");
  };

  const exportMarkdown = async () => {
    if (state.notes.length === 0) {
      Alert.alert("Diário vazio", "Escreva sua primeira anotação antes de exportar.");
      return;
    }
    const markdown = [
      "# OctoCode — Diário de bordo",
      "",
      `Exportado em ${new Date().toLocaleDateString("pt-BR")}`,
      "",
      ...state.notes.map((note) =>
        [
          `## ${note.title}`,
          "",
          `${formatDate(note.createdAt)} · ${note.tags.join(" ")}`,
          "",
          note.body,
          "",
          "---",
          "",
        ].join("\n"),
      ),
    ].join("\n");

    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(markdown).catch(() => undefined);
        Alert.alert("Markdown copiado", "O diário completo está na sua área de transferência.");
      }
      return;
    }

    await Share.share({ message: markdown, title: "OctoCode — Diário de bordo" }).catch(() => undefined);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll bottomInset={false}>
        <Hud />

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <AppText variant="eyebrow" color={colors.faint}>
              Caderno de estudos
            </AppText>
            <AppText variant="hero" style={{ marginTop: 6 }}>
              Diário de bordo
            </AppText>
            <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
              {state.notes.length} {state.notes.length === 1 ? "anotação" : "anotações"} · snippets,
              resumos e dúvidas
            </AppText>
          </View>
          <Mascot mood="thinking" size={62} />
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Surface padding={16}>
            <View style={styles.composerHeader}>
              <AppText variant="subtitle">Nova anotação</AppText>
              <Pressable onPress={() => setComposerOpen((value) => !value)} hitSlop={8}>
                <Feather
                  name={composerOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {composerOpen ? (
              <View style={{ marginTop: 10, gap: 9 }}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Título (opcional)"
                  placeholderTextColor={colors.faint}
                  style={[
                    styles.input,
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.line, color: colors.ink },
                  ]}
                />
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="O que você aprendeu, com suas palavras?"
                  placeholderTextColor={colors.faint}
                  multiline
                  style={[
                    styles.textarea,
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.line, color: colors.ink },
                  ]}
                />
                <View style={styles.tagRow}>
                  {allTags.map((item) => {
                    const active = tag === item;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => setTag(item)}
                        style={[
                          styles.tagChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surfaceAlt,
                          },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          style={{
                            color: active ? colors.primaryInk : colors.muted,
                            fontFamily: fonts.semibold,
                          }}
                        >
                          {item}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
                <PrimaryButton label="Salvar anotação" onPress={save} disabled={!body.trim()} />
              </View>
            ) : null}
          </Surface>

          <View style={styles.filterRow}>
            {["Todos", ...allTags].map((item) => {
              const active = filter === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? colors.primarySoft : "transparent",
                      borderColor: active ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={active ? colors.primary : colors.muted}
                    style={{ fontFamily: active ? fonts.semibold : fonts.medium }}
                  >
                    {item}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {notes.length === 0 ? (
            <View style={[styles.empty, { borderColor: colors.line }]}>
              <Feather name="book-open" size={22} color={colors.faint} />
              <AppText variant="small" color={colors.muted} style={{ textAlign: "center" }}>
                Nenhuma anotação ainda. Ao concluir uma lição, o resumo aparece aqui automaticamente.
              </AppText>
            </View>
          ) : (
            notes.map((note) => (
              <Surface key={note.id} padding={16}>
                <View style={styles.noteHeader}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle">{note.title}</AppText>
                    <AppText variant="caption" color={colors.faint} style={{ marginTop: 2 }}>
                      {formatDate(note.createdAt)}
                    </AppText>
                  </View>
                  {note.tags.map((item) => (
                    <View
                      key={item}
                      style={[styles.noteTag, { backgroundColor: colors.primarySoft }]}
                    >
                      <AppText variant="caption" color={colors.primary} style={{ fontSize: 10 }}>
                        {item}
                      </AppText>
                    </View>
                  ))}
                  <Pressable
                    accessibilityLabel={`Excluir ${note.title}`}
                    onPress={() => removeNote(note.id)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    <Feather name="trash-2" size={15} color={colors.faint} />
                  </Pressable>
                </View>
                <AppText variant="small" color={colors.muted} style={styles.noteBody}>
                  {note.body}
                </AppText>
              </Surface>
            ))
          )}

          <PressableScale onPress={exportMarkdown}>
            <View style={[styles.exportCard, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="download" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontFamily: fonts.semibold }}>
                  Exportar diário em Markdown
                </AppText>
                <AppText variant="caption" color={colors.faint}>
                  Leve suas notas para Obsidian, Notion ou GitHub
                </AppText>
              </View>
              <Feather name="share-2" size={15} color={colors.muted} />
            </View>
          </PressableScale>
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
  composerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  textarea: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    minHeight: 88,
    textAlignVertical: "top",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  filterChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.lg,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noteTag: {
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  noteBody: {
    marginTop: 10,
    lineHeight: 20,
  },
  exportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.lg,
    padding: 14,
  },
});
