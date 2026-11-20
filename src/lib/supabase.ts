import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Public project URL. Set EXPO_PUBLIC_SUPABASE_URL to your project URL in a
 *  real deployment; the fallback keeps cloud builds booting without config. */
const FALLBACK_URL = "https://otayokxlgzgknawgpdfj.supabase.co";
const FALLBACK_KEY = "sb_publishable_Yf8NWgw6vYo9f13jpuLLcA_nio8D_8k";

const url = (process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_URL).trim();
const anonKey = (
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY
).trim();

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Real Supabase client. Session tokens live in AsyncStorage so a student can
 * reopen the app offline and still be signed in; the sync engine pushes the
 * saved progress to `profiles` and `language_leaderboard` when the network is
 * available. `detectSessionInUrl` stays off because the OAuth callback is
 * handled by expo-web-browser, not by the page URL.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
