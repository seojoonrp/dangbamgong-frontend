import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { tokenStorage } from "../api/client";
import { getMe } from "../api/services/users";
import { queryClient } from "./queryClient";
import type { LoginResponse } from "../types/dto/auth";

interface AuthState {
  isAuthenticated: boolean;
  isNewUser: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (response: LoginResponse) => void;
  logout: () => Promise<void>;
  setAuthenticated: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isNewUser: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await tokenStorage.getToken();
      if (!token) {
        setState({ isAuthenticated: false, isNewUser: false, isLoading: false });
        return;
      }
      const user = await getMe();
      const needsNickname = !user.nickname || user.nickname === "";
      setState({
        isAuthenticated: true,
        isNewUser: needsNickname,
        isLoading: false,
      });
    } catch {
      await tokenStorage.removeToken();
      setState({ isAuthenticated: false, isNewUser: false, isLoading: false });
    }
  }

  const login = useCallback((response: LoginResponse) => {
    setState({
      isAuthenticated: true,
      isNewUser: response.isNewUser,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.removeToken();
    queryClient.clear();
    setState({ isAuthenticated: false, isNewUser: false, isLoading: false });
  }, []);

  const setAuthenticated = useCallback(() => {
    setState((prev) => ({ ...prev, isNewUser: false }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
