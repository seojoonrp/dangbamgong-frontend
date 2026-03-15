import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import {
  formatDisplayDate,
  canNavigateNext,
  canNavigatePrev,
  addDays,
} from "../../lib/dateUtils";

interface Props {
  currentDay: string;
  minDate: string;
  onDayChange: (day: string) => void;
}

export default function DateNavigator({
  currentDay,
  minDate,
  onDayChange,
}: Props) {
  const canPrev = canNavigatePrev(currentDay, minDate);
  const canNext = canNavigateNext(currentDay);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => canPrev && onDayChange(addDays(currentDay, -1))}
        disabled={!canPrev}
        style={styles.arrow}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={canPrev ? Colors.white : Colors.text.dark}
        />
      </Pressable>

      <Text style={styles.dateText}>{formatDisplayDate(currentDay)}</Text>

      <Pressable
        onPress={() => canNext && onDayChange(addDays(currentDay, 1))}
        disabled={!canNext}
        style={styles.arrow}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={canNext ? Colors.white : Colors.text.dark}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 16,
  },
  arrow: {
    padding: 8,
  },
  dateText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: "A2Z-SemiBold",
    minWidth: 140,
    textAlign: "center",
  },
});
