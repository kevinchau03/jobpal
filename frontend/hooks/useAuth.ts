import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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
    isLoading: true,
    isAuthenticated: false,
  });

  const performAuthCheck = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // Always try the API call first (cookie-based auth is primary)
      const user = await api<User>('/api/users/me');
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      // If API call fails, check localStorage token as fallback
      console.error('Authentication check failed:', error);
      const token = localStorage.getItem('token');
      if (token) {
        // Token exists but API call failed - token might be invalid
        localStorage.removeItem('token');
      }
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  useEffect(() => {
    performAuthCheck();
  }, []);

  return {
    ...authState,
    refetch: performAuthCheck,
  };
}

// Hook for redirecting authenticated users away from auth pages
export function useAuthRedirect(redirectTo: string = '/dashboard') {
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure auth state is stable
    if (!isLoading && isAuthenticated) {
      const timeoutId = setTimeout(() => {
        router.push(redirectTo);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, refetch };
}

// Hook for protecting routes that require authentication
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure auth state is stable
    if (!isLoading && !isAuthenticated) {
      const timeoutId = setTimeout(() => {
        router.push(redirectTo);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, user };
}