"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X, Share, PlusSquare } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [apkExists, setApkExists] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Dismissed before?
    if (sessionStorage.getItem("rz_install_dismissed")) {
      setDismissed(true);
      return;
    }

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as unknown as { standalone?: boolean }).standalone;
    setIsIos(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if APK exists
    fetch("/downloads/app.apk", { method: "HEAD" })
      .then((r) => r.ok && setApkExists(true))
      .catch(() => {});

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("rz_install_dismissed", "1");
    setDismissed(true);
  };

  if (isInstalled || dismissed) return null;
  if (!installPrompt && !isIos && !apkExists) return null;

  return (
    <div className="mb-4 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-purple-900/30 p-4 sm:p-5">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-white/5 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25">
            <Image
              src="/icons/icon-72.png"
              alt="Return Zero"
              width={40}
              height={40}
              className="rounded-xl"
              unoptimized
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-white">Return Zero App</p>
            <p className="text-sm text-gray-400">
              Install on your phone for the best experience
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Android Chrome install prompt */}
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500"
            >
              <Smartphone className="h-4 w-4" />
              Install App
            </button>
          )}

          {/* APK Download */}
          {apkExists && (
            <a
              href="/downloads/app.apk"
              download
              className="flex items-center gap-2 rounded-xl glass border border-purple-500/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Download APK
            </a>
          )}

          {/* iOS guide */}
          {isIos && (
            <button
              onClick={() => setShowIosGuide(!showIosGuide)}
              className="flex items-center gap-2 rounded-xl glass border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:text-white"
            >
              <PlusSquare className="h-4 w-4" />
              Add to iPhone
            </button>
          )}
        </div>

        {/* iOS guide steps */}
        {showIosGuide && isIos && (
          <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm text-gray-300">
            <p className="mb-2 font-semibold text-white">Install on iPhone/iPad:</p>
            <ol className="space-y-1.5 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">1.</span>
                Tap the <Share className="inline h-4 w-4 text-blue-400" /> Share button in Safari
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">2.</span>
                Scroll down and tap <strong className="text-white">Add to Home Screen</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">3.</span>
                Tap <strong className="text-white">Add</strong> — done!
              </li>
            </ol>
          </div>
        )}

        {/* No prompt but on Android */}
        {!installPrompt && !isIos && !apkExists && (
          <p className="mt-3 text-xs text-gray-500">
            Open in Chrome on Android to install, or use the Download APK button.
          </p>
        )}
      </div>
    </div>
  );
}
