import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
});
