import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

type SvgIcon = React.FC<{ color: string; width: number; height: number }>;

type TabHeaderProps = {
  icon: SvgIcon;
  title: string;
  rightContent?: React.ReactNode;
};

export default function TabHeader({
  icon: Icon,
  title,
  rightContent,
}: TabHeaderProps) {
  return (
    <View style={styles.container}>
      <Icon width={36} height={36} color={Colors.text.mid} />
      <Text style={styles.title}>{title}</Text>
      {rightContent && <View style={styles.right}>{rightContent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    fontFamily: "A2Z-SemiBold",
    color: Colors.white,
    marginTop: -2,
  },
  right: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
