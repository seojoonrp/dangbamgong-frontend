import { client, tokenStorage } from "../client";
import type {
  LoginRequest,
  LoginResponse,
  SetNicknameResponse,
} from "../../types/dto/auth";

export async function loginWithSocial(
  req: LoginRequest,
): Promise<LoginResponse> {
  const data = await client.post<never, LoginResponse>("/auth/login", req);
  await tokenStorage.setToken(data.accessToken);
  return data;
}

export async function loginTest(socialId: string): Promise<LoginResponse> {
  const data = await client.post<never, LoginResponse>("/auth/login/test", {
    socialId,
  });
  await tokenStorage.setToken(data.accessToken);
  return data;
}

export async function setNickname(
  nickname: string,
): Promise<SetNicknameResponse> {
  return client.post<never, SetNicknameResponse>("/auth/nickname", {
    nickname,
  });
}

export async function withdraw(): Promise<void> {
  await client.delete("/auth/withdraw");
  await tokenStorage.removeToken();
}
