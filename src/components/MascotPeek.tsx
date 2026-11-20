import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, usePathname } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { tapFeedback } from "@/lib/haptics";

/** Size of the artwork. Only the top-left corner of it stays on screen. */
const ART = 118;
/** Visible window, so the octopus never overflows the viewport. */
const WINDOW_W = 62;
const WINDOW_H = 58;

/**
 * The official mascot peeking out of the bottom-right corner. Half of the face
 * is off-screen, clipped by its own window, so no circle or badge is needed.
 * Tapping it opens OctoAI, which lives outside the drawer.
 */
export default function MascotPeek() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { user, guest } = useAuth();

  const breathe = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breathe]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: breathe.value * -4 + press.value * -6 },
      { translateX: press.value * -4 },
      { rotate: `${-4 + press.value * -3}deg` },
    ],
  }));

  const hidden =
    !(user || guest) ||
    pathname === "/onboarding" ||
    pathname.startsWith("/lesson") ||
    pathname === "/terminal" ||
    pathname === "/settings" ||
    pathname === "/tutor";

  if (hidden) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom - 6 }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir o chat do OctoAI"
        hitSlop={{ top: 12, left: 12, bottom: 6, right: 6 }}
        onPressIn={() => {
          press.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          press.value = withTiming(0, { duration: 220 });
        }}
        onPress={() => {
          tapFeedback();
          router.push("/tutor");
        }}
      >
        <View style={styles.window}>
          <Animated.Image
            source={require("../../assets/mascot/mascot.png")}
            style={[styles.art, artStyle]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 0,
    zIndex: 30,
  },
  window: {
    width: WINDOW_W,
    height: WINDOW_H,
    overflow: "hidden",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  art: {
    width: ART,
    height: ART,
    marginLeft: -ART * 0.06,
    marginTop: ART * 0.04,
  },
});
