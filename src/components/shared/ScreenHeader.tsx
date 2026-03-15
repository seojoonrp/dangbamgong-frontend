import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import ChevronIcon from "../../../assets/icons/shared/chevron.svg";

type ScreenHeaderProps = {
  title: string;
};

export default function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ChevronIcon width={20} height={20} color="rgba(196, 196, 203, 0.7)" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 4,
    width: 36,
    height: 36,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black.light,
    borderColor: "rgba(196, 196, 203, 0.2)",
    borderWidth: 1,
  },
  title: {
    fontSize: 21,
    fontFamily: "A2Z-SemiBold",
    color: Colors.white,
  },
});
