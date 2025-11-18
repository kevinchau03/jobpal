"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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

  // The user is authenticated if we have an initial user from the server.
  // We are not loading because the state is immediately available.
  const state: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    refetch: async () => {
      // Refetch logic can be added here if needed, e.g., for manual refresh.
      // For now, this is a no-op as the primary auth is server-driven.
    },
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
