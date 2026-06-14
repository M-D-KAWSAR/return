import { getBaseUrl } from "./utils";

const BLOCKED_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?/i,
  /^https?:\/\/127\./,
  /^https?:\/\/0\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\./,   // cloud metadata (AWS/GCP)
  /^https?:\/\/\[::1\]/,      // IPv6 loopback
  /^https?:\/\/\[fc/i,        // IPv6 private
  /^https?:\/\/\[fd/i,        // IPv6 private
  /^file:/i,
  /^ftp:/i,
];

export function isSafeProxyUrl(url: string): boolean {
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  return !BLOCKED_PATTERNS.some((re) => re.test(url));
}

export function encodeProxyUrl(url: string): string {
  return Buffer.from(url, "utf-8").toString("base64url");
}

export function decodeProxyUrl(encoded: string): string | null {
  try {
    return Buffer.from(encoded, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}

export function buildProxyUrl(token: string, upstreamUrl: string): string {
  const base = getBaseUrl();
  const encoded = encodeProxyUrl(upstreamUrl);
  return `${base}/api/stream/proxy?token=${encodeURIComponent(token)}&url=${encoded}`;
}

export function resolveUrl(base: string, relative: string): string {
  if (relative.startsWith("http://") || relative.startsWith("https://")) {
    return relative;
  }
  const baseUrl = new URL(base);
  return new URL(relative, baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, "/")).href;
}

export function rewriteManifest(
  content: string,
  baseUrl: string,
  token: string
): string {
  const lines = content.split("\n");
  const rewritten: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      rewritten.push(line);
      continue;
    }

    const absolute = resolveUrl(baseUrl, trimmed);
    rewritten.push(buildProxyUrl(token, absolute));
  }

  return rewritten.join("\n");
}

export function getContentType(url: string, fallback?: string | null): string {
  if (fallback) return fallback;
  if (url.includes(".m3u8")) return "application/vnd.apple.mpegurl";
  if (url.includes(".ts")) return "video/mp2t";
  if (url.includes(".mp4")) return "video/mp4";
  return "application/octet-stream";
}
