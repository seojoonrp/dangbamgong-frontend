import { client } from "../client";
import type {
  UserMeResponse,
  ChangeNicknameResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  UserSearchResponse,
  BlockListResponse,
} from "../../types/dto/users";

export async function getMe(): Promise<UserMeResponse> {
  return client.get<never, UserMeResponse>("/users/me");
}

export async function changeNickname(
  nickname: string,
): Promise<ChangeNicknameResponse> {
  return client.patch<never, ChangeNicknameResponse>("/users/me/nickname", {
    nickname,
  });
}

export async function updateSettings(
  req: UpdateSettingsRequest,
): Promise<UpdateSettingsResponse> {
  return client.patch<never, UpdateSettingsResponse>(
    "/users/me/settings",
    req,
  );
}

export async function searchUsers(tag: string): Promise<UserSearchResponse> {
  return client.get<never, UserSearchResponse>("/users/search", {
    params: { tag },
  });
}

export async function blockUser(userId: string): Promise<void> {
  await client.post(`/users/${userId}/block`);
}

export async function unblockUser(userId: string): Promise<void> {
  await client.post(`/users/${userId}/unblock`);
}

export async function getBlockList(): Promise<BlockListResponse> {
  return client.get<never, BlockListResponse>("/users/blocks");
}
