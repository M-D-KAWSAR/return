"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopChannel {
  channelId: string;
  title: string;
  logoUrl: string | null;
  views: number;
  watchSeconds: number;
}

interface AnalyticsData {
  visitors: { today: number; last7d: number; last30d: number };
  views: { today: number; last7d: number; last30d: number };
  topChannels: TopChannel[];
  totalWatchSeconds: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StatCard({
  label,
  today,
  last7d,
  last30d,
  icon: Icon,
  color,
}: {
  label: string;
  today: number;
  last7d: number;
  last30d: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl glass-strong p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { period: "Today", value: today },
          { period: "7 Days", value: last7d },
          { period: "30 Days", value: last30d },
        ].map(({ period, value }) => (
          <div key={period} className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-xs text-gray-500">{period}</p>
            <p className="mt-1 text-xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : !data ? (
        <div className="rounded-2xl glass-strong p-8 text-center text-gray-400">
          Failed to load analytics
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            <StatCard
              label="Unique Visitors"
              today={data.visitors.today}
              last7d={data.visitors.last7d}
              last30d={data.visitors.last30d}
              icon={Users}
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Channel Views"
              today={data.views.today}
              last7d={data.views.last7d}
              last30d={data.views.last30d}
              icon={Eye}
              color="from-blue-500 to-blue-600"
            />
          </div>

          {/* Total Watch Time */}
          <div className="rounded-2xl glass-strong p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Watch Time (All Time)</p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(data.totalWatchSeconds)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Channels */}
          <div className="rounded-2xl glass-strong overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <h2 className="font-semibold text-white">Top Channels</h2>
              <span className="ml-auto text-xs text-gray-500">All time</span>
            </div>

            {data.topChannels.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No views recorded yet
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.topChannels.map((ch, i) => (
                  <div key={ch.channelId} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5">
                    {/* Rank */}
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        i === 0 && "bg-yellow-500/20 text-yellow-400",
                        i === 1 && "bg-gray-400/20 text-gray-300",
                        i === 2 && "bg-orange-500/20 text-orange-400",
                        i > 2 && "bg-white/5 text-gray-500"
                      )}
                    >
                      {i + 1}
                    </span>

                    {/* Logo */}
                    {ch.logoUrl ? (
                      <img
                        src={ch.logoUrl}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400">
                        {ch.title.charAt(0)}
                      </div>
                    )}

                    {/* Title */}
                    <span className="flex-1 truncate text-sm font-medium text-white">
                      {ch.title}
                    </span>

                    {/* Stats */}
                    <div className="flex shrink-0 items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="text-sm font-semibold text-white">
                          {ch.views.toLocaleString()}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs text-gray-500">Watch Time</p>
                        <p className="text-sm font-semibold text-purple-400">
                          {formatDuration(ch.watchSeconds)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
