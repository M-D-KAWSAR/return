export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header skeleton */}
      <div className="border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-white/10" />
          <div className="flex gap-3">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Player skeleton */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="aspect-video w-full animate-pulse bg-white/5" />
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500/40" />
              <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Category nav skeleton */}
        <div className="mb-6 flex gap-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 flex-shrink-0 animate-pulse rounded-xl bg-white/10"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* Channel grid skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="aspect-video w-full animate-pulse bg-white/10" />
              <div className="p-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
