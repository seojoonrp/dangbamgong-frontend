import { useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../constants/colors";
import type { VoidSessionItem } from "../../types/dto/void";

const HOUR_HEIGHT = 60;
const TOTAL_HOURS = 24; // 16:00 ~ next 16:00
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  sessions: VoidSessionItem[];
}

export default function Timetable({ sessions }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  // 시간을 16:00 기준 오프셋(분)으로 변환
  const toMinuteOffset = (isoString: string): number => {
    const d = new Date(isoString);
    const totalMinutes = d.getHours() * 60 + d.getMinutes();
    // 16시 기준
    if (totalMinutes >= 960) return totalMinutes - 960;
    return totalMinutes + 480; // 다음 날
  };

  // 초기 스크롤 위치 계산 (첫 세션 중간 - 3시간)
  const initialOffset =
    sessions.length > 0
      ? Math.max(
          0,
          ((toMinuteOffset(sessions[0].startedAt) +
            toMinuteOffset(sessions[0].endedAt)) /
            2 /
            60 -
            3) *
            HOUR_HEIGHT,
        )
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentOffset={{ x: 0, y: initialOffset }}
        contentContainerStyle={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
      >
        {/* 시간 라인 */}
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
          <View
            key={i}
            style={[styles.hourLine, { top: i * HOUR_HEIGHT }]}
          >
            <Text style={styles.hourLabel}>{(16 + i) % 24}:00</Text>
            <View style={styles.line} />
          </View>
        ))}

        {/* 세션 블록 */}
        {sessions.map((session, i) => {
          const startOffset = toMinuteOffset(session.startedAt);
          const endOffset = toMinuteOffset(session.endedAt);
          const top = (startOffset / 60) * HOUR_HEIGHT;
          const height = Math.max(
            ((endOffset - startOffset) / 60) * HOUR_HEIGHT,
            4,
          );

          return (
            <View
              key={i}
              style={[
                styles.sessionBlock,
                { top, height, left: 50, right: 16 },
              ]}
            >
              <Text style={styles.sessionTime} numberOfLines={1}>
                {new Date(session.startedAt).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" ~ "}
                {new Date(session.endedAt).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {session.activities.length > 0 && (
                <Text style={styles.sessionActivities} numberOfLines={1}>
                  {session.activities.join(", ")}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8,
  },
  hourLine: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  hourLabel: {
    color: Colors.text.mid,
    fontSize: 11,
    width: 42,
    textAlign: "right",
    marginRight: 8,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.black.light,
  },
  sessionBlock: {
    position: "absolute",
    backgroundColor: Colors.black.mid,
    borderWidth: 1.5,
    borderColor: Colors.point.coral,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  sessionTime: {
    color: Colors.white,
    fontSize: 11,
  },
  sessionActivities: {
    color: Colors.text.light,
    fontSize: 10,
    marginTop: 2,
  },
});
