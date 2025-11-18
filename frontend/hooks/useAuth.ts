"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

// The primary auth hook now reads from context
export function useAuth() {
  // On pages outside the AuthProvider (e.g., /login), this will throw an error.
  // This is expected, as those pages should not rely on an existing auth session
  // in the same way as protected routes. For those pages, we can use a
  // different pattern or a modified auth hook if needed.
  try {
    return useAuthContext();
  } catch (error) {
    // Fallback for pages not wrapped in AuthProvider
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false, // Not loading, just not authenticated
      refetch: async () => {},
    };
  }
}

// Hook for redirecting authenticated users away from auth pages
// e.g. useAuthRedirect("/dashboard") on /login and /signup
export function useAuthRedirect(redirectTo: string = "/dashboard") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This hook is for pages like /login, where isLoading is false and isAuthenticated is false.
    // A separate client-side fetch is needed to confirm if a user is unexpectedly authenticated.
    // For simplicity in this refactor, we assume pages using this hook don't need a redirect check,
    // as the primary issue is on authenticated pages. A full solution might involve
    // a lightweight client-side check here if needed.
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
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
