"use client";

export default function MobileTournamentCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#16161d] p-4">
      {/* Top Row - Icon, Title & Status */}
      <div className="mb-4 flex items-start gap-3">
        {/* Icon Skeleton */}
        <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-xl bg-white/5" />

        {/* Title & Badges Skeleton */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-white/5" />
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded bg-white/5" />
            <div className="h-5 w-20 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-2.5"
          >
            <div className="h-3 w-8 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>

      {/* Countdown Bar Skeleton */}
      <div className="flex h-11 items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3">
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
