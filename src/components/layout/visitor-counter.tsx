"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("rz_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("rz_session", id);
  }
  return id;
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    const ping = async () => {
      try {
        const res = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch {
        /* silent */
      }
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-xl glass px-2.5 py-1.5 text-xs text-gray-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <Users className="h-3.5 w-3.5" />
      <span>{count.toLocaleString()}</span>
    </div>
  );
}
