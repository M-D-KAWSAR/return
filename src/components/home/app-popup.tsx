"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function AppPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // PWA হিসেবে installed থাকলে দেখাবে না
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // আজকে আগে dismiss করলে দেখাবে না
    const dismissed = localStorage.getItem("rz_popup_dismissed");
    if (dismissed === new Date().toDateString()) return;
    // ছোট delay দিয়ে pop করবে
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem("rz_popup_dismissed", new Date().toDateString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-slide-up overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#12102a] to-[#0a0a12] shadow-2xl shadow-purple-900/50">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        <div className="px-6 pb-6 pt-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
            <Smartphone className="h-10 w-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="mb-2 text-2xl font-bold text-white">
            অ্যাপটি ডাউনলোড করুন!
          </h2>

          {/* Subtitle */}
          <p className="mb-5 text-sm leading-relaxed text-gray-400">
            ব্রাউজারে স্ট্রিম মাঝে মাঝে সমস্যা করতে পারে।{" "}
            <span className="font-semibold text-purple-300">
              আমাদের অ্যাপ ডাউনলোড করলে
            </span>{" "}
            একদম স্মুথভাবে সব চ্যানেল দেখতে পাবেন — কোনো ঝামেলা নেই!
          </p>

          {/* Features */}
          <div className="mb-6 space-y-2 text-left">
            {[
              "⚡ সুপারফাস্ট স্ট্রিমিং",
              "📺 সব চ্যানেল নিরবচ্ছিন্নভাবে",
              "🔄 অটো রিলোড, কোনো এরর নেই",
              "📱 মোবাইলে পারফেক্ট এক্সপেরিয়েন্স",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-gray-300"
              >
                {f}
              </div>
            ))}
          </div>

          {/* Download button */}
          <a
            href="/downloads/app.apk"
            download
            onClick={dismiss}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-blue-500 transition-all active:scale-95"
          >
            <Download className="h-5 w-5" />
            APK ডাউনলোড করুন — সম্পূর্ণ ফ্রি
          </a>

          {/* Skip */}
          <button
            onClick={dismiss}
            className="mt-3 w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-1"
          >
            এখন নয়, ব্রাউজারেই দেখব
          </button>
        </div>
      </div>
    </div>
  );
}
