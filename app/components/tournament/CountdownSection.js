"use client";

import { LuClock } from "react-icons/lu";
import CountdownTimer, { useCountdown } from "../CountdownTimer";

export default function CountdownSection({ tournament }) {
  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  // Only show countdown for upcoming tournaments
  // Once tournament is started (ongoing), stop the timer
  if (tournament.status !== "upcoming") {
    return null;
  }

  // Helper component to render countdown with conditional label
  const CountdownDisplay = ({ label, timerProps, highlighted = false }) => {
    const timeLeft = useCountdown(timerProps);

    // Check if the timer has expired
    if (timeLeft.isExpired) {
      const message = isAutomated ? "Joining Closed" : "Tournament Started";
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
                  <span className="text-lg font-bold text-white tabular-nums">
                    {timeLeft.days.toString().padStart(2, "0")}
                  </span>
                  <span className="text-gold-text text-[9px] font-medium uppercase">
                    days
                  </span>
                </div>
                <span className="text-gold-dark/50 text-base font-bold">:</span>
              </>
            )}
            <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
              <span className="text-lg font-bold text-white tabular-nums">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-gold-text text-[9px] font-medium uppercase">
                hrs
              </span>
            </div>
            <span className="text-gold-dark/50 text-base font-bold">:</span>
            <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
              <span className="text-lg font-bold text-white tabular-nums">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-gold-text text-[9px] font-medium uppercase">
                min
              </span>
            </div>
            <span className="text-gold-dark/50 text-base font-bold">:</span>
            <div className="border-gold-dark/20 bg-dark-primary/80 flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5">
              <span className="text-lg font-bold text-white tabular-nums">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-gold-text text-[9px] font-medium uppercase">
                sec
              </span>
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

  // Simplified: Always use expires_at for countdown (both tournaments and events)
  if (tournament.expires_at) {
    const label = "Starts in"; // TODO: Add "Join before" for automated tournaments
    const isHighlighted = tournament.status === "ongoing";

    return (
      <CountdownDisplay
        label={label}
        timerProps={{ expiresAt: tournament.expires_at }}
        // highlighted={isHighlighted}
      />
    );
  }

  return null;
}
