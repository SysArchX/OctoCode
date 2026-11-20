import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Mascot from "@/components/Mascot";
import { AppText, PrimaryButton, ProgressBar, PressableScale } from "@/components/ui";
import { findLesson, findUnitOfLesson, getTrack, type Exercise } from "@/data/curriculum";
import { errorFeedback, successFeedback, tapFeedback } from "@/lib/haptics";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

const tagByTrack: Record<string, string> = {
  python: "#Python",
  javascript: "#JS",
  linux: "#Linux",
  hacking: "#Hacking",
};

function shuffleIndices(length: number, seed: string) {
  let state = 7;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) % 2147483647;
  const values = Array.from({ length }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const swap = state % (index + 1);
    [values[index], values[swap]] = [values[swap], values[index]];
  }
  if (values.every((value, index) => value === index)) values.push(values.shift() ?? 0);
  return values;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").replace(/["']/g, "").trim();
}

function CodeBlock({ code }: { code: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.codeBlock, { backgroundColor: colors.surfaceAlt, borderColor: colors.line }]}>
      <AppText variant="code" style={{ fontSize: 12 }}>
        {code}
      </AppText>
    </View>
  );
}

function RichText({ text, color }: { text: string; color: string }) {
  const { colors } = useTheme();
  const parts = text.split("`");
  return (
    <AppText variant="small" color={color} style={styles.richText}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <AppText
            key={`${part}-${index}`}
            variant="code"
            color={colors.primary}
            style={{ fontSize: 11.5 }}
          >
            {part}
          </AppText>
        ) : (
          part
        ),
      )}
    </AppText>
  );
}

export default function LessonScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const lessonId = Array.isArray(params.id) ? params.id[0] : params.id;
  const lesson = findLesson(lessonId ?? "");
  const unit = findUnitOfLesson(lessonId ?? "");
  const track = getTrack(unit?.track ?? "python");
  const { colors, ui } = useTheme();
  const { state, loseHeart, refillHearts, completeLesson, addNote } = useProgress();


  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [blankValue, setBlankValue] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [bug, setBug] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [heartsGone, setHeartsGone] = useState(false);
  const completedRef = useRef(false);

  const exercise: Exercise | null = lesson && step > 0 ? lesson.exercises[step - 1] : null;
  const shuffled = useMemo(
    () => (exercise?.type === "order" ? shuffleIndices(exercise.lines.length, exercise.id) : []),
    [exercise],
  );
  const totalExercises = lesson?.exercises.length ?? 1;
  const progressPercent =
    step === 0 ? 4 : Math.round(((step - 1 + (checked ? 1 : 0.35)) / totalExercises) * 100);

  // Every lesson starts with the full five hearts; they only exist here.
  useEffect(() => {
    refillHearts();
  }, [refillHearts]);

  useEffect(() => {
    if (!heartsGone) return;
    const timer = setTimeout(() => {
      refillHearts();
      router.replace("/");
    }, 2200);
    return () => clearTimeout(timer);
  }, [heartsGone, refillHearts]);

  useEffect(() => {
    if (!finished || !lesson || completedRef.current) return;
    completedRef.current = true;
    completeLesson(lesson.id, 10, 5);
    const points = lesson.theory.points.map((point) => `- ${point.replace(/`/g, "")}`).join("\n");
    const code = lesson.theory.code ? `\n\nCódigo de referência:\n\`\`\`\n${lesson.theory.code}\n\`\`\`` : "";
    addNote({
      title: `Resumo — ${lesson.title}`,
      body: `${lesson.theory.title}\n\n${lesson.theory.intro}\n\nO que aprendi:\n${points}${code}`,
      tags: [unit?.index === 1 ? "#Lógica" : tagByTrack[track.id] ?? "#Lógica"],
    });
  }, [finished, lesson, completeLesson, addNote, track.id, unit?.index]);

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Mascot mood="sad" size={96} />
        <AppText variant="subtitle" style={{ marginTop: 12 }}>
          Lição não encontrada
        </AppText>
        <Pressable onPress={() => router.replace("/learn")} style={{ marginTop: 16 }}>
          <AppText color={colors.primary} style={{ fontFamily: fonts.semibold }}>
            Voltar para a trilha
          </AppText>
        </Pressable>
      </View>
    );
  }

  const resetAnswer = () => {
    setChecked(false);
    setCorrect(false);
    setChoice(null);
    setBlankValue("");
    setPicked([]);
    setBug(null);
  };

  const ready =
    exercise === null
      ? false
      : exercise.type === "choice"
        ? choice !== null
        : exercise.type === "blank"
          ? blankValue.trim().length > 0
          : exercise.type === "order"
            ? picked.length === exercise.lines.length
            : bug !== null;

  const verify = () => {
    if (!exercise || !ready || checked) return;
    let isCorrect = false;
    if (exercise.type === "choice") isCorrect = choice === exercise.answer;
    else if (exercise.type === "blank")
      isCorrect = exercise.accepts.some((accepted) => normalize(accepted) === normalize(blankValue));
    else if (exercise.type === "order")
      isCorrect = picked.length === exercise.lines.length && picked.every((line, index) => line === index);
    else if (exercise.type === "bug") isCorrect = bug === exercise.buggy;

    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) successFeedback();
    else {
      errorFeedback();
      loseHeart();
      if (state.hearts <= 1) setHeartsGone(true);
    }
  };

  const advance = () => {
    tapFeedback();
    if (step >= lesson.exercises.length) {
      setFinished(true);
      return;
    }
    setStep((current) => current + 1);
    resetAnswer();
  };

  /** Losing all hearts ends the session: the student goes home and may start
   *  that same lesson again from the very beginning, as many times as needed. */
  const leaveLesson = () => {
    refillHearts();
    setHeartsGone(false);
    setStep(0);
    setFinished(false);
    resetAnswer();
    router.replace("/");
  };

  if (finished) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.doneWrapper} edges={["top", "bottom"]}>
          <Mascot mood="happy" size={140} />
          <AppText variant="eyebrow" color={colors.faint} style={{ marginTop: 10 }}>
            Lição concluída
          </AppText>
          <AppText variant="hero" style={{ textAlign: "center", marginTop: 6 }}>
            {lesson.title}
          </AppText>
          <AppText variant="small" color={colors.muted} style={{ textAlign: "center", marginTop: 8 }}>
            {lesson.theory.title}. Seu resumo já está no diário de bordo.
          </AppText>

          <View style={styles.doneStats}>
            <View style={[styles.doneStat, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              <Feather name="star" size={15} color={colors.primary} />
              <AppText style={{ fontFamily: fonts.bold, fontSize: 14 }}>+10 XP</AppText>
            </View>
            <View style={[styles.doneStat, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              <Feather name="hexagon" size={15} color={colors.gem} />
              <AppText style={{ fontFamily: fonts.bold, fontSize: 14 }}>+5 gemas</AppText>
            </View>
            <View style={[styles.doneStat, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              <Feather name="zap" size={15} color={colors.streak} />
              <AppText style={{ fontFamily: fonts.bold, fontSize: 14 }}>{state.streak} dias</AppText>
            </View>
          </View>

          <View style={{ width: "100%", gap: 10, marginTop: 28 }}>
            <PrimaryButton label="Voltar para a trilha" onPress={() => router.replace("/learn")} />
            <PrimaryButton
              label="Abrir diário"
              variant="soft"
              onPress={() => router.replace("/journal")}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Sair da lição"
            onPress={() => router.replace("/learn")}
            style={styles.closeButton}
            hitSlop={6}
          >
            <Feather name="x" size={20} color={colors.muted} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ProgressBar percent={progressPercent} height={8} />
          </View>
          <View style={[styles.heartsChip, { backgroundColor: colors.surfaceAlt }]}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Feather
                key={index}
                name="heart"
                size={12}
                color={index < state.hearts ? colors.heart : colors.faint}
                style={{ opacity: index < state.hearts ? 1 : 0.3 }}
              />
            ))}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.body}
        >
          {step === 0 ? (
            <>
              <View style={styles.introBlock}>
                <AppText variant="eyebrow" color={colors.faint}>
                  {track.name} · Unidade {unit?.index}
                </AppText>
                <AppText variant="hero" style={{ marginTop: 8 }}>
                  {lesson.theory.title}
                </AppText>
                <View style={styles.metaRow}>
                  <View style={styles.sourceChip}>
                    <Feather name="book" size={11} color={colors.primary} />
                    <AppText variant="caption" color={colors.primary} style={{ fontSize: 10 }}>
                      {lesson.source}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.faint}>
                    {lesson.minutes} min · {lesson.exercises.length} exercícios
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.theoryCard,
                  {
                    backgroundColor: ui === "glass" ? colors.glassTint : colors.surface,
                    borderColor: ui === "glass" ? colors.glassBorder : colors.line,
                  },
                ]}
              >
                <RichText text={lesson.theory.intro} color={colors.ink} />

                <View style={{ gap: 10, marginTop: 16 }}>
                  {lesson.theory.points.map((point) => (
                    <View key={point} style={styles.pointRow}>
                      <View style={[styles.bullet, { backgroundColor: colors.primarySoft }]}>
                        <Feather name="check" size={9} color={colors.primary} />
                      </View>
                      <RichText text={point} color={colors.muted} />
                    </View>
                  ))}
                </View>

                {lesson.theory.code ? <CodeBlock code={lesson.theory.code} /> : null}

                {lesson.theory.tip ? (
                  <View style={[styles.tipCard, { backgroundColor: colors.primarySoft }]}>
                    <Feather name="zap" size={14} color={colors.primary} />
                    <AppText variant="caption" color={colors.primary} style={{ flex: 1 }}>
                      {lesson.theory.tip}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText variant="caption" color={colors.faint} style={{ textAlign: "center" }}>
                Fonte: {lesson.source} · resumo automático ao concluir
              </AppText>
            </>
          ) : (
            <>
              <View style={styles.exerciseHeader}>
                <AppText variant="eyebrow" color={colors.faint}>
                  Exercício {step} de {totalExercises} · {track.name}
                </AppText>
                <AppText variant="title" style={{ marginTop: 6, lineHeight: 25 }}>
                  {exercise?.prompt}
                </AppText>
              </View>

              {exercise?.type === "choice" && exercise.code ? <CodeBlock code={exercise.code} /> : null}

              {exercise?.type === "choice" ? (
                <View style={{ gap: 8 }}>
                  {exercise.options.map((option, index) => {
                    const selected = choice === index;
                    const showCorrect = checked && index === exercise.answer;
                    const showWrong = checked && selected && !correct;
                    return (
                      <Pressable
                        key={option}
                        disabled={checked}
                        onPress={() => {
                          tapFeedback();
                          setChoice(index);
                        }}
                        style={[
                          styles.option,
                          {
                            backgroundColor: showCorrect
                              ? colors.successSoft
                              : showWrong
                                ? colors.dangerSoft
                                : selected
                                  ? colors.primarySoft
                                  : colors.surface,
                            borderColor: showCorrect
                              ? colors.success
                              : showWrong
                                ? colors.danger
                                : selected
                                  ? colors.primary
                                  : colors.line,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.optionLetter,
                            {
                              backgroundColor: selected || showCorrect ? colors.primary : colors.surfaceAlt,
                              borderColor: colors.line,
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            style={{
                              fontFamily: fonts.bold,
                              color: selected || showCorrect ? colors.primaryInk : colors.muted,
                            }}
                          >
                            {String.fromCharCode(65 + index)}
                          </AppText>
                        </View>
                        <AppText
                          style={{ fontFamily: fonts.mono, fontSize: 12.5, flex: 1, lineHeight: 19 }}
                        >
                          {option}
                        </AppText>
                        {showCorrect ? (
                          <Feather name="check-circle" size={17} color={colors.success} />
                        ) : null}
                        {showWrong ? <Feather name="x-circle" size={17} color={colors.danger} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {exercise?.type === "blank" ? (
                <View>
                  <CodeBlock code={exercise.template.replace("__", "▁▁▁▁")} />
                  <TextInput
                    value={blankValue}
                    onChangeText={setBlankValue}
                    editable={!checked}
                    placeholder={exercise.placeholder ?? "sua resposta"}
                    placeholderTextColor={colors.faint}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    onSubmitEditing={verify}
                    style={[
                      styles.blankInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: checked
                          ? correct
                            ? colors.success
                            : colors.danger
                          : colors.line,
                        color: colors.ink,
                      },
                    ]}
                  />
                </View>
              ) : null}

              {exercise?.type === "order" ? (
                <View>
                  <View
                    style={[
                      styles.orderTarget,
                      { borderColor: colors.line, backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    {picked.length === 0 ? (
                      <AppText variant="caption" color={colors.faint} style={{ paddingVertical: 10 }}>
                        Toque nos blocos na ordem correta
                      </AppText>
                    ) : (
                      picked.map((lineIndex, position) => (
                        <Pressable
                          key={`${lineIndex}-${position}`}
                          disabled={checked}
                          onPress={() => setPicked((current) => current.filter((_, i) => i !== position))}
                          style={[
                            styles.orderBlock,
                            { backgroundColor: colors.surface, borderColor: colors.line },
                          ]}
                        >
                          <AppText variant="caption" color={colors.faint} style={{ width: 14 }}>
                            {position + 1}
                          </AppText>
                          <AppText variant="code" style={{ flex: 1, fontSize: 11 }}>
                            {exercise.lines[lineIndex]}
                          </AppText>
                        </Pressable>
                      ))
                    )}
                  </View>

                  <View style={{ gap: 7, marginTop: 10 }}>
                    {shuffled.map((lineIndex) => {
                      const used = picked.includes(lineIndex);
                      return (
                        <Pressable
                          key={lineIndex}
                          disabled={used || checked}
                          onPress={() => setPicked((current) => [...current, lineIndex])}
                          style={[
                            styles.orderBlock,
                            {
                              backgroundColor: used ? colors.surfaceAlt : colors.surface,
                              borderColor: colors.line,
                              opacity: used ? 0.4 : 1,
                            },
                          ]}
                        >
                          <Feather name="menu" size={13} color={colors.faint} />
                          <AppText variant="code" style={{ flex: 1, fontSize: 11.5 }}>
                            {exercise.lines[lineIndex]}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {exercise?.type === "bug" ? (
                <View
                  style={[
                    styles.bugList,
                    { backgroundColor: colors.surface, borderColor: colors.line },
                  ]}
                >
                  {exercise.lines.map((line, index) => {
                    const selected = bug === index;
                    const reveal = checked && index === exercise.buggy;
                    const wrong = checked && selected && !correct;
                    return (
                      <Pressable
                        key={`${line}-${index}`}
                        disabled={checked}
                        onPress={() => {
                          tapFeedback();
                          setBug(index);
                        }}
                        style={[
                          styles.bugLine,
                          {
                            backgroundColor: reveal
                              ? colors.successSoft
                              : wrong
                                ? colors.dangerSoft
                                : selected
                                  ? colors.primarySoft
                                  : "transparent",
                            borderLeftColor: reveal
                              ? colors.success
                              : wrong
                                ? colors.danger
                                : selected
                                  ? colors.primary
                                  : "transparent",
                          },
                        ]}
                      >
                        <AppText variant="caption" color={colors.faint} style={{ width: 14 }}>
                          {index + 1}
                        </AppText>
                        <AppText variant="code" style={{ flex: 1, fontSize: 11.5 }}>
                          {line}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {checked ? (
                <View
                  style={[
                    styles.feedback,
                    {
                      backgroundColor: correct ? colors.successSoft : colors.dangerSoft,
                    },
                  ]}
                >
                  <Mascot mood={correct ? "happy" : "sad"} size={44} animated={false} />
                  <View style={{ flex: 1 }}>
                    <AppText
                      style={{
                        fontFamily: fonts.bold,
                        fontSize: 13,
                        color: correct ? colors.success : colors.danger,
                      }}
                    >
                      {correct ? "Boa! Exatamente isso." : "Quase. Vamos entender."}
                    </AppText>
                    <AppText variant="small" color={colors.ink} style={{ marginTop: 2 }}>
                      {exercise?.explain}
                    </AppText>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.bg,
              borderTopColor: colors.line,
            },
          ]}
        >
          {step === 0 ? (
            <PrimaryButton
              label="Entendi, quero praticar"
              onPress={() => {
                setStep(1);
                resetAnswer();
              }}
              icon={<Feather name="arrow-right" size={16} color={colors.primaryInk} />}
            />
          ) : !checked ? (
            <PrimaryButton label="Verificar" onPress={verify} disabled={!ready} />
          ) : (
            <PrimaryButton
              label={step >= totalExercises ? "Concluir lição" : "Continuar"}
              onPress={advance}
              icon={<Feather name="arrow-right" size={16} color={colors.primaryInk} />}
            />
          )}
        </View>
      </SafeAreaView>

      <Modal visible={heartsGone} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.gameOverCard, { backgroundColor: colors.surface }]}>
            <Mascot mood="sad" size={96} />
            <AppText variant="title" style={{ marginTop: 6 }}>
              Seus corações acabaram
            </AppText>
            <AppText variant="small" color={colors.muted} style={{ textAlign: "center", marginTop: 6 }}>
              Errar faz parte. Você volta para o início com 5 corações e pode entrar nesta lição
              quantas vezes quiser — ela recomeça do zero, sem espera e sem punição.
            </AppText>
            <View style={{ width: "100%", gap: 9, marginTop: 18 }}>
              <PrimaryButton label="Voltar ao início" onPress={leaveLesson} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  heartsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  introBlock: {
    paddingTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: "rgba(91,33,182,0.10)",
  },
  theoryCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#5B21B6",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  bullet: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  richText: {
    flex: 1,
    lineHeight: 20,
  },
  codeBlock: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
    marginTop: 14,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: radii.md,
    padding: 11,
    marginTop: 12,
  },
  exerciseHeader: {
    paddingTop: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    padding: 13,
  },
  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  blankInput: {
    marginTop: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  orderTarget: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 8,
    minHeight: 74,
    gap: 6,
  },
  orderBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  bugList: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 6,
    gap: 2,
  },
  bugLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.lg,
    padding: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 1,
  },
  doneWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  doneStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
  },
  doneStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,6,20,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  gameOverCard: {
    width: "100%",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
  },
});
