import { useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../constants/colors";
import type { VoidSessionItem } from "../../types/dto/void";
import VoidIllustration from "../../../assets/images/void.svg";

const HOUR_HEIGHT = 68;
const TOTAL_HOURS = 24; // 16:00 ~ next 16:00
// 고정 높이 대신 flex로 부모에서 조절
const HOUR_LABEL_WIDTH = 18;
const TIMELINE_LEFT = 48;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  sessions: VoidSessionItem[];
}

// 16시 기준 시간(0~23)을 실제 시(hour)로 변환
function offsetToHour(offset: number): number {
  return (16 + offset) % 24;
}

// 특정 시간 라인이 세션 내부에 있는지 확인
function isHourInSession(
  hourOffset: number,
  sessions: VoidSessionItem[],
): boolean {
  const hourMinute = hourOffset * 60;
  for (const session of sessions) {
    const startOffset = toMinuteOffset(session.startedAt);
    const endOffset = toMinuteOffset(session.endedAt);
    // 시간 라인이 세션 시작과 끝 사이에 있을 때만 true
    if (startOffset < hourMinute && endOffset > hourMinute) {
      return true;
    }
  }
  return false;
}

// 시간을 16:00 기준 오프셋(분)으로 변환
function toMinuteOffset(isoString: string): number {
  const d = new Date(isoString);
  const totalMinutes = d.getHours() * 60 + d.getMinutes();
  if (totalMinutes >= 960) return totalMinutes - 960;
  return totalMinutes + 480;
}

// 세션 duration을 "XHR YMIN" 형태로 변환
function formatWatermark(startedAt: string, endedAt: string): string[] {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const totalMin = Math.round((end - start) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const lines: string[] = [];
  if (h > 0) lines.push(`${h}HR`);
  if (m > 0 || h === 0) lines.push(`${m}MIN`);
  return lines;
}

export default function Timetable({ sessions }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  // 고정 스크롤 위치: 23:00 (16시 기준 7시간 오프셋) 부근이 보이도록
  const initialOffset = 6 * HOUR_HEIGHT;

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentOffset={{ x: 0, y: initialOffset }}
        contentContainerStyle={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
      >
        {/* 시간 라인 */}
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
          const hour = offsetToHour(i);
          const highlighted = isHourInSession(i, sessions);
          return (
            <View key={i} style={[styles.hourRow, { top: i * HOUR_HEIGHT }]}>
              <Text
                style={[
                  styles.hourLabel,
                  {
                    color: highlighted ? Colors.white : Colors.text.dark,
                  },
                ]}
              >
                {String(hour).padStart(2, "0")}
              </Text>
              <View style={styles.line} />
            </View>
          );
        })}

        {/* 세션 블록 */}
        {sessions.map((session, i) => {
          const startOffset = toMinuteOffset(session.startedAt);
          const endOffset = toMinuteOffset(session.endedAt);
          const durationMin = endOffset - startOffset;

          // 10분 미만 세션은 표시하지 않음
          if (durationMin < 5) return null;

          const top = (startOffset / 60) * HOUR_HEIGHT;
          const height = Math.max(
            ((endOffset - startOffset) / 60) * HOUR_HEIGHT,
            4,
          );
          const isLongSession = durationMin >= 60;
          const watermarkLines = formatWatermark(
            session.startedAt,
            session.endedAt,
          );

          return (
            <View
              key={i}
              style={[
                styles.sessionBlock,
                { top, height, left: TIMELINE_LEFT, right: 0 },
              ]}
            >
              {isLongSession && (
                /* 워터마크 텍스트 */
                <View style={styles.watermarkContainer}>
                  {watermarkLines.map((line, j) => (
                    <Text
                      key={j}
                      style={styles.watermarkText}
                      allowFontScaling={false}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              )}

              {/* 일러스트 */}
              <View
                style={[
                  styles.illustrationContainer,
                  durationMin <= 100 && { bottom: -30 },
                ]}
              >
                <VoidIllustration
                  width={248}
                  height={140}
                  color={Colors.point.coral}
                />
              </View>

              {/* border overlay — 일러스트 위에 렌더 */}
              <View style={styles.borderOverlay} />

              {/* 코랄 스트립 (오른쪽 끝) */}
              <View style={styles.coralStrip} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.black.mid,
    borderRadius: 36,
    flex: 1,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  hourRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  hourLabel: {
    fontSize: 11,
    fontFamily: "A2Z-Regular",
    width: HOUR_LABEL_WIDTH,
    textAlign: "left",
    marginRight: 2,
    letterSpacing: -0.3,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.text.dark,
  },
  sessionBlock: {
    position: "absolute",
    backgroundColor: Colors.black.dark,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  borderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderColor: Colors.text.dark,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  coralStrip: {
    position: "absolute",
    right: 0,
    top: -1,
    bottom: -1,
    width: 2,
    backgroundColor: Colors.point.coral,
  },
  watermarkContainer: {
    position: "absolute",
    right: -2,
    bottom: -14,
    justifyContent: "flex-start",
  },
  watermarkText: {
    fontSize: 82,
    lineHeight: 80,
    fontFamily: "A2Z-Bold",
    color: "rgba(41, 40, 45, 0.2)",
    textAlign: "right",
    letterSpacing: -6,
  },
  illustrationContainer: {
    position: "absolute",
    left: -50,
    bottom: -10,
  },
});
