"use client";

import { Fragment, useState, useMemo, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { VideoPlayer } from "@/components/player/video-player";
import { CategorySection } from "@/components/home/category-section";
import { AdBanner } from "@/components/home/ad-banner";
import { InstallBanner } from "@/components/home/install-banner";
import { AppPopup } from "@/components/home/app-popup";
import type { PublicCategory, PublicChannel } from "@/types";

interface PublicAd {
  id: string;
  type: string;
  imageUrl: string | null;
  linkUrl: string | null;
  htmlCode: string | null;
  position: string;
}

interface HomeClientProps {
  initialCategories: PublicCategory[];
  ads: PublicAd[];
}

export function HomeClient({ initialCategories, ads }: HomeClientProps) {
  const [categories] = useState(initialCategories);
  const [activeChannel, setActiveChannel] = useState<PublicChannel | null>(() => {
    for (const cat of initialCategories) {
      const featured = cat.channels.find((c) => c.featured);
      if (featured) return featured;
    }
    return initialCategories[0]?.channels[0] ?? null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleChannelSelect = useCallback((channel: PublicChannel) => {
    setActiveChannel(channel);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredCategories = useMemo(() => {
    let result = categories;

    if (activeCategory) {
      result = result.filter((c) => c.id === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result
        .map((cat) => ({
          ...cat,
          channels: cat.channels.filter(
            (ch) =>
              ch.title.toLowerCase().includes(q) ||
              ch.description?.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.channels.length > 0);
    }

    return result;
  }, [categories, activeCategory, searchQuery]);

  const headerCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="min-h-screen">
      <AppPopup />
      <Header
        categories={headerCategories}
        onSearch={setSearchQuery}
        onCategorySelect={setActiveCategory}
        activeCategory={activeCategory}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <InstallBanner />
        <AdBanner ads={ads} position="banner_top" />

        <section className="mb-8 mt-4 animate-fade-in">
          <VideoPlayer channel={activeChannel} />
        </section>

        <div className="space-y-10">
          {filteredCategories.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500">No channels found</p>
            </div>
          ) : (
            filteredCategories.map((category, index) => (
              <Fragment key={category.id}>
                <CategorySection
                  category={category}
                  activeChannelId={activeChannel?.id}
                  onChannelSelect={handleChannelSelect}
                />
                {index === 0 && (
                  <AdBanner ads={ads} position="banner_between" />
                )}
              </Fragment>
            ))
          )}
        </div>

        <div className="mt-10">
          <AdBanner ads={ads} position="banner_bottom" />
        </div>
      </main>

      <footer className="mt-16 border-t border-white/5 py-8 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Ponkolima (IPTV). All rights reserved.</p>
      </footer>
    </div>
  );
}
