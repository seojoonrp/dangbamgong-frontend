import { View, StyleSheet, Pressable, Text } from "react-native";
import { Colors } from "../../constants/colors";
import Chip from "../shared/Chip";
import PlusIcon from "../../../assets/icons/shared/plus.svg";
import { useActivities } from "../../hooks/useActivities";
import { ScrollView } from "react-native-gesture-handler";

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
        style={styles.wrapContent}
        horizontal
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.9}
      >
        {sorted.map((activity) => (
          <Chip
            key={activity.id}
            label={activity.name}
            selected={selectedIds.has(activity.name)}
            onPress={() => onToggle(activity.name)}
          />
        ))}
      </ScrollView>
      <Pressable style={styles.addButton} onPress={onAddPress}>
        <PlusIcon width={14} height={14} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "60%",
    paddingTop: 12,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  wrapContent: {
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 1,
    overflow: "hidden",
  },
  scrollContent: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 15,
    backgroundColor: Colors.black.light,
    borderColor: Colors.white,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    color: Colors.text.light,
    fontSize: 18,
  },
});
