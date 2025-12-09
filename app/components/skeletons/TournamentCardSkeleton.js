"use client";

export default function TournamentCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#101313] p-4 sm:px-6 sm:py-1">
      {/* Desktop Layout (lg+) */}
      <div className="hidden min-h-[90px] items-center gap-4 lg:flex">
        {/* Left Section: Icon + Title */}
        <div className="flex min-w-0 flex-1 items-center gap-6">
          {/* Icon */}
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-full bg-white/5 2xl:h-24 2xl:w-24" />

          {/* Title & Badges */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-7 w-64 animate-pulse rounded bg-white/5" />
            <div className="flex gap-2">
              <div className="h-5 w-20 animate-pulse rounded bg-white/5" />
              <div className="h-5 w-24 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-nowrap gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex w-36 items-center gap-2">
              <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-white/5" />
              <div className="space-y-1.5">
                <div className="h-3 w-12 animate-pulse rounded bg-white/5" />
                <div className="h-5 w-16 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Section: Countdown + Prize */}
        <div className="flex items-center gap-4">
          {/* Countdown */}
          <div className="hidden w-44 items-center gap-2 border-x border-white/5 px-4 sm:flex">
            <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-white/5" />
            <div className="space-y-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          {/* Prize Pool */}
          <div className="w-40 flex-shrink-0">
            <div className="ml-auto flex flex-col items-end gap-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-6 w-24 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout (sm to lg) */}
      <div className="hidden flex-col gap-4 py-2 sm:flex lg:hidden">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-full bg-white/5" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-5 w-20 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-14 w-32 animate-pulse rounded-lg bg-white/5" />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-white/10" />
              <div className="space-y-1">
                <div className="h-2 w-10 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
