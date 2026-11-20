import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { DEVICE_KEY, flushSync } from "@/lib/syncEngine";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const GUEST_KEY = "octocode.guest.v1";

export type AuthProviderId = "google";

/** Mobile deep link the Google OAuth flow returns to. */
export const OAUTH_REDIRECT = "octocode://auth/callback";

interface AuthContextValue {
  hydrated: boolean;
  user: User | null;
  guest: boolean;
  busy: boolean;
  configured: boolean;
  deviceId: string | null;
  error: string | null;
  continueAsGuest: () => Promise<void>;
  signInWith: (provider: AuthProviderId) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readParams(value: string) {
  const result: Record<string, string> = {};
  for (const pair of value.split("&")) {
    if (!pair) continue;
    const index = pair.indexOf("=");
    const key = index === -1 ? pair : pair.slice(0, index);
    const raw = index === -1 ? "" : pair.slice(index + 1);
    try {
      result[decodeURIComponent(key)] = decodeURIComponent(raw.replace(/\+/g, " "));
    } catch {
      result[key] = raw;
    }
  }
  return result;
}

function sessionFromUrl(url: string) {
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const fragment = hashIndex === -1 ? "" : url.slice(hashIndex + 1);
  const query =
    queryIndex === -1
      ? ""
      : url.slice(queryIndex + 1, hashIndex === -1 || hashIndex < queryIndex ? undefined : hashIndex);
  return { ...readParams(query), ...readParams(fragment) };
}

function createDeviceId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `device-${Date.now().toString(36)}-${random}`;
}

async function ensureDeviceId() {
  const stored = await AsyncStorage.getItem(DEVICE_KEY).catch(() => null);
  if (stored) return stored;
  const created = createDeviceId();
  await AsyncStorage.setItem(DEVICE_KEY, created).catch(() => undefined);
  return created;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const id = await ensureDeviceId();
      if (active) setDeviceId(id);
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (active && data.session?.user) {
            setUser(data.session.user);
            setGuest(Boolean(data.session.user.is_anonymous) || false);
            return;
          }
        } catch {
          // offline: fall back to the local guest flag below
        }
      }
      const stored = await AsyncStorage.getItem(GUEST_KEY).catch(() => null);
      if (active) setGuest(stored === "true");
    };

    restore().finally(() => {
      if (active) setHydrated(true);
    });

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setGuest(Boolean(session.user.is_anonymous));
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    void flushSync();
  }, [user]);

  const continueAsGuest = useCallback(async () => {
    const id = await ensureDeviceId();
    setDeviceId(id);
    await AsyncStorage.setItem(GUEST_KEY, "true").catch(() => undefined);
    setGuest(true);

    // Anonymous Supabase user keeps the leaderboard/profile in sync while the
    // student has no account. Offline, the local device id is the identity and
    // the queue flushes as soon as there is a session and a network.
    if (!supabase) return;

    const anonymousSession = (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const { error: anonymousError } = await supabase.auth.signInAnonymously();
        if (anonymousError) {
          // Offline or anonymous sign-in disabled: the local device id still
          // identifies this student and the queue flushes once a session works.
          console.warn(`[auth] sessão anônima indisponível: ${anonymousError.message}`);
        }
      }
      await flushSync();
    })().catch(() => undefined);

    // Guest entry must never hang on a slow network: the UI moves on and the
    // queue retries in the background.
    await Promise.race([
      anonymousSession,
      new Promise<void>((resolve) => setTimeout(resolve, 4000)),
    ]);
  }, []);

  const signInWith = useCallback(async (provider: AuthProviderId) => {
    if (!supabase) {
      setError("O login ainda não está disponível neste build. Tente novamente em instantes.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: OAUTH_REDIRECT, skipBrowserRedirect: true },
      });
      if (oauthError) throw oauthError;
      if (!data?.url) throw new Error("O Google não devolveu uma URL de login.");

      const result = await WebBrowser.openAuthSessionAsync(data.url, OAUTH_REDIRECT);
      if (result.type !== "success") return;

      const params = sessionFromUrl(result.url);
      if (params.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (exchangeError) throw exchangeError;
      } else if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (sessionError) throw sessionError;
      } else {
        throw new Error("O login voltou sem credenciais. Tente novamente.");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        setUser(sessionData.session.user);
        setGuest(false);
        await AsyncStorage.removeItem(GUEST_KEY).catch(() => undefined);
        await flushSync();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao entrar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut().catch(() => undefined);
    await AsyncStorage.removeItem(GUEST_KEY).catch(() => undefined);
    setUser(null);
    setGuest(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      hydrated,
      user,
      guest,
      busy,
      configured: isSupabaseConfigured,
      deviceId,
      error,
      continueAsGuest,
      signInWith,
      signOut,
      clearError,
    }),
    [
      hydrated,
      user,
      guest,
      busy,
      deviceId,
      error,
      continueAsGuest,
      signInWith,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro do AuthProvider");
  return context;
}
