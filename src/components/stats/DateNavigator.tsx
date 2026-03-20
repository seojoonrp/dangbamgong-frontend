import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import ArrowIcon from "../../../assets/icons/shared/arrow.svg";
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
        <ArrowIcon
          width={20}
          height={20}
          color={canPrev ? Colors.white : Colors.text.dark}
        />
      </Pressable>

      <Text style={styles.dateText}>{formatDisplayDate(currentDay)}</Text>

      <Pressable
        onPress={() => canNext && onDayChange(addDays(currentDay, 1))}
        disabled={!canNext}
        style={styles.arrow}
      >
        <ArrowIcon
          width={20}
          height={20}
          color={canNext ? Colors.white : Colors.text.dark}
          style={{ transform: [{ rotate: "180deg" }] }}
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
    paddingTop: 4,
    paddingBottom: 8,
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
