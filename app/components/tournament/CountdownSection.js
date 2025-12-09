"use client";

import { LuClock } from "react-icons/lu";
import CountdownTimer, { useCountdown } from "../CountdownTimer";

export default function CountdownSection({ tournament }) {
  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  if (tournament.status !== "upcoming" && tournament.status !== "ongoing") {
    return null;
  }

  // Helper component to render countdown with conditional label
  const CountdownDisplay = ({ label, timerProps, highlighted = false }) => {
    const timeLeft = useCountdown(timerProps);

    // Check if the timer has expired
    if (timeLeft.isExpired) {
      const message = timerProps.expiresAt
        ? "Joining Closed"
        : "Tournament Started";
      return (
        <div
          className={`w-full rounded-lg p-0.5 lg:col-span-2 ${
            highlighted
              ? "border-2 border-red-500/40 bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent"
              : ""
          }`}
        >
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 md:h-auto md:w-auto md:bg-transparent md:p-0">
              <LuClock className="text-lg text-red-400 md:text-base 2xl:text-lg" />
            </div>
            <p className="text-sm font-semibold text-red-400 md:text-sm 2xl:text-base">
              {message}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-full rounded-lg p-0.5 lg:col-span-2 ${
          highlighted
            ? "border-2 border-green-500/40 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent"
            : ""
        }`}
      >
        {/* Mobile: Horizontal compact layout */}
        <div className="flex flex-col items-center md:items-start">
          <p className="text-gold mb-1.5 text-xs font-semibold tracking-wider uppercase md:text-xs md:font-medium md:normal-case 2xl:text-sm">
            {label}
          </p>
          {/* Mobile: Horizontal time display with better spacing */}
          <div className="flex items-center justify-center gap-1.5 md:hidden">
            {timeLeft.days > 0 && (
              <>
                <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
                  <span className="text-lg font-bold tabular-nums text-white">
                    {timeLeft.days.toString().padStart(2, "0")}
                  </span>
                  <span className="text-gold-text text-[9px] font-medium uppercase">days</span>
                </div>
                <span className="text-gold-dark/50 text-base font-bold">:</span>
              </>
            )}
            <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
              <span className="text-lg font-bold tabular-nums text-white">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-gold-text text-[9px] font-medium uppercase">hrs</span>
            </div>
            <span className="text-gold-dark/50 text-base font-bold">:</span>
            <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
              <span className="text-lg font-bold tabular-nums text-white">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-gold-text text-[9px] font-medium uppercase">min</span>
            </div>
            <span className="text-gold-dark/50 text-base font-bold">:</span>
            <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
              <span className="text-lg font-bold tabular-nums text-white">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-gold-text text-[9px] font-medium uppercase">sec</span>
            </div>
          </div>
          {/* Tablet/Desktop: Vertical stacked display */}
          <div className="hidden md:block">
            <CountdownTimer {...timerProps} style="minimal" />
          </div>
        </div>
      </div>
    );
  };

  // Upcoming Automated Tournaments
  if (
    tournament.status === "upcoming" &&
    isAutomated &&
    tournament.expires_at
  ) {
    return (
      <CountdownDisplay
        label="Join before"
        timerProps={{ expiresAt: tournament.expires_at }}
      />
    );
  }

  // Upcoming Non-Automated Tournaments (Events)
  if (
    tournament.status === "upcoming" &&
    !isAutomated &&
    tournament.expires_at
  ) {
    return (
      <CountdownDisplay
        label="Join before"
        timerProps={{ expiresAt: tournament.expires_at }}
      />
    );
  }

  // Ongoing Automated Tournaments
  if (tournament.status === "ongoing" && isAutomated && tournament.expires_at) {
    return (
      <CountdownDisplay
        label="Join before"
        timerProps={{ expiresAt: tournament.expires_at }}
        highlighted={true}
      />
    );
  }

  // Ongoing Events with expiration
  if (
    tournament.status === "ongoing" &&
    !isAutomated &&
    tournament.expires_at
  ) {
    return (
      <CountdownDisplay
        label="Join before"
        timerProps={{ expiresAt: tournament.expires_at }}
      />
    );
  }

  // Ongoing Non-Automated without expiration
  if (
    tournament.status === "ongoing" &&
    !isAutomated &&
    !tournament.expires_at
  ) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent p-0.5 lg:col-span-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-red-500/20 text-lg 2xl:h-10 2xl:w-10 2xl:text-xl">
          ⏰
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gold-text text-xs font-medium tracking-wider 2xl:text-sm">
            Status
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-400 2xl:h-2.5 2xl:w-2.5"></div>
            <p className="text-sm font-semibold text-red-400 2xl:text-base">
              Tournament Started
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-300 2xl:text-sm">
            Matches are underway • New entries are closed
          </p>
        </div>
      </div>
    );
  }

  return null;
}
