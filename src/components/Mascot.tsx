import { useEffect } from "react";
import { Image, StyleSheet } from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export type MascotMood = "idle" | "happy" | "sad" | "thinking";

/**
 * The real mascot (mascote.jpg with its white background removed). Mood only
 * changes the breathing animation now — the artwork is always the official one.
 */
export default function Mascot({
  mood = "idle",
  size = 96,
  animated = true,
  style,
}: {
  mood?: MascotMood;
  size?: number;
  animated?: boolean;
  style?: object;
}) {
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animated) {
      offset.value = 0;
      scale.value = 1;
      return;
    }
    offset.value = withRepeat(
      withTiming(mood === "happy" ? -8 : -4, {
        duration: mood === "happy" ? 760 : 2100,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
    scale.value = withRepeat(
      withTiming(mood === "thinking" ? 1.015 : 1.025, {
        duration: mood === "happy" ? 900 : 2400,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [mood, animated, offset, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: offset.value },
      { scale: scale.value },
      { rotate: mood === "thinking" ? "-4deg" : "0deg" },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animated && animatedStyle, style]}>
      <Image
        source={require("../../assets/mascot/mascot.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="Octo, o mascote do OctoCode"
      />
    </Animated.View>
  );
}

export const mascotStyles = StyleSheet.create({
  centered: { alignItems: "center", justifyContent: "center" },
});
