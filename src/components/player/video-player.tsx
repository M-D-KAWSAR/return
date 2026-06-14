"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Loader2,
  Settings,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicChannel } from "@/types";

type ExtendedVideo = HTMLVideoElement & {
  webkitSupportsFullscreen?: boolean;
  webkitDisplayingFullscreen?: boolean;
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
};

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("rz_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("rz_session", id);
  }
  return id;
}

interface VideoPlayerProps {
  channel: PublicChannel | null;
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualities, setQualities] = useState<{ index: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewIdRef = useRef<string | null>(null);
  const watchStartRef = useRef<number>(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const handlePlayerClick = useCallback(() => {
    revealControls();
  }, [revealControls]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    stopHeartbeat();
  }, [stopHeartbeat]);

  const loadStream = useCallback(
    (streamUrl: string, channelId: string) => {
      const video = videoRef.current;
      if (!video) return;

      setLoading(true);
      setError(null);
      destroyHls();
      viewIdRef.current = null;

      // Record view and start heartbeat after stream loads
      const sessionId = getSessionId();
      fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, sessionId }),
      })
        .then((r) => r.json())
        .then(({ viewId }) => {
          if (!viewId) return;
          viewIdRef.current = viewId;
          watchStartRef.current = Date.now();
          heartbeatRef.current = setInterval(() => {
            const seconds = Math.floor((Date.now() - watchStartRef.current) / 1000);
            fetch("/api/analytics/heartbeat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ viewId, watchSeconds: seconds }),
            }).catch(() => {});
          }, 30_000);
        })
        .catch(() => {});

      try {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });

          hlsRef.current = hls;

          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            setLoading(false);
            const levels = data.levels.map((level, index) => ({
              index,
              label: level.height
                ? `${level.height}p`
                : level.bitrate
                  ? `${Math.round(level.bitrate / 1000)}kbps`
                  : `Level ${index + 1}`,
            }));
            setQualities([{ index: -1, label: "Auto" }, ...levels]);
            setCurrentQuality(-1);
            video.play().catch(() => {});
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              setError("Stream playback failed. Please try again.");
              setLoading(false);
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", () => {
            setLoading(false);
            video.play().catch(() => {});
          });
        } else {
          throw new Error("HLS is not supported in this browser");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Playback error");
        setLoading(false);
      }
    },
    [destroyHls]
  );

  useEffect(() => {
    if (channel) {
      loadStream(channel.streamUrl, channel.id);
    } else {
      destroyHls();
      if (videoRef.current) {
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
    }

    return () => destroyHls();
  }, [channel, loadStream, destroyHls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const video = videoRef.current as ExtendedVideo | null;
    const handleWebkitFullscreen = () => {
      setIsFullscreen(!!(video?.webkitDisplayingFullscreen));
    };
    video?.addEventListener("webkitbeginfullscreen", handleWebkitFullscreen);
    video?.addEventListener("webkitendfullscreen", handleWebkitFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video?.removeEventListener("webkitbeginfullscreen", handleWebkitFullscreen);
      video?.removeEventListener("webkitendfullscreen", handleWebkitFullscreen);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current as ExtendedVideo | null;
    const container = containerRef.current;

    // iOS Safari: only <video> supports fullscreen
    if (video?.webkitSupportsFullscreen) {
      if (video.webkitDisplayingFullscreen) {
        video.webkitExitFullscreen?.();
      } else {
        video.webkitEnterFullscreen?.();
      }
      return;
    }

    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen?.();
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const changeQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQuality(index);
    }
    setShowQualityMenu(false);
  };

  return (
    <div
      ref={containerRef}
      className="gradient-border relative overflow-hidden rounded-2xl glass-strong shadow-2xl shadow-purple-900/20"
    >
      <div
        className="player-container relative bg-black"
        onClick={handlePlayerClick}
        onMouseMove={revealControls}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          playsInline
          muted={muted}
          autoPlay
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-gray-300">{error}</p>
            {channel && (
              <button
                onClick={() => loadStream(channel.streamUrl, channel.id)}
                className="mt-2 rounded-lg bg-purple-600 px-4 py-2 text-sm hover:bg-purple-500"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!channel && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
            <div className="text-6xl font-bold gradient-text opacity-30">RZ</div>
            <p className="mt-2 text-sm text-gray-500">Select a channel to start watching</p>
          </div>
        )}

        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity focus-within:opacity-100",
            showControls ? "opacity-100" : "opacity-0 hover:opacity-100"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {qualities.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
                    aria-label="Quality settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 min-w-[120px] rounded-xl glass-strong py-1 shadow-xl">
                      {qualities.map((q) => (
                        <button
                          key={q.index}
                          onClick={() => changeQuality(q.index)}
                          className={cn(
                            "block w-full px-4 py-2 text-left text-sm hover:bg-white/10",
                            currentQuality === q.index
                              ? "text-purple-light"
                              : "text-gray-300"
                          )}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {channel && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 items-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-red-500" />
            </span>
            <h2 className="text-lg font-semibold text-white">{channel.title}</h2>
          </div>
          {channel.description && (
            <p className="mt-1 text-sm text-gray-400">{channel.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
