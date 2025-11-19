"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../components/Sidebar";
import { AuthProvider } from '@/providers/AuthProvider';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('[Client Auth] Checking authentication...');
        const userData = await api<User>('/api/users/me');
        console.log('[Client Auth] Success:', userData.email);
        setUser(userData);
      } catch (error) {
        console.log('[Client Auth] Failed, redirecting to login');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthProvider user={user}>
      <div className="flex h-screen">
        <Sidebar userName={user?.name} exp={user?.exp ?? 0} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </AuthProvider>
  );
}
