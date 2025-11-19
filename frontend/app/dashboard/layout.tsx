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
  const jidCookie = cookieStore.get('jid'); // Get the specific auth cookie
  
  if (!jidCookie) {
    console.log('[Auth] No jid cookie found');
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `jid=${jidCookie.value}`, // Send the auth cookie explicitly
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.log('[Auth] Request failed with status:', response.status);
      return null;
    }

    const user = await response.json() as User;
    return user;
  } catch (error) {
    console.error('[Auth] Failed to fetch user:', error);
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
