"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed+slide on mobile, static flex-child on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:static md:translate-x-0 md:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold gradient-text">TheShayanCup Admin</span>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
