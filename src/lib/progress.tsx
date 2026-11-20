import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TrackId } from "@/data/curriculum";
import { queueProgressSync } from "@/lib/syncEngine";

export interface JournalNote {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
}

export type Level = "beginner" | "intermediate" | "advanced";

export interface ProgressState {
  onboarded: boolean;
  track: TrackId;
  level: Level;
  placementLevel: Level;
  placementPassed: boolean;
  dailyGoal: number;
  streak: number;
  gems: number;
  hearts: number;
  xpToday: number;
  xpTotal: number;
  completed: string[];
  notes: JournalNote[];
  lastDay: string;
  muted: boolean;
}

const STORAGE_KEY = "octocode.progress.v1";

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export const initialState: ProgressState = {
  onboarded: false,
  track: "python",
  level: "beginner",
  placementLevel: "beginner",
  placementPassed: false,
  dailyGoal: 10,
  streak: 0,
  gems: 40,
  hearts: 5,
  xpToday: 0,
  xpTotal: 0,
  completed: [],
  notes: [],
  lastDay: todayKey(),
  muted: false,
};

function normalize(value: unknown): ProgressState {
  if (!value || typeof value !== "object") return { ...initialState };
  const raw = value as Partial<ProgressState>;
  return {
    ...initialState,
    ...raw,
    completed: Array.isArray(raw.completed) ? raw.completed : [],
    notes: Array.isArray(raw.notes) ? raw.notes : [],
  };
}

interface ProgressContextValue {
  state: ProgressState;
  hydrated: boolean;
  setTrack: (track: TrackId) => void;
  completeLesson: (lessonId: string, xp?: number, gems?: number) => void;
  addXp: (points: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  setOnboarding: (data: {
    track: TrackId;
    level: Level;
    placementLevel: Level;
    placementPassed: boolean;
    dailyGoal: number;
  }) => void;
  setDailyGoal: (minutes: number) => void;
  addNote: (note: { title: string; body: string; tags: string[] }) => void;
  removeNote: (id: string) => void;
  toggleMuted: () => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed = normalize(JSON.parse(stored));
          if (parsed.lastDay !== todayKey()) {
            setState({ ...parsed, xpToday: 0, lastDay: todayKey() });
          } else {
            setState(parsed);
          }
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
    queueProgressSync(state);
  }, [state, hydrated]);

  const setTrack = useCallback((track: TrackId) => {
    setState((current) => ({ ...current, track }));
  }, []);

  const completeLesson = useCallback((lessonId: string, xp = 10, gems = 5) => {
    setState((current) => {
      const alreadyDone = current.completed.includes(lessonId);
      const today = todayKey();
      const streak = current.lastDay === today ? current.streak : current.streak + 1;
      return {
        ...current,
        completed: alreadyDone ? current.completed : [...current.completed, lessonId],
        gems: current.gems + (alreadyDone ? 0 : gems),
        xpToday: current.xpToday + (alreadyDone ? 0 : xp),
        xpTotal: current.xpTotal + (alreadyDone ? 0 : xp),
        streak,
        lastDay: today,
      };
    });
  }, []);

  const addXp = useCallback((points: number) => {
    setState((current) => ({
      ...current,
      xpToday: current.xpToday + Math.max(0, Math.round(points)),
      xpTotal: current.xpTotal + Math.max(0, Math.round(points)),
      lastDay: todayKey(),
    }));
  }, []);

  const loseHeart = useCallback(() => {
    setState((current) => ({ ...current, hearts: Math.max(0, current.hearts - 1) }));
  }, []);

  const refillHearts = useCallback(() => {
    setState((current) => ({ ...current, hearts: 5 }));
  }, []);

  const setOnboarding = useCallback<ProgressContextValue["setOnboarding"]>((data) => {
    setState((current) => {
      const base = ["logic-1", "logic-2", "logic-3"];
      return {
        ...current,
        ...data,
        onboarded: true,
        hearts: 5,
        // Advanced students start exactly at their module: the logic base is
        // credited instead of forcing them through lessons they already know.
        completed:
          data.placementLevel === "advanced"
            ? [...new Set([...current.completed, ...base])]
            : current.completed,
      };
    });
  }, []);

  const setDailyGoal = useCallback((minutes: number) => {
    setState((current) => ({ ...current, dailyGoal: minutes }));
  }, []);

  const addNote = useCallback<ProgressContextValue["addNote"]>((note) => {
    const createdAt = Date.now();
    setState((current) => ({
      ...current,
      notes: [{ id: `note-${createdAt}`, createdAt, ...note }, ...current.notes],
    }));
  }, []);

  const removeNote = useCallback((id: string) => {
    setState((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
  }, []);

  const toggleMuted = useCallback(() => {
    setState((current) => ({ ...current, muted: !current.muted }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({ ...initialState, lastDay: todayKey() });
  }, []);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      setTrack,
      completeLesson,
      addXp,
      loseHeart,
      refillHearts,
      setOnboarding,
      setDailyGoal,
      addNote,
      removeNote,
      toggleMuted,
      resetProgress,
    }),
    [
      state,
      hydrated,
      setTrack,
      completeLesson,
      addXp,
      loseHeart,
      refillHearts,
      setOnboarding,
      setDailyGoal,
      addNote,
      removeNote,
      toggleMuted,
      resetProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress precisa estar dentro do ProgressProvider");
  return context;
}

export function buildPath(
  units: { id: string; index: number; lessons: { id: string }[] }[],
  completed: string[],
  placementPassed: boolean,
) {
  const done = new Set(completed);
  return units.map((unit, unitIndex) => {
    const previousComplete =
      unitIndex === 0 || units[unitIndex - 1].lessons.every((lesson) => done.has(lesson.id));
    const unlocked =
      unitIndex === 0 ? true : unitIndex === 1 ? previousComplete || placementPassed : previousComplete;

    const lessons = unit.lessons.map((lesson, lessonIndex) => {
      const state = done.has(lesson.id)
        ? "done"
        : unlocked && (lessonIndex === 0 || done.has(unit.lessons[lessonIndex - 1].id))
          ? "current"
          : "locked";
      return { id: lesson.id, state } as const;
    });

    return {
      id: unit.id,
      index: unit.index,
      lessons,
      unlocked,
      completedCount: lessons.filter((lesson) => lesson.state === "done").length,
    };
  });
}
