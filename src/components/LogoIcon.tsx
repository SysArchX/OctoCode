import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

/**
 * Official OctoCode mark — the real `minalista.jpg` artwork with its white
 * studio background removed (assets/mascot/logo-icon.png). No drawn imitations.
 */
export default function LogoIcon({
  size = 28,
  style,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <Image
        source={require("../../assets/mascot/logo-icon.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="OctoCode"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
