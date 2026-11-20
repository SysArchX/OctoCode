import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoIcon from "@/components/LogoIcon";
import Mascot from "@/components/Mascot";
import { AppText, PrimaryButton, PressableScale, ProgressBar, Screen, Surface } from "@/components/ui";
import { tracks, type TrackId } from "@/data/curriculum";
import { successFeedback, tapFeedback } from "@/lib/haptics";
import { useProgress, type Level } from "@/lib/progress";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii } from "@/theme/tokens";

type Step = "track" | "level" | "placement" | "goal";

interface PlacementQuestion {
  id: string;
  label: string;
  weight: number;
  xp: number;
  type: "choice" | "blank";
  prompt: string;
  hint: string;
  options?: string[];
  answer?: number;
  accepts?: string[];
  placeholder?: string;
  explain: string;
}

/** Q1 very easy → Q5 advanced, with growing weight and growing XP reward. */
const placementQuestions: PlacementQuestion[] = [
  {
    id: "p1",
    label: "Muito fácil",
    weight: 1,
    xp: 10,
    type: "choice",
    prompt: "Qual símbolo guarda um valor dentro de uma variável?",
    hint: "é o mesmo sinal que usamos para dizer “recebe”",
    options: ["=", "==", "+", "#"],
    answer: 0,
    explain: "= guarda o valor. == serve para comparar dois valores.",
  },
  {
    id: "p2",
    label: "Fácil",
    weight: 1.5,
    xp: 15,
    type: "blank",
    prompt: "Em Portugol, complete a atribuição que guarda 18 em idade:",
    hint: "o Portugol usa uma seta em vez do sinal de igual",
    accepts: ["<-"],
    placeholder: "operador",
    explain: "Em Portugol a atribuição é idade <- 18. Em Python seria idade = 18.",
  },
  {
    id: "p3",
    label: "Média",
    weight: 2,
    xp: 20,
    type: "choice",
    prompt: "Qual condição executa o bloco quando a nota é 7 ou mais?",
    hint: "inclui o próprio 7",
    options: ["nota > 7", "nota >= 7", "nota = 7", "nota <= 7"],
    answer: 1,
    explain: ">= significa maior ou igual, então aceita 7, 8 e 9.",
  },
  {
    id: "p4",
    label: "Difícil",
    weight: 2.5,
    xp: 30,
    type: "choice",
    prompt: "O que `for i in range(3): print(i)` imprime?",
    hint: "o fim do range é exclusivo",
    options: ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"],
    answer: 0,
    explain: "range(3) gera 0, 1 e 2 — o 3 fica de fora.",
  },
  {
    id: "p5",
    label: "Avançada",
    weight: 3,
    xp: 40,
    type: "blank",
    prompt: "Escreva a função Python dobro(n) que devolve n * 2:",
    hint: "def, parâmetro, return na mesma linha",
    accepts: ["def dobro(n): return n * 2", "def dobro(n):return n*2", "def dobro(n): return n*2"],
    placeholder: "def dobro(n): ...",
    explain: "def dobro(n): return n * 2 declara a função e devolve o dobro.",
  },
];

const placementMaxWeight = placementQuestions.reduce((total, question) => total + question.weight, 0);

const goals = [
  { minutes: 5, title: "Casual", detail: "5 min por dia, no intervalo" },
  { minutes: 10, title: "Regular", detail: "10 min por dia, constância real" },
  { minutes: 15, title: "Intenso", detail: "15 min por dia, evolução rápida" },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").replace(/["']/g, "").trim();
}

function levelFromPercent(percent: number): Level {
  if (percent >= 70) return "advanced";
  if (percent >= 40) return "intermediate";
  return "beginner";
}

const levelLabel: Record<Level, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setOnboarding, addXp } = useProgress();
  const [step, setStep] = useState<Step>("track");
  const [track, setTrack] = useState<TrackId>("python");
  const [level, setLevel] = useState<Level>("beginner");
  const [goal, setGoal] = useState(10);

  const [qIndex, setQIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [earned, setEarned] = useState(0);
  const [placementXp, setPlacementXp] = useState(0);
  const [placementDone, setPlacementDone] = useState(false);

  const selectedTrack = tracks.find((item) => item.id === track) ?? tracks[0];
  const question = placementQuestions[qIndex];
  const percent = Math.round((earned / placementMaxWeight) * 100);
  const liveLevel = levelFromPercent(percent);
  const stepIndex = step === "track" ? 0 : step === "level" ? 1 : 2;

  const finalLevel = useMemo(() => levelFromPercent((earned / placementMaxWeight) * 100), [earned]);

  const resetQuestion = () => {
    setChoice(null);
    setText("");
    setChecked(false);
    setCorrect(false);
  };

  const ready =
    question?.type === "choice" ? choice !== null : text.trim().length > 0 && Boolean(question);

  const verify = () => {
    if (!question || !ready || checked) return;
    const isCorrect =
      question.type === "choice"
        ? choice === question.answer
        : (question.accepts ?? []).some((accepted) => normalize(accepted) === normalize(text));
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      successFeedback();
      setEarned((current) => current + question.weight);
      setPlacementXp((current) => current + question.xp);
      addXp(question.xp);
    }
  };

  const nextQuestion = () => {
    tapFeedback();
    if (qIndex >= placementQuestions.length - 1) {
      setPlacementDone(true);
      if (earned / placementMaxWeight >= 0.4) successFeedback();
      return;
    }
    setQIndex((current) => current + 1);
    resetQuestion();
  };

  const finishPlacement = () => {
    setLevel(finalLevel === "advanced" ? "intermediate" : finalLevel);
    setStep("goal");
  };

  const finish = () => {
    setOnboarding({
      track,
      level,
      placementLevel: placementDone ? finalLevel : "beginner",
      placementPassed: placementDone ? finalLevel !== "beginner" : false,
      dailyGoal: goal,
    });
    router.replace("/");
  };

  const goBack = () => {
    if (step === "goal") setStep(placementDone ? "placement" : "level");
    else if (step === "placement") setStep("level");
    else if (step === "level") setStep("track");
    else return;
  };

  return (
    <Screen bottomInset={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.brandRow}>
            <LogoIcon size={26} />
            <AppText style={styles.brand}>OctoCode</AppText>
          </View>
          <View style={styles.dots}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: index === stepIndex ? 22 : 8,
                    backgroundColor: index <= stepIndex ? colors.primary : colors.surface3,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {step === "track" && (
            <Animated.View entering={FadeIn.duration(280)}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="eyebrow" color={colors.faint}>
                    Passo 1 de 3
                  </AppText>
                  <AppText variant="hero" style={{ marginTop: 8 }}>
                    Qual área você quer dominar?
                  </AppText>
                  <AppText variant="small" color={colors.muted} style={{ marginTop: 8 }}>
                    Você começa pela lógica — com Portugol e Python. A cor do app passa a ser a cor da
                    sua linguagem.
                  </AppText>
                </View>
                <Mascot mood="idle" size={64} />
              </View>

              <View style={styles.grid}>
                {tracks.map((item) => {
                  const active = item.id === track;
                  return (
                    <PressableScale
                      key={item.id}
                      onPress={() => {
                        tapFeedback();
                        setTrack(item.id);
                      }}
                      style={styles.gridItem}
                      accessibilityLabel={`Trilha ${item.name}`}
                    >
                      <View
                        style={[
                          styles.trackCard,
                          {
                            backgroundColor: active ? item.soft : colors.surface,
                            borderColor: active ? item.color : colors.line,
                            borderWidth: active ? 2 : 1,
                          },
                        ]}
                      >
                        {active ? (
                          <View style={[styles.check, { backgroundColor: item.color }]}>
                            <Feather name="check" size={11} color="#FFFFFF" />
                          </View>
                        ) : null}
                        <View style={[styles.trackIconBox, { backgroundColor: item.soft }]}>
                          <Feather name={item.icon} size={19} color={item.color} />
                        </View>
                        <AppText style={styles.trackName}>{item.name}</AppText>
                        <AppText variant="caption" color={colors.muted} numberOfLines={2}>
                          {item.tagline}
                        </AppText>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>

              <View style={[styles.howCard, { backgroundColor: colors.surfaceAlt }]}>
                <AppText variant="eyebrow" color={colors.faint}>
                  Como funciona
                </AppText>
                <View style={styles.howRow}>
                  {[
                    { n: "01", t: "Lógica", d: "Portugol e Python" },
                    { n: "02", t: "Prática", d: "Código e terminal" },
                    { n: "03", t: "Projeto", d: "Ferramenta real" },
                  ].map((item, index) => (
                    <View key={item.n} style={styles.howItem}>
                      <View style={styles.howTop}>
                        <AppText
                          variant="caption"
                          color={colors.accentInk}
                          style={{ fontFamily: fonts.bold, fontSize: 10.5 }}
                        >
                          {item.n}
                        </AppText>
                        {index < 2 ? <View style={[styles.howLine, { backgroundColor: colors.line }]} /> : null}
                      </View>
                      <AppText variant="caption" style={{ fontFamily: fonts.semibold, fontSize: 11.5 }}>
                        {item.t}
                      </AppText>
                      <AppText variant="caption" color={colors.muted} style={{ fontSize: 10 }}>
                        {item.d}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {step === "level" && (
            <Animated.View entering={FadeIn.duration(280)}>
              <AppText variant="eyebrow" color={colors.faint}>
                Passo 2 de 3
              </AppText>
              <AppText variant="hero" style={{ marginTop: 8 }}>
                Qual é o seu ponto de partida?
              </AppText>
              <AppText variant="small" color={colors.muted} style={{ marginTop: 8 }}>
                O nivelamento existe para não te fazer perder tempo com o que você já sabe.
              </AppText>

              <View style={{ gap: 10, marginTop: 22 }}>
                <PressableScale
                  onPress={() => {
                    setLevel("beginner");
                    setStep("goal");
                  }}
                >
                  <Surface padding={16}>
                    <View style={styles.optionRow}>
                      <View style={[styles.optionIcon, { backgroundColor: colors.accentSoft }]}>
                        <Feather name="compass" size={20} color={colors.accentInk} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="subtitle">Sou iniciante</AppText>
                        <AppText variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                          Nunca programei. Começo pela Unidade 1, com Portugol e exercícios curtos.
                        </AppText>
                      </View>
                      <Feather name="arrow-right" size={16} color={colors.faint} />
                    </View>
                  </Surface>
                </PressableScale>

                <PressableScale
                  onPress={() => {
                    setLevel("intermediate");
                    setStep("placement");
                  }}
                >
                  <Surface padding={16}>
                    <View style={styles.optionRow}>
                      <View style={[styles.optionIcon, { backgroundColor: colors.surfaceAlt }]}>
                        <Feather name="activity" size={20} color={colors.ink} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="subtitle">Já tenho base</AppText>
                        <AppText variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                          5 questões, da muito fácil à avançada. Cada acerto vale XP na hora.
                        </AppText>
                      </View>
                      <Feather name="arrow-right" size={16} color={colors.faint} />
                    </View>
                  </Surface>
                </PressableScale>
              </View>

              <View style={[styles.hintCard, { backgroundColor: colors.surfaceAlt }]}>
                <Feather name="info" size={14} color={colors.accentInk} />
                <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
                  A Unidade 1 continua acessível mesmo se você for aprovado. Nada é bloqueado para sempre.
                </AppText>
              </View>
            </Animated.View>
          )}

          {step === "placement" && !placementDone && question && (
            <Animated.View entering={FadeIn.duration(240)}>
              <AppText variant="eyebrow" color={colors.faint}>
                Teste de nivelamento · {qIndex + 1} de {placementQuestions.length}
              </AppText>
              <AppText variant="hero" style={{ marginTop: 8 }}>
                {question.label}, mas sem chute.
              </AppText>

              <View style={[styles.levelCard, { backgroundColor: colors.surface }]}>
                <View style={styles.levelHeader}>
                  <AppText variant="caption" color={colors.faint}>
                    Seu nível agora
                  </AppText>
                  <AppText style={[styles.levelName, { color: colors.accentInk }]}>
                    {levelLabel[liveLevel]}
                  </AppText>
                </View>
                <ProgressBar percent={percent} height={8} />
                <View style={styles.levelScale}>
                  {(["beginner", "intermediate", "advanced"] as Level[]).map((item) => (
                    <AppText
                      key={item}
                      variant="caption"
                      color={liveLevel === item ? colors.accentInk : colors.faint}
                      style={liveLevel === item ? { fontFamily: fonts.bold } : undefined}
                    >
                      {levelLabel[item]}
                    </AppText>
                  ))}
                </View>
                <View style={styles.xpRow}>
                  <Feather name="star" size={12} color={colors.accentInk} />
                  <AppText variant="caption" color={colors.muted}>
                    +{placementXp} XP conquistados neste teste
                  </AppText>
                  <AppText variant="caption" color={colors.faint} style={{ marginLeft: "auto" }}>
                    peso {question.weight.toFixed(1)} · {question.xp} XP
                  </AppText>
                </View>
              </View>

              <Surface padding={16} style={{ marginTop: 12 }}>
                <AppText variant="small" style={{ fontFamily: fonts.medium }}>
                  {question.prompt}
                </AppText>

                {question.type === "choice" ? (
                  <View style={{ gap: 8, marginTop: 12 }}>
                    {(question.options ?? []).map((option, index) => {
                      const selected = choice === index;
                      const showCorrect = checked && index === question.answer;
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
                                    ? colors.accentSoft
                                    : colors.surfaceAlt,
                              borderColor: showCorrect
                                ? colors.success
                                : showWrong
                                  ? colors.danger
                                  : selected
                                    ? colors.accent
                                    : colors.line,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.optionLetter,
                              {
                                backgroundColor:
                                  selected || showCorrect ? colors.accent : colors.surface,
                              },
                            ]}
                          >
                            <AppText
                              variant="caption"
                              style={{
                                fontFamily: fonts.bold,
                                color: selected || showCorrect ? "#FFFFFF" : colors.muted,
                              }}
                            >
                              {String.fromCharCode(65 + index)}
                            </AppText>
                          </View>
                          <AppText style={{ fontFamily: fonts.mono, fontSize: 12.5, flex: 1 }}>
                            {option}
                          </AppText>
                          {showCorrect ? (
                            <Feather name="check-circle" size={16} color={colors.success} />
                          ) : null}
                          {showWrong ? <Feather name="x-circle" size={16} color={colors.danger} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <View style={{ marginTop: 12 }}>
                    <TextInput
                      value={text}
                      onChangeText={setText}
                      editable={!checked}
                      placeholder={question.placeholder}
                      placeholderTextColor={colors.faint}
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      onSubmitEditing={verify}
                      style={[
                        styles.input,
                        {
                          color: colors.ink,
                          backgroundColor: colors.surfaceAlt,
                          borderColor: checked
                            ? correct
                              ? colors.success
                              : colors.danger
                            : colors.line,
                        },
                      ]}
                    />
                  </View>
                )}

                <View style={styles.hintRow}>
                  <Feather name="info" size={12} color={colors.faint} />
                  <AppText variant="caption" color={colors.faint} style={{ flex: 1 }}>
                    {question.hint}
                  </AppText>
                </View>

                {checked ? (
                  <View
                    style={[
                      styles.feedback,
                      { backgroundColor: correct ? colors.successSoft : colors.dangerSoft },
                    ]}
                  >
                    <Mascot mood={correct ? "happy" : "sad"} size={40} animated={false} />
                    <View style={{ flex: 1 }}>
                      <AppText
                        style={{
                          fontFamily: fonts.bold,
                          fontSize: 13,
                          color: correct ? colors.success : colors.danger,
                        }}
                      >
                        {correct ? `Acertou! +${question.xp} XP` : "Ainda não — sem punição"}
                      </AppText>
                      <AppText variant="caption" color={colors.muted} style={{ marginTop: 2 }}>
                        {question.explain}
                      </AppText>
                    </View>
                  </View>
                ) : null}
              </Surface>
            </Animated.View>
          )}

          {step === "placement" && placementDone && (
            <Animated.View entering={FadeIn.duration(280)}>
              <View style={styles.resultHero}>
                <Mascot mood="happy" size={120} />
                <AppText variant="eyebrow" color={colors.faint} style={{ marginTop: 8 }}>
                  Nivelamento concluído
                </AppText>
                <AppText variant="hero" style={{ marginTop: 4 }}>
                  Você é {levelLabel[finalLevel]}.
                </AppText>
                <AppText variant="small" color={colors.muted} style={{ textAlign: "center", marginTop: 6 }}>
                  {percent}% de domínio · +{placementXp} XP ganhos agora.
                </AppText>
              </View>

              <View style={[styles.levelCard, { backgroundColor: colors.surface }]}>
                <ProgressBar percent={percent} height={9} />
                <View style={styles.levelScale}>
                  {(["beginner", "intermediate", "advanced"] as Level[]).map((item) => (
                    <AppText
                      key={item}
                      variant="caption"
                      color={finalLevel === item ? colors.accentInk : colors.faint}
                      style={finalLevel === item ? { fontFamily: fonts.bold } : undefined}
                    >
                      {levelLabel[item]}
                    </AppText>
                  ))}
                </View>
              </View>

              <View style={[styles.resultCard, { backgroundColor: colors.accentSoft }]}>
                <Feather name="map" size={15} color={colors.accentInk} />
                <AppText variant="caption" color={colors.ink} style={{ flex: 1 }}>
                  {finalLevel === "advanced"
                    ? `Você começa direto na Unidade 2 de ${selectedTrack.name}, com a base de lógica já creditada.`
                    : finalLevel === "intermediate"
                      ? `A Unidade 2 de ${selectedTrack.name} já está liberada, e a Unidade 1 continua aberta para revisão.`
                      : `Você começa na Unidade 1, com Portugol e exercícios curtos — o caminho mais seguro.`}
                </AppText>
              </View>
            </Animated.View>
          )}

          {step === "goal" && (
            <Animated.View entering={FadeIn.duration(280)}>
              <AppText variant="eyebrow" color={colors.faint}>
                Passo 3 de 3
              </AppText>
              <AppText variant="hero" style={{ marginTop: 8 }}>
                Quanto tempo por dia?
              </AppText>
              <AppText variant="small" color={colors.muted} style={{ marginTop: 8 }}>
                A meta é um lembrete, não uma cobrança. Você pode mudar depois.
              </AppText>

              <View style={{ gap: 10, marginTop: 22 }}>
                {goals.map((option) => {
                  const active = goal === option.minutes;
                  return (
                    <PressableScale
                      key={option.minutes}
                      onPress={() => {
                        tapFeedback();
                        setGoal(option.minutes);
                      }}
                    >
                      <View
                        style={[
                          styles.goalCard,
                          {
                            backgroundColor: active ? colors.accentSoft : colors.surface,
                            borderColor: active ? colors.accent : colors.line,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.goalBadge,
                            {
                              backgroundColor: active ? colors.accent : colors.surfaceAlt,
                            },
                          ]}
                        >
                          <AppText
                            style={{
                              fontFamily: fonts.bold,
                              fontSize: 15,
                              color: active ? "#FFFFFF" : colors.muted,
                            }}
                          >
                            {option.minutes}
                          </AppText>
                          <AppText
                            variant="caption"
                            style={{
                              fontSize: 8,
                              color: active ? "#FFFFFF" : colors.faint,
                              letterSpacing: 0.6,
                            }}
                          >
                            MIN
                          </AppText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <AppText variant="subtitle">{option.title}</AppText>
                          <AppText variant="small" color={colors.muted}>
                            {option.detail}
                          </AppText>
                        </View>
                        {active ? <Feather name="check" size={18} color={colors.accentInk} /> : null}
                      </View>
                    </PressableScale>
                  );
                })}
              </View>

              <View style={[styles.hintCard, { backgroundColor: colors.surfaceAlt, marginTop: 16 }]}>
                <Feather name="clock" size={14} color={colors.accentInk} />
                <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
                  <AppText variant="caption" color={colors.ink} style={{ fontFamily: fonts.semibold }}>
                    +{goal * 2} XP
                  </AppText>{" "}
                  por dia mantém sua ofensiva viva e libera a próxima lição.
                </AppText>
              </View>

              <View style={styles.mascotNote}>
                <Mascot mood="happy" size={40} />
                <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
                  Tudo fica salvo neste dispositivo e sincroniza quando você entra na conta.
                </AppText>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 12,
              backgroundColor: colors.bg,
              borderTopColor: colors.line,
            },
          ]}
        >
          {step !== "track" ? (
            <Pressable onPress={goBack} style={styles.backButton} accessibilityLabel="Voltar">
              <Feather name="arrow-left" size={20} color={colors.muted} />
            </Pressable>
          ) : null}

          {step === "track" && (
            <PrimaryButton label="Continuar" onPress={() => setStep("level")} style={{ flex: 1 }} />
          )}
          {step === "level" && (
            <PrimaryButton
              label="Fazer o teste de nivelamento"
              onPress={() => setStep("placement")}
              style={{ flex: 1 }}
              icon={<Feather name="target" size={16} color={colors.primaryInk} />}
            />
          )}
          {step === "placement" && !placementDone && !checked && (
            <PrimaryButton label="Verificar" onPress={verify} disabled={!ready} style={{ flex: 1 }} />
          )}
          {step === "placement" && !placementDone && checked && (
            <PrimaryButton
              label={qIndex >= placementQuestions.length - 1 ? "Ver meu nível" : "Próxima questão"}
              onPress={nextQuestion}
              style={{ flex: 1 }}
            />
          )}
          {step === "placement" && placementDone && (
            <PrimaryButton label="Continuar" onPress={finishPlacement} style={{ flex: 1 }} />
          )}
          {step === "goal" && (
            <PrimaryButton label="Começar a aprender" onPress={finish} style={{ flex: 1 }} />
          )}
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
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.4,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 22,
  },
  gridItem: {
    width: "48%",
    flexGrow: 1,
  },
  trackCard: {
    borderRadius: radii.lg,
    padding: 15,
    minHeight: 124,
  },
  check: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  trackIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  trackName: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    marginTop: 10,
    letterSpacing: -0.2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  howCard: {
    borderRadius: radii.lg,
    padding: 14,
    marginTop: 18,
  },
  howRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  howItem: {
    flex: 1,
  },
  howTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  howLine: {
    flex: 1,
    height: 1,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: radii.md,
    padding: 12,
    marginTop: 12,
  },
  levelCard: {
    borderRadius: radii.lg,
    padding: 14,
    marginTop: 14,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelName: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  levelScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    padding: 12,
  },
  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: fonts.mono,
    fontSize: 12.5,
    minHeight: 46,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.md,
    padding: 11,
    marginTop: 12,
  },
  resultHero: {
    alignItems: "center",
    paddingTop: 6,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: radii.md,
    padding: 12,
    marginTop: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 14,
  },
  goalBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    borderRadius: radii.md,
    padding: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});
