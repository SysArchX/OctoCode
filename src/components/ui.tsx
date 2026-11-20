import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { tapFeedback } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, typography } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TextVariant = keyof typeof typography;

export function AppText({
  variant = "body",
  color,
  style,
  children,
  ...rest
}: TextProps & { variant?: TextVariant; color?: string }) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[typography[variant] as TextStyle, { color: color ?? colors.ink }, style]}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
}

export function Screen({
  children,
  scroll = false,
  bottomInset = true,
}: {
  children?: ReactNode;
  scroll?: boolean;
  bottomInset?: boolean;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const content = (
    <View style={{ flex: 1, paddingBottom: bottomInset ? 118 + insets.bottom : 0 }}>{children}</View>
  );
  const scrollInset = bottomInset ? 118 + insets.bottom : 28 + insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
        {scroll ? (
          <Animated.ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scrollInset }}
          >
            {children}
          </Animated.ScrollView>
        ) : (
          content
        )}
      </View>
    </View>
  );
}

export function Surface({
  children,
  style,
  contentStyle,
  radius = radii.xl,
  padding = 16,
  elevated = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  padding?: number;
  elevated?: boolean;
}) {
  const { ui, mode, colors } = useTheme();
  const glass = ui === "glass";

  return (
    <View
      style={[
        {
          borderRadius: radius,
          shadowColor: colors.shadow,
          shadowOpacity: elevated ? (glass ? 0.18 : 0.14) : 0,
          shadowRadius: glass ? 24 : 18,
          shadowOffset: { width: 0, height: glass ? 14 : 10 },
          elevation: elevated ? (glass ? 6 : 3) : 0,
        },
        style,
      ]}
    >
      <View style={{ borderRadius: radius, overflow: "hidden" }}>
        {glass && (
          <BlurView
            intensity={mode === "dark" ? 55 : 65}
            tint={mode === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: glass ? colors.glassTint : colors.surface,
              borderWidth: 1,
              borderColor: glass ? colors.glassBorder : "transparent",
              borderRadius: radius,
            },
          ]}
        />
        {glass && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 18,
              right: 18,
              height: 1.5,
              borderRadius: 1,
              backgroundColor: colors.glassHighlight,
            }}
          />
        )}
        <View style={[{ padding }, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

export function PressableScale({
  children,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityRole = "button",
  haptic = true,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "link";
  haptic?: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => {
        if (haptic) tapFeedback();
        onPress?.();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      }}
      style={[animatedStyle, disabled ? { opacity: 0.4 } : null, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "soft" | "ghost";
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, ui } = useTheme();
  const background =
    variant === "primary" ? colors.primary : variant === "soft" ? colors.primarySoft : "transparent";
  const color =
    variant === "primary" ? colors.primaryInk : variant === "soft" ? colors.primary : colors.muted;

  return (
    <PressableScale onPress={onPress} disabled={disabled} style={style} accessibilityLabel={label}>
      <View
        style={[
          styles.button,
          { backgroundColor: background },
          variant === "primary" && ui === "glass"
            ? {
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.28)",
                shadowColor: colors.primary,
                shadowOpacity: 0.35,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 4,
              }
            : null,
        ]}
      >
        {icon}
        <AppText style={[styles.buttonLabel, { color }]}>{label}</AppText>
      </View>
    </PressableScale>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  size = 18,
  color,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  label: string;
  size?: number;
  color?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={styles.iconButton}
    >
      <Feather name={icon} size={size} color={color ?? colors.muted} />
    </Pressable>
  );
}

export function StatChip({
  icon,
  value,
  tint,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string | number;
  tint?: string;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}
    >
      <Feather name={icon} size={13} color={tint ?? colors.muted} />
      <AppText variant="caption" color={colors.ink} style={styles.chipValue}>
        {value}
      </AppText>
    </View>
  );
}

export function ProgressRing({
  percent,
  size = 88,
  stroke = 8,
  caption,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  caption?: string;
}) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const radius = (size - stroke) / 2 - 1;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, percent)), { duration: 900 });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progress.value / 100) * circumference,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surface3}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <AppText variant="title" style={{ fontFamily: fonts.bold }}>
          {Math.min(100, Math.round(percent))}%
        </AppText>
        {caption ? (
          <AppText variant="caption" color={colors.faint} style={{ letterSpacing: 0.8 }}>
            {caption.toUpperCase()}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export function ProgressBar({ percent, height = 6 }: { percent: number; height?: number }) {
  const { colors } = useTheme();
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(Math.max(0, Math.min(100, percent)), { duration: 700 });
  }, [percent, width]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.surface3, overflow: "hidden" }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: colors.accent }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  button: {
    minHeight: 52,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  chipValue: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    fontVariant: ["tabular-nums"],
  },
  ringLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
