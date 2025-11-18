"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
}

interface InternalAuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<InternalAuthState>({
    user: null,
    isLoading: true, // start true while first check runs
    isAuthenticated: false,
  });

  const requestIdRef = useRef(0);

  const performAuthCheck = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setAuthState(prev => ({
      ...prev,
      isLoading: true,
    }));

    try {
      // Primary: cookie-based auth via /api/users/me
      const user = await api<User>("/api/users/me");

      // Ignore if a newer request has already completed
      if (requestId !== requestIdRef.current) return;

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Authentication check failed:", error);

      // Fallback: clean up any stale token in localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.removeItem("token");
        }
      }

      if (requestId !== requestIdRef.current) return;

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    void performAuthCheck();
  }, [performAuthCheck]);

  return {
    ...authState,
    refetch: performAuthCheck,
  };
}

// Hook for redirecting authenticated users away from auth pages
// e.g. useAuthRedirect("/dashboard") on /login and /signup
export function useAuthRedirect(redirectTo: string = "/dashboard") {
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, refetch };
}

// Hook for protecting routes that require authentication
// e.g. useRequireAuth("/login") on /dashboard pages
export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, user };
}
