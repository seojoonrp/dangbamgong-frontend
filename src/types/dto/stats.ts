import type { VoidSessionItem } from "./void";

export interface HomeStatResponse {
  currentVoidCount: number;
  todaySleptCount: number;
  totalSleptUsers: number | null;
  myRank: number | null;
  myTotalDurationSec: number | null;
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
  myTotalDurationSec: number;
  totalSleptUsers: number;
  allTotalDurationSec: number;
}

export interface MyVoidStatResponse {
  totalDurationSec: number;
  averageDurationSec: number;
  maxDurationSec: number;
  maxDurationDate: string;
}
