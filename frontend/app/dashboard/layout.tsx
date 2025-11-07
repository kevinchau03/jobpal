"use server";
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";

async function getMe() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

  const res = await fetch("http://localhost:4000/api/users/me", {
    headers: {
      cookie: cookieHeader,
      'Content-Type': 'application/json'
    },
    cache: "no-store", // always fresh, or use revalidate
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  return (
    <div className="flex h-screen">
      <Sidebar userName={user?.name} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
