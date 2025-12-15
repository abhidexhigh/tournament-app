"use client";

export default function PlayerDashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto">
          {/* Stats Grid Skeleton */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-dark-gray-card/80 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm md:p-5"
              >
                <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                <div className="flex flex-col items-center text-center">
                  {/* Icon Skeleton */}
                  <div className="mb-3 h-11 w-11 animate-pulse rounded-lg border border-white/15 bg-white/10 md:h-12 md:w-12"></div>
                  {/* Value Skeleton */}
                  <div className="h-8 w-16 animate-pulse rounded bg-white/10 md:h-9"></div>
                  {/* Label Skeleton */}
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/5 md:h-4"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Match History Section Skeleton */}
          <div className="mb-8">
            {/* Section Header Skeleton */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-9 w-48 animate-pulse rounded bg-white/10"></div>
            </div>

            {/* Match History Table/Card Skeleton */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-xl">
              <div className="from-dark-card/80 via-dark-card/60 to-dark-card/80 absolute inset-0 bg-gradient-to-br" />

              {/* Mobile Card View Skeleton - Hidden on md+ */}
              <div className="relative block md:hidden">
                <div className="space-y-2 p-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="bg-dark-secondary-accent/90 overflow-hidden rounded-xl border border-white/10"
                    >
                      <div className="flex items-center justify-between gap-2 p-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          {/* Position Badge Skeleton */}
                          <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-lg border border-white/10 bg-white/10"></div>
                          {/* Match Info Skeleton */}
                          <div className="min-w-0 flex-1">
                            <div className="h-5 w-32 animate-pulse rounded bg-white/10"></div>
                            <div className="mt-1.5 h-3.5 w-20 animate-pulse rounded bg-white/5"></div>
                          </div>
                        </div>
                        {/* Prize Skeleton */}
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <div className="h-5 w-16 animate-pulse rounded bg-white/10"></div>
                          <div className="h-4 w-4 animate-pulse rounded bg-white/5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Show More Button Skeleton */}
                <div className="relative px-3 pb-3">
                  <div className="border-gold-dark/30 bg-gold-dark/10 h-10 w-full animate-pulse rounded-lg border"></div>
                </div>
              </div>

              {/* Desktop Table View Skeleton - Hidden on mobile */}
              <div className="relative hidden overflow-x-auto md:block">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      {[
                        "Position",
                        "Match",
                        "Date",
                        "Status",
                        "Score",
                        "Kills",
                        "Deaths",
                        "K/D",
                        "Prize",
                      ].map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase"
                        >
                          <div
                            className={`h-4 animate-pulse rounded bg-white/10 ${
                              header === "Match"
                                ? "w-16"
                                : header === "Position"
                                  ? "w-16"
                                  : "w-12"
                            }`}
                          ></div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body Skeleton */}
                  <tbody className="divide-y divide-white/5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr
                        key={i}
                        className="bg-dark-secondary-accent/90 transition-colors duration-200"
                      >
                        {/* Position */}
                        <td className="px-4 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10"></div>
                          </div>
                        </td>

                        {/* Match Title */}
                        <td className="px-4 py-5">
                          <div className="space-y-2">
                            <div className="h-5 w-40 animate-pulse rounded bg-white/10"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-white/5"></div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-5 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="h-5 w-20 animate-pulse rounded bg-white/10"></div>
                            <div className="h-4 w-14 animate-pulse rounded bg-white/5"></div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-5 text-center whitespace-nowrap">
                          <div className="mx-auto h-6 w-20 animate-pulse rounded-full bg-white/10"></div>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-5 text-right whitespace-nowrap">
                          <div className="ml-auto h-5 w-16 animate-pulse rounded bg-white/10"></div>
                        </td>

                        {/* Kills */}
                        <td className="px-4 py-5 text-center whitespace-nowrap">
                          <div className="mx-auto h-5 w-8 animate-pulse rounded bg-white/10"></div>
                        </td>

                        {/* Deaths */}
                        <td className="px-4 py-5 text-center whitespace-nowrap">
                          <div className="mx-auto h-5 w-8 animate-pulse rounded bg-white/10"></div>
                        </td>

                        {/* K/D Ratio */}
                        <td className="px-4 py-5 text-center whitespace-nowrap">
                          <div className="mx-auto h-5 w-10 animate-pulse rounded bg-white/10"></div>
                        </td>

                        {/* Prize */}
                        <td className="px-4 py-5 text-right whitespace-nowrap">
                          <div className="ml-auto h-8 w-20 animate-pulse rounded-lg bg-white/10"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer Skeleton */}
              <div className="relative border-t border-white/10 bg-white/5 px-3 py-3 md:px-6 md:py-5">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-8">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="h-4 w-14 animate-pulse rounded bg-white/5 md:h-5"></div>
                      <div className="h-5 w-6 animate-pulse rounded bg-white/10 md:h-6 md:w-8"></div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="h-4 w-10 animate-pulse rounded bg-white/5 md:h-5"></div>
                      <div className="h-5 w-4 animate-pulse rounded bg-white/10 md:h-6 md:w-6"></div>
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                      <div className="h-5 w-12 animate-pulse rounded bg-white/5"></div>
                      <div className="h-6 w-6 animate-pulse rounded bg-white/10"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="h-4 w-10 animate-pulse rounded bg-white/5 md:h-5 md:w-14"></div>
                    <div className="h-5 w-16 animate-pulse rounded bg-white/10 md:h-7 md:w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

