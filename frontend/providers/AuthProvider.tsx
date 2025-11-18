"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, user: initialUser }: { children: ReactNode, user: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await api<User>('/api/users/me');
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const state: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refetch,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
