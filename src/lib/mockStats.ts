import type { DailyStatResponse, BucketItem } from "../types/dto/stats";
import type { VoidHistoryResponse } from "../types/dto/void";

/**
 * Mock 히스토그램 버킷 생성 (16:00 ~ next 16:00, 10분 단위 = 144개)
 * 스크린샷 기준: 00시~08시 사이에 정규분포 형태로 분포
 */
function generateMockBuckets(): BucketItem[] {
  const buckets: BucketItem[] = [];
  for (let i = 0; i < 144; i++) {
    const totalMinutes = 960 + i * 10; // 16:00 기준
    const hour = Math.floor((totalMinutes % 1440) / 60);

    // 00~06시 사이에 정규분포 형태로 count 생성
    let count = 0;
    if (hour >= 0 && hour <= 8) {
      // 02시(peak) 기준 정규분포
      const peakHour = 2;
      const dist = Math.abs(hour + (totalMinutes % 60) / 60 - peakHour);
      count = Math.max(0, Math.round(25 * Math.exp(-0.3 * dist * dist)));
      // 약간의 랜덤성
      count = Math.max(0, count + Math.floor((Math.sin(i * 7) * 5)));
    }

    // 내 세션: 23:30 ~ 02:00 범위
    const isMine =
      (hour === 23 && totalMinutes % 60 >= 30) ||
      (hour === 0) ||
      (hour === 1) ||
      (hour === 2 && totalMinutes % 60 === 0);

    buckets.push({
      time: `${String(hour).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`,
      count,
      isMine,
    });
  }
  return buckets;
}

export const MOCK_DAILY_STATS: DailyStatResponse = {
  targetDay: "2026-03-04",
  buckets: generateMockBuckets(),
  mySessions: [
    {
      startedAt: "2026-03-04T23:28:00+09:00",
      endedAt: "2026-03-05T02:00:00+09:00",
      activities: [],
    },
  ],
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
