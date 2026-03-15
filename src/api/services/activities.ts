import { client } from "../client";
import type {
  ActivityListResponse,
  CreateActivityResponse,
} from "../../types/dto/activities";

export async function getActivities(): Promise<ActivityListResponse> {
  return client.get<never, ActivityListResponse>("/activities");
}

export async function createActivity(
  name: string,
): Promise<CreateActivityResponse> {
  return client.post<never, CreateActivityResponse>("/activities", { name });
}

export async function updateActivity(
  activityId: string,
  name: string,
): Promise<void> {
  await client.patch(`/activities/${activityId}`, { name });
}

export async function deleteActivity(activityId: string): Promise<void> {
  await client.delete(`/activities/${activityId}`);
}
