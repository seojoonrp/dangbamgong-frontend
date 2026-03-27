import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import * as AppleAuthentication from "expo-apple-authentication";
import type { LoginRequest } from "../types/dto/auth";

// Google Sign-In 설정
GoogleSignin.configure({
  iosClientId:
    "588529751971-f87tfva1pfpc62rcdlr2ednq5ct85vqc.apps.googleusercontent.com",
});

export async function signInWithGoogle(): Promise<LoginRequest> {
  const response = await GoogleSignin.signIn();

  if ("type" in response && response.type === "cancelled") {
    throw new CancelledError();
  }

  const idToken = response.data?.idToken;
  if (!idToken) {
    throw new Error("Google 로그인에서 토큰을 받지 못했습니다.");
  }

  return { provider: "GOOGLE", idToken };
}

export async function signInWithKakao(): Promise<LoginRequest> {
  const result = await kakaoLogin();

  const idToken = result.idToken || result.accessToken;
  if (!idToken) {
    throw new Error("카카오 로그인에서 토큰을 받지 못했습니다.");
  }

  return { provider: "KAKAO", idToken };
}

export async function signInWithApple(): Promise<LoginRequest> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const idToken = credential.identityToken;
  if (!idToken) {
    throw new Error("Apple 로그인에서 토큰을 받지 못했습니다.");
  }

  return {
    provider: "APPLE",
    idToken,
    appleRefreshToken: credential.authorizationCode ?? undefined,
  };
}

class CancelledError extends Error {
  code = "CANCELLED";
  constructor() {
    super("User cancelled");
  }
}

export function isCancellation(e: unknown): boolean {
  if (e instanceof CancelledError) return true;
  if (e && typeof e === "object") {
    const code = (e as { code?: string }).code;
    if (code === "ERR_REQUEST_CANCELED") return true;
    if (code === "E_CANCELLED_OPERATION") return true;
  }
  return false;
}
