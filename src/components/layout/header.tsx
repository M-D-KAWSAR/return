"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VisitorCounter } from "./visitor-counter";

interface HeaderProps {
  categories: { id: string; name: string; slug: string }[];
  onSearch?: (query: string) => void;
  onCategorySelect?: (categoryId: string | null) => void;
  activeCategory?: string | null;
}

export function Header({
  categories,
  onSearch,
  onCategorySelect,
  activeCategory,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong shadow-lg shadow-purple-900/10" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="Ponklima TV"
              width={140}
              height={56}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => onCategorySelect?.(null)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                !activeCategory
                  ? "bg-purple-500/20 text-purple-light"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect?.(cat.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  activeCategory === cat.id
                    ? "bg-purple-500/20 text-purple-light"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3 md:max-w-xs lg:max-w-sm">
            <div className="relative hidden w-full sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl glass py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
              />
            </div>

            <VisitorCounter />

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="animate-fade-in border-t border-white/10 pb-4 pt-3 md:hidden">
            <div className="relative mb-3 sm:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl glass py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onCategorySelect?.(null);
                  setMobileOpen(false);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm",
                  !activeCategory ? "bg-purple-500/20 text-purple-light" : "text-gray-400"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategorySelect?.(cat.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm",
                    activeCategory === cat.id
                      ? "bg-purple-500/20 text-purple-light"
                      : "text-gray-400"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
