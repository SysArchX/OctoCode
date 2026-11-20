import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import type { ProgressState } from "@/lib/progress";
import { supabase } from "@/lib/supabase";

/** Same key the auth provider uses to identify this install. The two public
 *  tables are keyed by `device_id`, so progress syncs even without an account. */
export const DEVICE_KEY = "octocode.device.v1";
const QUEUE_KEY = "octocode.sync.v1";

interface Snapshot {
  deviceId: string;
  username: string;
  track: string;
  level: string;
  xpTotal: number;
  xpToday: number;
  streak: number;
  gems: number;
  completed: string[];
  trackXp: Record<string, number>;
  updatedAt: string;
}

interface SyncRecord {
  pending: Snapshot | null;
  lastSync: number;
  lastError: string | null;
  lastXpTotal: number;
  trackXp: Record<string, number>;
}

const emptyRecord: SyncRecord = {
  pending: null,
  lastSync: 0,
  lastError: null,
  lastXpTotal: 0,
  trackXp: {},
};

async function readRecord(): Promise<SyncRecord> {
  try {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    if (!stored) return { ...emptyRecord, trackXp: {} };
    const parsed = JSON.parse(stored) as Partial<SyncRecord>;
    return {
      pending: parsed.pending ?? null,
      lastSync: Number(parsed.lastSync ?? 0),
      lastError: parsed.lastError ?? null,
      lastXpTotal: Number(parsed.lastXpTotal ?? 0),
      trackXp:
        parsed.trackXp && typeof parsed.trackXp === "object" ? { ...parsed.trackXp } : {},
    };
  } catch {
    return { ...emptyRecord, trackXp: {} };
  }
}

async function writeRecord(record: SyncRecord) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(record)).catch(() => undefined);
}

export async function readDeviceId(): Promise<string | null> {
  const stored = await AsyncStorage.getItem(DEVICE_KEY).catch(() => null);
  return stored?.trim() ? stored : null;
}

async function ensureDeviceId(): Promise<string> {
  const stored = await readDeviceId();
  if (stored) return stored;
  const random = Math.random().toString(36).slice(2, 10);
  const created = `device-${Date.now().toString(36)}-${random}`;
  await AsyncStorage.setItem(DEVICE_KEY, created).catch(() => undefined);
  return created;
}

async function resolveUsername(): Promise<string> {
  if (!supabase) return "Explorador octo";
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    const meta = user?.user_metadata ?? {};
    return (
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      user?.email?.split("@")[0] ??
      user?.phone ??
      "Explorador octo"
    );
  } catch {
    return "Explorador octo";
  }
}

/**
 * Saves the newest local snapshot in the offline queue and, when the network
 * allows, pushes it right away. Called every time progress changes, so the
 * queue always holds exactly one authoritative snapshot.
 */
export async function queueProgressSync(state: ProgressState) {
  const deviceId = await ensureDeviceId();
  const username = await resolveUsername();
  const record = await readRecord();

  // Per-track XP is not stored locally, so the accumulated total is distributed
  // by the delta gained while each track was active.
  const trackXp = { ...record.trackXp };
  const delta = state.xpTotal - record.lastXpTotal;
  if (delta < 0) {
    for (const key of Object.keys(trackXp)) delete trackXp[key];
    trackXp[state.track] = Math.max(0, state.xpTotal);
  } else if (delta > 0) {
    trackXp[state.track] = (trackXp[state.track] ?? 0) + delta;
  }

  const snapshot: Snapshot = {
    deviceId,
    username,
    track: state.track,
    level: state.placementLevel,
    xpTotal: state.xpTotal,
    xpToday: state.xpToday,
    streak: state.streak,
    gems: state.gems,
    completed: state.completed,
    trackXp,
    updatedAt: new Date().toISOString(),
  };

  await writeRecord({
    ...record,
    pending: snapshot,
    lastXpTotal: state.xpTotal,
    trackXp,
  });
  void flushSync();
}

let flushing = false;

export interface SyncResult {
  ok: boolean;
  skipped?: "no-client" | "empty";
  error?: string;
}

/**
 * Pushes the queued snapshot to `profiles` and `language_leaderboard`. Both
 * tables are keyed by `device_id`, so this works for guests too; safe to call
 * often.
 */
export async function flushSync(): Promise<SyncResult> {
  if (!supabase) return { ok: false, skipped: "no-client" };

  const record = await readRecord();
  if (!record.pending) return { ok: false, skipped: "empty" };

  flushing = true;
  try {
    const snapshot = record.pending;

    const profileResult = await supabase.from("profiles").upsert(
      {
        device_id: snapshot.deviceId,
        username: snapshot.username,
        total_xp: snapshot.xpTotal,
        streak: snapshot.streak,
        gems: snapshot.gems,
        track_xp: snapshot.trackXp,
        completed_lessons: snapshot.completed,
        updated_at: snapshot.updatedAt,
      },
      { onConflict: "device_id" },
    );
    if (profileResult.error) throw new Error(profileResult.error.message);

    // `language_leaderboard` has no unique constraint to upsert on, so the row
    // is updated first and only inserted when this device has no entry yet.
    const leaderboardRow = {
      device_id: snapshot.deviceId,
      username: snapshot.username,
      language_slug: snapshot.track,
      xp: snapshot.xpTotal,
      updated_at: snapshot.updatedAt,
    };
    const updateResult = await supabase
      .from("language_leaderboard")
      .update(leaderboardRow)
      .eq("device_id", snapshot.deviceId)
      .eq("language_slug", snapshot.track)
      .select("id");
    if (updateResult.error) throw new Error(updateResult.error.message);
    if (!updateResult.data || updateResult.data.length === 0) {
      const insertResult = await supabase.from("language_leaderboard").insert(leaderboardRow);
      if (insertResult.error) throw new Error(insertResult.error.message);
    }

    await writeRecord({
      ...record,
      pending: null,
      lastSync: Date.now(),
      lastError: null,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeRecord({ ...record, lastError: message });
    return { ok: false, error: message };
  } finally {
    flushing = false;
  }
}

export async function getSyncStatus() {
  const record = await readRecord();
  return {
    pending: Boolean(record.pending),
    lastSync: record.lastSync,
    lastError: record.lastError,
  };
}

let installed = false;

/** Retries the queue whenever the app comes back to the foreground. */
export function installSyncRetry() {
  if (installed) return () => undefined;
  installed = true;
  const subscription = AppState.addEventListener("change", (status) => {
    if (status === "active") void flushSync();
  });
  return () => {
    installed = false;
    subscription.remove();
  };
}
