"use client";

import Image from "next/image";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicChannel } from "@/types";

interface ChannelCardProps {
  channel: PublicChannel;
  isActive?: boolean;
  onClick: () => void;
}

export function ChannelCard({ channel, isActive, onClick }: ChannelCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-center gap-2 rounded-xl p-3 text-center transition-all duration-200 active:scale-95",
        isActive
          ? "bg-purple-500/20 ring-1 ring-purple-500/60 shadow-md shadow-purple-500/20"
          : "glass hover:bg-white/8 hover:ring-1 hover:ring-white/20"
      )}
    >
      {/* Logo square */}
      <div
        className={cn(
          "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-transform duration-200 group-hover:scale-105",
          isActive ? "bg-purple-500/20" : "bg-white/8"
        )}
      >
        {channel.logoUrl ? (
          <Image
            src={channel.logoUrl}
            alt={channel.title}
            fill
            className="object-contain p-1.5"
            sizes="56px"
            unoptimized
          />
        ) : (
          <Radio className={cn("h-6 w-6", isActive ? "text-purple-400" : "text-gray-500")} />
        )}
      </div>

      {/* Live badge */}
      {isActive && (
        <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
          Live
        </span>
      )}

      {/* Title */}
      <p
        className={cn(
          "w-full truncate text-[11px] font-medium leading-tight",
          isActive ? "text-purple-300" : "text-gray-300 group-hover:text-white"
        )}
      >
        {channel.title}
      </p>
    </button>
  );
}
