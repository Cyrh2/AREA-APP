import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as authApi from "../api/authApi";
import { AuthUser } from "../api/authApi";
import apiClient from "../api/client";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "@area/token";
const USER_KEY = "@area/user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Chargement initial du token + user éventuel
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.warn("Erreur chargement auth:", error);
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrap();
  }, []);

  type AuthSuccessPayload = { token: string; user?: AuthUser };

  const handleAuthSuccess = async ({ token, user }: AuthSuccessPayload) => {
    setToken(token);
    setUser(user ?? null);

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const ops: Promise<void>[] = [AsyncStorage.setItem(TOKEN_KEY, token)];

    if (user) {
      ops.push(AsyncStorage.setItem(USER_KEY, JSON.stringify(user)));
    } else {
      ops.push(AsyncStorage.removeItem(USER_KEY));
    }

    await Promise.all(ops);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    await handleAuthSuccess({ token: res.token, user: res.user });
  };

  const register = async (email: string, password: string, username: string) => {
    const res = await authApi.register({ email, password, username });
    await handleAuthSuccess({ token: res.token, user: res.user });
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common["Authorization"];

    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    authLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return ctx;
};
