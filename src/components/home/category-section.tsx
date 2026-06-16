"use client";

import type { PublicCategory, PublicChannel } from "@/types";
import { ChannelCard } from "./channel-card";

interface CategorySectionProps {
  category: PublicCategory;
  activeChannelId?: string;
  onChannelSelect: (channel: PublicChannel) => void;
}

export function CategorySection({
  category,
  activeChannelId,
  onChannelSelect,
}: CategorySectionProps) {
  if (category.channels.length === 0) return null;

  return (
    <section id={category.slug} className="animate-slide-up">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">{category.name}</h2>
        <span className="rounded-full glass px-2.5 py-0.5 text-xs text-gray-400">
          {category.channels.length} channels
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {category.channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isActive={channel.id === activeChannelId}
            onClick={() => onChannelSelect(channel)}
          />
        ))}
      </div>
    </section>
  );
}
