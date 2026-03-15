export interface ActivityItem {
  id: string;
  name: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface ActivityListResponse {
  activities: ActivityItem[];
}

export interface CreateActivityRequest {
  name: string;
}

export interface CreateActivityResponse {
  id: string;
  name: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface UpdateActivityRequest {
  name: string;
}
