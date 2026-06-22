"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, CheckCircle, XCircle, Loader2, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  title: string;
  streamUrl: string;
  enabled: boolean;
  category: { name: string };
}

type Status = "idle" | "checking" | "ok" | "fail";

interface ChannelStatus extends Channel {
  status: Status;
  httpStatus?: number;
}

export default function StreamHealthPage() {
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch("/api/admin/channels")
      .then((r) => r.json())
      .then((data) => {
        setChannels((data.channels || data).map((ch: Channel) => ({ ...ch, status: "idle" as Status })));
        setLoading(false);
      });
  }, []);

  const checkAll = useCallback(async () => {
    setChecking(true);
    setChannels((prev) => prev.map((ch) => ({ ...ch, status: "checking" })));

    await Promise.all(
      channels.map(async (ch) => {
        try {
          const res = await fetch(`/api/admin/stream-check?url=${encodeURIComponent(ch.streamUrl)}`);
          const data = await res.json();
          setChannels((prev) =>
            prev.map((c) =>
              c.id === ch.id ? { ...c, status: data.ok ? "ok" : "fail", httpStatus: data.status } : c
            )
          );
        } catch {
          setChannels((prev) =>
            prev.map((c) => (c.id === ch.id ? { ...c, status: "fail", httpStatus: 0 } : c))
          );
        }
      })
    );
    setChecking(false);
  }, [channels]);

  const toggleChannel = async (id: string, enabled: boolean) => {
    await fetch(`/api/admin/channels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, enabled } : ch)));
  };

  const disableAllFailed = async () => {
    const failed = channels.filter((ch) => ch.status === "fail" && ch.enabled);
    await Promise.all(failed.map((ch) => toggleChannel(ch.id, false)));
  };

  const failedCount = channels.filter((c) => c.status === "fail").length;
  const okCount = channels.filter((c) => c.status === "ok").length;

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin h-4 w-4" /> Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stream Health</h1>
          <p className="text-sm text-gray-400 mt-1">সব stream URL চেক করুন — broken গুলো red-এ দেখাবে</p>
        </div>
        <div className="flex gap-3">
          {failedCount > 0 && (
            <button
              onClick={disableAllFailed}
              className="flex items-center gap-2 rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-600/30"
            >
              <PowerOff className="h-4 w-4" />
              Disable All Broken ({failedCount})
            </button>
          )}
          <button
            onClick={checkAll}
            disabled={checking}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            {checking ? "Checking..." : "Check All Streams"}
          </button>
        </div>
      </div>

      {(okCount > 0 || failedCount > 0) && (
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">✓ Working: {okCount}</span>
          <span className="text-red-400">✗ Broken: {failedCount}</span>
        </div>
      )}

      <div className="space-y-2">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
              ch.status === "fail"
                ? "border-red-500/40 bg-red-500/10"
                : ch.status === "ok"
                ? "border-green-500/20 bg-green-500/5"
                : "border-white/10 bg-white/5"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                {ch.status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-purple-400" />}
                {ch.status === "ok" && <CheckCircle className="h-4 w-4 text-green-400" />}
                {ch.status === "fail" && <XCircle className="h-4 w-4 text-red-400" />}
                {ch.status === "idle" && <div className="h-4 w-4 rounded-full border border-white/20" />}
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-medium truncate", ch.status === "fail" ? "text-red-300" : "text-white")}>
                  {ch.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{ch.category?.name} · {ch.streamUrl}</p>
                {ch.status === "fail" && ch.httpStatus !== undefined && (
                  <p className="text-xs text-red-400 mt-0.5">
                    {ch.httpStatus === 0 ? "Timeout / Unreachable" : `HTTP ${ch.httpStatus}`}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleChannel(ch.id, !ch.enabled)}
              className={cn(
                "ml-4 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                ch.enabled
                  ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
                  : "bg-red-500/20 text-red-400 hover:bg-green-500/20 hover:text-green-400"
              )}
            >
              {ch.enabled ? "On" : "Off"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
