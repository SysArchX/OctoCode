import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { tapFeedback } from "@/lib/haptics";

/** Only light/dark remains here — Material vs Liquid Glass follows the device. */
export default function ThemeSwitch() {
  const { mode, toggleMode, colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      onPress={() => {
        tapFeedback();
        toggleMode();
      }}
      style={styles.modeButton}
      hitSlop={6}
    >
      <Feather name={mode === "dark" ? "sun" : "moon"} size={16} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
