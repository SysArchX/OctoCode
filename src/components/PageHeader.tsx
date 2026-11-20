import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tapFeedback } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts } from "@/theme/tokens";
import { AppText } from "./ui";

export default function PageHeader({
  title,
  eyebrow,
  right,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={10}
        onPress={() => {
          tapFeedback();
          if (router.canGoBack()) router.back();
          else router.replace("/");
        }}
        style={[styles.back, { backgroundColor: colors.surfaceAlt }]}
      >
        <Feather name="chevron-left" size={18} color={colors.ink} />
      </Pressable>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <AppText variant="eyebrow" color={colors.faint}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.4,
  },
});
