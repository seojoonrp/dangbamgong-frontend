import type { DailyStatResponse, BucketItem } from "../types/dto/stats";
import type { VoidHistoryResponse } from "../types/dto/void";

/**
 * Mock 히스토그램 버킷 (16:00 ~ next 16:00, 20분 단위 = 72개)
 * 하드코딩된 count 값으로 자연스러운 정규분포 형태
 */
const MOCK_COUNTS = [
  // 16:00~19:40 (i=0~11): 거의 없음
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // 20:00~21:40 (i=12~17): 서서히 증가
  0, 0, 1, 2, 3, 4,
  // 22:00~23:40 (i=18~23): 본격 증가
  5, 7, 9, 12, 15, 18,
  // 00:00~01:40 (i=24~29): 피크
  20, 23, 25, 24, 22, 20,
  // 02:00~03:40 (i=30~35): 감소 시작
  18, 16, 14, 11, 9, 7,
  // 04:00~05:40 (i=36~41): 감소
  5, 4, 3, 2, 2, 1,
  // 06:00~07:40 (i=42~47): 거의 없음
  1, 0, 0, 0, 0, 0,
  // 08:00~15:40 (i=48~71): 없음
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

function buildMockBuckets(): BucketItem[] {
  return MOCK_COUNTS.map((count, i) => {
    const totalMinutes = 960 + i * 20;
    const hour = Math.floor((totalMinutes % 1440) / 60);
    const minute = totalMinutes % 60;

    // 내 세션: 23:20 ~ 02:00 범위
    const isMine =
      (hour === 23 && minute >= 20) ||
      hour === 0 ||
      hour === 1 ||
      (hour === 2 && minute === 0);

    return {
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      count,
      isMine,
    };
  });
}

export const MOCK_DAILY_STATS: DailyStatResponse = {
  targetDay: "2026-03-04",
  buckets: buildMockBuckets(),
  mySessions: [
    {
      startedAt: "2026-03-04T23:28:00+09:00",
      endedAt: "2026-03-05T02:00:00+09:00",
      activities: [],
    },
  ],
  myTotalDurationSec: 9120,
  totalSleptUsers: 209,
  allTotalDurationSec: 1811520,
};

export const MOCK_VOID_HISTORY: VoidHistoryResponse = {
  targetDay: "2026-03-04",
  totalDurationSec: 9120, // 2시간 32분
  sessions: [
    {
      sessionId: "mock-session-1",
      startedAt: "2026-03-04T23:28:00+09:00",
      endedAt: "2026-03-05T02:00:00+09:00",
      durationSec: 9120,
      activities: [],
    },
  ],
};
