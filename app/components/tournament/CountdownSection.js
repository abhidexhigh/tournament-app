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
          className={`lg:col-span-2 p-0.5 rounded-lg ${
            highlighted
              ? "border-2 border-red-500/40 bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <LuClock className="text-base 2xl:text-lg text-red-400" />
            <p className="text-red-400 font-semibold text-sm 2xl:text-base">
              {message}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`lg:col-span-2 p-0.5 rounded-lg ${
          highlighted
            ? "border-2 border-green-500/40 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent"
            : ""
        }`}
      >
        <p className="text-gold-text font-medium text-xs 2xl:text-sm tracking-wider">
          {label}
        </p>
        <CountdownTimer {...timerProps} style="minimal" />
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
      <div className="lg:col-span-3 flex items-start gap-2 p-0.5 rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent">
        <div className="flex-shrink-0 w-8 h-8 2xl:w-10 2xl:h-10 rounded-md bg-red-500/20 flex items-center justify-center text-lg 2xl:text-xl">
          ⏰
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gold-text font-medium text-xs 2xl:text-sm tracking-wider">
            Status
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 2xl:h-2.5 2xl:w-2.5 rounded-full bg-red-400 animate-pulse"></div>
            <p className="text-red-400 font-semibold text-sm 2xl:text-base">
              Tournament Started
            </p>
          </div>
          <p className="text-gray-300 text-xs 2xl:text-sm mt-1">
            Matches are underway • New entries are closed
          </p>
        </div>
      </div>
    );
  }

  return null;
}
