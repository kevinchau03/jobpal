"use server";
import { redirect } from 'next/navigation';
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";
import { AuthProvider } from '@/providers/AuthProvider';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

async function getMe() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  
  try {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json() as User;
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
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
