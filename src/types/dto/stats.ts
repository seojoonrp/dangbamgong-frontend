import type { VoidSessionItem } from "./void";

export interface HomeStatResponse {
  currentVoidCount: number;
  todaySleptCount: number;
  totalSleptUsers: number;
  myRank: number;
  myTotalDurationSec: number;
}

export interface BucketItem {
  time: string;
  count: number;
  isMine: boolean;
}

export interface DailyStatResponse {
  targetDay: string;
  buckets: BucketItem[];
  mySessions: VoidSessionItem[];
}

export interface MyVoidStatResponse {
  totalDurationSec: number;
  averageDurationSec: number;
  maxDurationSec: number;
}
