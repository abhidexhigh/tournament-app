"use client";

import Card from "../Card";

export default function TournamentDetailsSkeleton() {
  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-8 lg:px-8">
      <div className="max-w-main mx-auto">
        {/* Back Button Skeleton */}
        <div className="mb-4 sm:mb-6">
          <div className="h-8 w-32 animate-pulse rounded bg-white/5" />
        </div>

        {/* Tournament Header Skeleton */}
        <Card glass className="relative mb-4 overflow-hidden">
          {/* Main Content */}
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Icon Section */}
            <div className="flex flex-1 items-start space-x-3 sm:items-center sm:space-x-4 lg:flex-shrink-0 lg:flex-grow-0 lg:basis-auto">
              {/* Icon */}
              <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-xl bg-white/5 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />

              <div className="min-w-0 flex-1 space-y-2">
                {/* Badges Row */}
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <div className="h-5 w-16 animate-pulse rounded bg-white/5" />
                  <div className="h-5 w-20 animate-pulse rounded bg-white/5" />
                </div>

                {/* Title */}
                <div className="h-7 w-48 animate-pulse rounded bg-white/5 sm:w-64 lg:w-80" />

                {/* Host Info */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
                  <div className="h-5 w-5 animate-pulse rounded-full bg-white/5" />
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:justify-end md:gap-3 lg:flex-shrink-0 lg:flex-nowrap">
              {/* Countdown Placeholder */}
              <div className="col-span-2 md:w-auto">
                <div className="h-16 w-full animate-pulse rounded-lg bg-white/5 md:w-[140px] lg:w-[160px]" />
              </div>

              {/* Stat Cards */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-white/5 p-3"
                >
                  <div className="h-5 w-5 animate-pulse rounded bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="my-4 h-px w-full animate-pulse bg-white/5" />

          {/* Bottom Section */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Clan Battle Details Placeholder */}
            <div className="hidden h-10 w-64 animate-pulse rounded bg-white/5 lg:block" />

            {/* Action Buttons */}
            <div className="flex w-full flex-col gap-2 md:flex-row md:justify-end lg:ml-auto lg:w-auto lg:min-w-[200px]">
              <div className="h-10 w-full animate-pulse rounded bg-white/5 md:w-32" />
            </div>
          </div>
        </Card>

        {/* Tabs Skeleton */}
        <div className="mt-6">
          {/* Tab Headers */}
          <div className="mb-4 flex gap-4 border-b border-white/10 pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-24 animate-pulse rounded bg-white/5"
              />
            ))}
          </div>

          {/* Tab Content */}
          <Card glass padding="p-6" className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 w-full animate-pulse rounded bg-white/5"
                />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

