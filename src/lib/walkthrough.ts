import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "octocode.walkthrough.v1";

export async function hasSeenWalkthrough(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "done";
  } catch {
    return true;
  }
}

export async function markWalkthroughSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "done");
  } catch {
    undefined;
  }
}

export async function resetWalkthrough(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    undefined;
  }
}
