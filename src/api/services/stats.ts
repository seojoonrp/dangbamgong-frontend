import { client } from "../client";
import type {
  HomeStatResponse,
  DailyStatResponse,
  MyVoidStatResponse,
} from "../../types/dto/stats";

export async function getHomeStats(): Promise<HomeStatResponse> {
  return client.get<never, HomeStatResponse>("/stats/home");
}

export async function getDailyStats(
  targetDay: string,
): Promise<DailyStatResponse> {
  return client.get<never, DailyStatResponse>("/stats/daily", {
    params: { target_day: targetDay },
  });
}

export async function getMyStats(): Promise<MyVoidStatResponse> {
  return client.get<never, MyVoidStatResponse>("/stats/me");
}
