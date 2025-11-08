"use client";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, PersonStanding, BookUser, ContactRound } from "lucide-react";
import { api } from "@/lib/api";

type SidebarProps = {
  userName?: string | null;
};

export default function Sidebar({ userName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await api("/api/users/logout", { method: "POST" });
    router.push("/login");
  };

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Jobs", path: "/dashboard/jobs", icon: <PersonStanding className="h-4 w-4" /> },
    { name: "Contacts", path: "/dashboard/contacts", icon: <BookUser className="h-4 w-4" /> },
    { name: "Preferences", path: "/dashboard/preferences", icon: <ContactRound className="h-4 w-4" /> },
  ];

  return (
    <aside className="w-48 flex flex-col justify-between border-r border-gray-800">
      {/* Top section */}
      <div>
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-primary">jobpal.</h2>
          <p className="text-sm mt-1">{userName ? `Welcome, ${userName}` : "Welcome"}</p>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {links.map((link) => {
            const active = pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:cursor-pointer ${
                  active
                    ? "bg-gray-800 text-primary"
                    : "hover:bg-gray-800 hover:text-primary"
                }`}
              >
                {link.icon}
                {link.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm hover:text-secondary transition-colors hover:cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
