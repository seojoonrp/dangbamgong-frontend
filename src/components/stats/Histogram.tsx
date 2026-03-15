import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/colors";
import type { BucketItem } from "../../types/dto/stats";

const BAR_WIDTH = 8;
const BAR_GAP = 2;
const BAR_TOTAL = BAR_WIDTH + BAR_GAP;
const MAX_BAR_HEIGHT = 120;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  buckets: BucketItem[];
  isToday: boolean;
}

export default function Histogram({ buckets, isToday }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  // 오늘이면 현재 시간 기준으로 표시 제한
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  // 16시 기준으로 변환 (0 = 16:00, 1440 = next 16:00)
  const minutesSince16 =
    currentMinutes >= 960
      ? currentMinutes - 960
      : currentMinutes + 480;
  const currentBucketIndex = isToday
    ? Math.floor(minutesSince16 / 10) - 1
    : buckets.length;

  const renderBucketLabel = (index: number) => {
    // 시작 시간: 16:00 + index * 10분
    const totalMinutes = 960 + index * 10; // 960 = 16 * 60
    const h = Math.floor((totalMinutes % 1440) / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { width: buckets.length * BAR_TOTAL + 40 },
        ]}
      >
        {/* Y축 라벨 */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{maxCount}</Text>
          <Text style={styles.yLabel}>0</Text>
        </View>

        <View style={styles.barsContainer}>
          {/* 선택된 바 툴팁 */}
          {selectedIndex !== null && (
            <View
              style={[
                styles.tooltip,
                {
                  left: selectedIndex * BAR_TOTAL - 30,
                },
              ]}
            >
              <Text style={styles.tooltipText}>
                {renderBucketLabel(selectedIndex)} |{" "}
                {buckets[selectedIndex]?.count ?? 0}명
              </Text>
            </View>
          )}

          {/* 막대들 */}
          <View style={styles.barsRow}>
            {buckets.map((bucket, i) => {
              if (isToday && i > currentBucketIndex) return null;
              const height =
                bucket.count > 0
                  ? (bucket.count / maxCount) * MAX_BAR_HEIGHT
                  : 2;

              return (
                <Pressable
                  key={i}
                  onPress={() =>
                    setSelectedIndex(selectedIndex === i ? null : i)
                  }
                  style={styles.barWrapper}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: bucket.isMine
                          ? Colors.point.coral
                          : Colors.black.light,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* X축 라벨 (매시간) */}
          <View style={styles.xAxis}>
            {Array.from({ length: 25 }, (_, i) => (
              <Text
                key={i}
                style={[
                  styles.xLabel,
                  { left: i * 6 * BAR_TOTAL - 10 },
                ]}
              >
                {(16 + i) % 24}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginHorizontal: 8,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 20,
  },
  yAxis: {
    width: 30,
    height: MAX_BAR_HEIGHT,
    justifyContent: "space-between",
    marginRight: 4,
  },
  yLabel: {
    color: Colors.text.mid,
    fontSize: 10,
    textAlign: "right",
  },
  barsContainer: {
    position: "relative",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: MAX_BAR_HEIGHT,
  },
  barWrapper: {
    width: BAR_TOTAL,
    height: MAX_BAR_HEIGHT,
    justifyContent: "flex-end",
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
    minHeight: 2,
  },
  tooltip: {
    position: "absolute",
    top: -24,
    backgroundColor: Colors.black.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  tooltipText: {
    color: Colors.white,
    fontSize: 11,
  },
  xAxis: {
    position: "relative",
    height: 20,
    marginTop: 4,
  },
  xLabel: {
    position: "absolute",
    color: Colors.text.mid,
    fontSize: 10,
  },
});
