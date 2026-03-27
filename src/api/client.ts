import axios from "axios";
import * as SecureStore from "expo-secure-store";
import type { ErrorCode } from "../types/common";

const TOKEN_KEY = "auth_token";

export const tokenStorage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

export const client = axios.create({
  baseURL: "http://172.30.1.28:8000/api/v1", // 데스크탑
  // baseURL: "http://10.23.88.212:8000/api/v1", // 노트북

  timeout: 7000,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터: JWT 토큰 부착
client.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: { success, data } 래퍼에서 data 추출
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      return body.data;
    }
    return body;
  },
  (error) => {
    if (error.response?.data) {
      const body = error.response.data;
      const apiError = new ApiError(
        body.code ?? "BAD_REQUEST",
        error.response.status,
      );
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public status: number,
  ) {
    super(code);
    this.name = "ApiError";
  }
}
