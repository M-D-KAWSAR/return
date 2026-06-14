export function getAllowedDomains(): string[] {
  const raw = process.env.ALLOWED_DOMAINS || "localhost,localhost:3000";
  return raw.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
}

export function isDomainAllowed(request: Request): boolean {
  const allowed = getAllowedDomains();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  const checkHost = (value: string | null): boolean => {
    if (!value) return false;
    try {
      const url = value.startsWith("http") ? new URL(value) : null;
      const hostname = url ? url.host.toLowerCase() : value.toLowerCase();
      return allowed.some(
        (d) => hostname === d || hostname.endsWith(`.${d}`)
      );
    } catch {
      return allowed.includes(value.toLowerCase());
    }
  };

  if (origin && checkHost(origin)) return true;
  if (referer && checkHost(referer)) return true;
  if (host && checkHost(host)) return true;

  return process.env.NODE_ENV === "development";
}

export function validateAntiHotlink(request: Request): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return isDomainAllowed(request);
}
