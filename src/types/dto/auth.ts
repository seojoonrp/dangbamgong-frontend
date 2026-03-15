export type SocialProvider = "GOOGLE" | "KAKAO" | "APPLE";

export interface LoginRequest {
  provider: SocialProvider;
  idToken: string;
  appleRefreshToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  isNewUser: boolean;
}

export interface TestLoginRequest {
  socialId: string;
}

export interface SetNicknameRequest {
  nickname: string;
}

export interface SetNicknameResponse {
  nickname: string;
}
