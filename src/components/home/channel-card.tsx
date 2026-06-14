"use client";

import Image from "next/image";
import { Play, Radio } from "lucide-react";
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
        "group relative flex w-full flex-col overflow-hidden rounded-2xl glass text-left transition-all duration-300 active:scale-[0.98] [@media(hover:hover)]:hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10",
        isActive && "ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/20 animate-pulse-glow"
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {channel.logoUrl ? (
          <Image
            src={channel.logoUrl}
            alt={channel.title}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Radio className="h-12 w-12 text-purple-400/40" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/80 backdrop-blur-sm">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>

        {isActive && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">{channel.title}</h3>
        {channel.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
            {channel.description}
          </p>
        )}
      </div>
    </button>
  );
}
