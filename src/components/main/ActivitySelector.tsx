import { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Text } from "react-native";
import { Colors } from "../../constants/colors";
import Chip from "../shared/Chip";
import { useActivities } from "../../hooks/useActivities";
import type { ActivityItem } from "../../types/dto/activities";

interface Props {
  selectedIds: Set<string>;
  onToggle: (activityName: string) => void;
  onAddPress: () => void;
}

export default function ActivitySelector({
  selectedIds,
  onToggle,
  onAddPress,
}: Props) {
  const { data } = useActivities();

  // 최근 사용순 정렬
  const sorted = [...(data?.activities ?? [])].sort(
    (a, b) =>
      new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime(),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sorted.map((activity) => (
          <Chip
            key={activity.id}
            label={activity.name}
            selected={selectedIds.has(activity.name)}
            onPress={() => onToggle(activity.name)}
          />
        ))}
        <Pressable style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.black.light,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    color: Colors.text.light,
    fontSize: 18,
  },
});
