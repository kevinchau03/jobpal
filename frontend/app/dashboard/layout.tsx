"use server";
import { redirect } from 'next/navigation';
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";
import { api } from '@/lib/api';

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
    const user = await api<User>('/api/users/me', {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });
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
    <div className="flex h-screen">
      <Sidebar userName={user?.name} exp={user?.exp ?? 0} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
