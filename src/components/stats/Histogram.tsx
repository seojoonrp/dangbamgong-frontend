import { useState, useRef } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import type { BucketItem } from "../../types/dto/stats";

const BAR_WIDTH = 8;
const BAR_GAP = 4;
const BAR_TOTAL = BAR_WIDTH + BAR_GAP;
const MAX_BAR_HEIGHT = 185;
const GRID_LINE_COUNT = 9;

interface Props {
  buckets: BucketItem[];
  isToday: boolean;
}

export default function Histogram({ buckets, isToday }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  // TODO: 테스트용으로 NOW 비활성화 — 나중에 복원
  const currentBucketIndex = buckets.length;

  const renderBucketLabel = (index: number) => {
    const totalMinutes = 960 + index * 20;
    const h = Math.floor((totalMinutes % 1440) / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // NOW 인디케이터 비활성화
  const nowX = -1;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { width: buckets.length * BAR_TOTAL },
        ]}
      >
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

          {/* 배경 격자선 */}
          {Array.from({ length: GRID_LINE_COUNT }, (_, i) => (
            <View
              key={`grid-${i}`}
              style={[
                styles.gridLine,
                {
                  top: MAX_BAR_HEIGHT * (1 - (i + 1) / GRID_LINE_COUNT),
                  width: buckets.length * BAR_TOTAL,
                },
              ]}
            />
          ))}

          {/* NOW 인디케이터 */}
          {isToday && nowX > 0 && (
            <>
              <Text style={[styles.nowLabel, { left: nowX - 16 }]}>NOW</Text>
              <View
                style={[
                  styles.nowLine,
                  { left: nowX, height: MAX_BAR_HEIGHT + 4 },
                ]}
              >
                {Array.from(
                  { length: Math.ceil((MAX_BAR_HEIGHT + 4) / 6) },
                  (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.nowDash,
                        i % 2 === 0 ? styles.nowDashVisible : styles.nowDashGap,
                      ]}
                    />
                  ),
                )}
              </View>
            </>
          )}

          {/* 막대들 */}
          <View style={styles.barsRow}>
            {buckets.map((bucket, i) => {
              if (isToday && i > currentBucketIndex) return null;
              const height =
                bucket.count > 0
                  ? (bucket.count / maxCount) * MAX_BAR_HEIGHT
                  : 0;

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
                          : Colors.white,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* X축 라벨 (2시간 간격, 13개) */}
          <View style={styles.xAxis}>
            {Array.from({ length: 13 }, (_, i) => (
              <Text
                key={i}
                style={[styles.xLabel, { left: i * 6 * BAR_TOTAL - 8 }]}
              >
                {String((16 + i * 2) % 24).padStart(2, "0")}
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
    height: MAX_BAR_HEIGHT + 25,
    marginHorizontal: 13,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barsContainer: {
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: Colors.black.light,
    opacity: 0.5,
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
  nowLabel: {
    position: "absolute",
    top: -20,
    color: Colors.point.coral,
    fontSize: 8,
    fontFamily: "A2Z-Regular",
    zIndex: 10,
  },
  nowLine: {
    position: "absolute",
    top: 0,
    width: 1,
    zIndex: 5,
  },
  nowDash: {
    width: 1,
    height: 3,
  },
  nowDashVisible: {
    backgroundColor: Colors.point.coral,
  },
  nowDashGap: {
    backgroundColor: "transparent",
  },
  xAxis: {
    position: "relative",
    flexDirection: "row",
    borderTopColor: Colors.white,
    borderTopWidth: 1,
    paddingTop: 3,
  },
  xLabel: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "A2Z-Light",
  },
});
