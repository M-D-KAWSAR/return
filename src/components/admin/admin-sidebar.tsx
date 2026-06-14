"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FolderOpen,
  Tv,
  LogOut,
  ExternalLink,
  Megaphone,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/channels", label: "Channels", icon: Tv },
  { href: "/admin/ads", label: "Ads", icon: Megaphone },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/80 md:bg-black/20">
      <div className="border-b border-white/10 p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
            RZ
          </div>
          <div>
            <p className="text-sm font-bold gradient-text">Return</p>
            <p className="text-xs text-gray-500">Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-purple-500/20 text-purple-light"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View Site
        </Link>
        <div className="mb-3 px-3 text-xs text-gray-500">
          {session?.user?.email}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
