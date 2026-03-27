export interface NotificationSettings {
  friendRequest: boolean;
  friendNudge: boolean;
  voidReminder: boolean;
  reminderHours: number;
}

export interface UserMeResponse {
  id: string;
  nickname: string;
  tag: string;
  socialProvider: string;
  isInVoid: boolean;
  currentVoidStartedAt: string;
  notificationSettings: NotificationSettings;
}

export interface ChangeNicknameRequest {
  nickname: string;
}

export interface ChangeNicknameResponse {
  nickname: string;
}

export interface UpdateSettingsRequest {
  friendRequest?: boolean;
  friendNudge?: boolean;
  voidReminder?: boolean;
  reminderHours?: number;
}

export interface UpdateSettingsResponse {
  friendRequest: boolean;
  friendNudge: boolean;
  voidReminder: boolean;
  reminderHours: number;
}

export interface UserSearchItem {
  userId: string;
  nickname: string;
  tag: string;
  isBlocked: boolean;
  isFriend: boolean;
}

export interface UserSearchResponse {
  users: UserSearchItem[];
}

export interface BlockItem {
  userId: string;
  nickname: string;
  tag: string;
  blockedAt: string;
}

export interface BlockListResponse {
  blocks: BlockItem[];
}
