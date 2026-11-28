"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api";
import {
  clearStoredTokens,
  getStoredTokens,
  onSessionInvalid,
  setStoredTokens,
} from "@/lib/api-client";
import {
  hasRolePermission,
  type IUser,
  type PermissionType,
  type UserRoleType,
} from "@/types/api";

interface AuthContextValue {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  register: (name: string, email: string, password: string) => Promise<IUser>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: PermissionType) => boolean;
  hasRole: (...roles: UserRoleType[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hydrateSession = useCallback(async () => {
    const { accessToken, refreshToken } = getStoredTokens();
    if (!accessToken && !refreshToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.data ?? null);
    } catch {
      clearStoredTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initSession() {
      const { accessToken, refreshToken } = getStoredTokens();
      if (!accessToken && !refreshToken) {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.me();
        if (active) {
          setUser(response.data ?? null);
        }
      } catch {
        clearStoredTokens();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void initSession();
    const unsubscribe = onSessionInvalid(() => {
      setUser(null);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const session = response.data;
    if (!session) {
      throw new Error("Invalid login response from server.");
    }
    setStoredTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await authApi.register({ name, email, password });
      const session = response.data;
      if (!session) {
        throw new Error("Invalid registration response from server.");
      }
      setStoredTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      setUser(session.user);
      return session.user;
    },
    []
  );

  const logout = useCallback(async () => {
    const { refreshToken } = getStoredTokens();
    try {
      await authApi.logout(refreshToken ?? undefined);
    } catch {
      // Clear local session even if token was already revoked
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // Clear local session even if token was already revoked
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: PermissionType) => hasRolePermission(user?.role, permission),
    [user?.role]
  );

  const hasRole = useCallback(
    (...roles: UserRoleType[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      logoutAll,
      refreshUser: hydrateSession,
      hasPermission,
      hasRole,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      logoutAll,
      hydrateSession,
      hasPermission,
      hasRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return ctx;
}
