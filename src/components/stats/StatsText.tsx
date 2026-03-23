import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { formatDuration } from "../../lib/dateUtils";

interface Props {
  myTotalDurationSec: number;
  totalSleptUsers: number;
  allTotalDurationSec: number;
}

export default function StatsText({
  myTotalDurationSec,
  totalSleptUsers,
  allTotalDurationSec,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.main}>
        총 공백 {formatDuration(myTotalDurationSec)}
      </Text>
      <Text style={styles.sub}>
        <Text style={styles.highlight}>{totalSleptUsers}명</Text>이 총{" "}
        <Text style={styles.highlight}>
          {formatDuration(allTotalDurationSec)}
        </Text>
        의 공백을 보냈어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 28,
    alignItems: "center",
  },
  main: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
  sub: {
    color: Colors.text.mid,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    marginTop: 3,
  },
  highlight: {
    color: Colors.point.coral,
  },
});
