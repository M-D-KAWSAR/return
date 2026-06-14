"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Tv, Users, Loader2 } from "lucide-react";

interface Stats {
  categories: number;
  channels: number;
  onlineVisitors: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Categories",
      value: stats?.categories ?? "—",
      icon: FolderOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Channels",
      value: stats?.channels ?? "—",
      icon: Tv,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Online Visitors",
      value: stats?.onlineVisitors ?? "—",
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      {!stats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl glass-strong p-6 transition-all hover:shadow-lg hover:shadow-purple-500/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{card.value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl glass-strong p-6">
        <h2 className="mb-2 text-lg font-semibold text-white">Quick Start</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>1. Create categories to organize your channels</li>
          <li>2. Add channels with m3u8 stream URLs in the Channels section</li>
          <li>3. Upload channel logos and set a featured channel</li>
          <li>4. Drag and drop to reorder categories and channels</li>
        </ul>
      </div>
    </div>
  );
}
