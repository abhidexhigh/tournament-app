"use client";

export default function ProfileSkeleton() {
  return (
    <div className="bg-dark-primary relative min-h-screen overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-gold-dark/5 absolute top-0 right-0 h-[600px] w-[600px] rounded-full blur-[120px]"></div>
        <div className="bg-gold-dark/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Navigation Bar Skeleton */}
        <nav className="mb-6 flex items-center justify-between sm:mb-10">
          <div className="h-10 w-32 animate-pulse rounded-full bg-white/5 sm:w-44"></div>
          <div className="flex items-center gap-2">
            <div className="hidden h-4 w-24 animate-pulse rounded bg-white/5 sm:block"></div>
            <div className="bg-gold-dark/30 h-1.5 w-1.5 animate-pulse rounded-full"></div>
          </div>
        </nav>

        {/* Hero Section Skeleton */}
        <div className="border-gold-dark/20 bg-dark-gray-card relative mb-6 overflow-hidden rounded-2xl border p-5 sm:mb-8 sm:rounded-3xl sm:p-8 lg:p-10">
          {/* Decorative elements */}
          <div className="bg-gold-dark/10 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl sm:h-64 sm:w-64"></div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Avatar + User Info Skeleton */}
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
              {/* Avatar Skeleton */}
              <div className="relative flex-shrink-0">
                <div className="h-20 w-20 animate-pulse rounded-full bg-white/10 sm:h-28 sm:w-28"></div>
                <div className="border-dark-primary bg-gold-dark/30 absolute -right-1 -bottom-1 h-7 w-7 animate-pulse rounded-full border-2 sm:h-9 sm:w-9"></div>
              </div>

              {/* User Info Skeleton */}
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <div className="h-7 w-40 animate-pulse rounded bg-white/10 sm:h-8 sm:w-48"></div>
                <div className="h-4 w-48 animate-pulse rounded bg-white/5 sm:w-56"></div>
                <div className="mt-1 flex gap-2">
                  <div className="bg-gold-dark/20 h-6 w-20 animate-pulse rounded-full"></div>
                  <div className="h-6 w-24 animate-pulse rounded bg-white/5"></div>
                </div>
              </div>
            </div>

            {/* Right: Balance + Buy Button Skeleton */}
            <div className="border-gold-dark/30 bg-dark-primary/50 flex flex-col items-center gap-4 rounded-2xl border p-4 sm:flex-row sm:gap-6 sm:p-5 lg:p-6">
              {/* Balance Skeleton */}
              <div className="text-center">
                <div className="mx-auto mb-2 h-3 w-16 animate-pulse rounded bg-white/5"></div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-white/10"></div>
                  <div className="h-10 w-24 animate-pulse rounded bg-white/10 sm:w-32"></div>
                </div>
              </div>

              {/* Divider */}
              <div className="bg-gold-dark/30 hidden h-14 w-px sm:block"></div>
              <div className="bg-gold-dark/30 h-px w-full sm:hidden"></div>

              {/* Buy Button Skeleton */}
              <div className="bg-gold-dark/30 h-12 w-full animate-pulse rounded-xl sm:h-14 sm:w-44"></div>
            </div>
          </div>

          {/* Stripe Badge Skeleton */}
          <div className="mt-4 flex items-center justify-center gap-2 lg:justify-end">
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-white/5"></div>
            <div className="h-3 w-32 animate-pulse rounded bg-white/5"></div>
          </div>
        </div>

        {/* Settings Cards Grid Skeleton */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Game ID Card Skeleton */}
          <div className="border-gold-dark/20 bg-dark-gray-card relative overflow-hidden rounded-2xl border p-5 sm:p-6">
            <div className="bg-gold-dark/10 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gold-dark/20 h-10 w-10 animate-pulse rounded-xl"></div>
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10"></div>
                </div>
                <div className="bg-gold-dark/20 h-8 w-14 animate-pulse rounded-lg"></div>
              </div>
              <div className="bg-dark-primary/50 rounded-xl p-4">
                <div className="h-5 w-32 animate-pulse rounded bg-white/10"></div>
                <div className="mt-2 h-3 w-44 animate-pulse rounded bg-white/5"></div>
              </div>
            </div>
          </div>

          {/* Rank Card Skeleton */}
          <div className="border-gold-dark/20 bg-dark-gray-card relative overflow-hidden rounded-2xl border p-5 sm:p-6">
            <div className="bg-gold-dark/10 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gold-dark/20 h-10 w-10 animate-pulse rounded-xl"></div>
                  <div className="h-5 w-14 animate-pulse rounded bg-white/10"></div>
                </div>
                <div className="bg-gold-dark/20 h-8 w-14 animate-pulse rounded-lg"></div>
              </div>
              <div className="bg-dark-primary/50 flex items-center gap-4 rounded-xl p-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-white/10 sm:h-16 sm:w-16"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-white/5"></div>
                  <div className="h-6 w-24 animate-pulse rounded bg-white/10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Clan Card Skeleton */}
          <div className="border-gold-dark/20 bg-dark-gray-card relative overflow-hidden rounded-2xl border p-5 sm:p-6">
            <div className="bg-gold-dark/10 absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gold-dark/20 h-10 w-10 animate-pulse rounded-xl"></div>
                  <div className="h-5 w-12 animate-pulse rounded bg-white/10"></div>
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-white/5"></div>
              </div>
              <div className="bg-dark-primary/50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-white/10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-28 animate-pulse rounded bg-white/10"></div>
                    <div className="h-3 w-16 animate-pulse rounded bg-white/5"></div>
                    <div className="flex gap-4">
                      <div className="h-3 w-12 animate-pulse rounded bg-white/5"></div>
                      <div className="h-3 w-16 animate-pulse rounded bg-white/5"></div>
                    </div>
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

