"use client";

import CountdownTimer from "../CountdownTimer";

export default function CountdownSection({ tournament }) {
  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  if (tournament.status !== "upcoming" && tournament.status !== "ongoing") {
    return null;
  }

  // Upcoming Automated Tournaments
  if (
    tournament.status === "upcoming" &&
    isAutomated &&
    tournament.expires_at
  ) {
    return (
      <div className="lg:col-span-2 p-0.5 rounded-lg">
        <p className="text-gold-text font-medium text-xs tracking-wider">
          Join before
        </p>
        <CountdownTimer
          expiresAt={tournament.expires_at}
          label="Join before"
          style="minimal"
        />
      </div>
    );
  }

  // Upcoming Non-Automated Tournaments (Events)
  if (
    tournament.status === "upcoming" &&
    !isAutomated &&
    tournament.expires_at
  ) {
    return (
      <div className="lg:col-span-2 p-0.5">
        <p className="text-gold-text font-medium text-xs tracking-wider">
          Join before
        </p>
        <CountdownTimer
          expiresAt={tournament.expires_at}
          label="Starts in"
          style="minimal"
        />
      </div>
    );
  }

  // Ongoing Automated Tournaments
  if (tournament.status === "ongoing" && isAutomated && tournament.expires_at) {
    return (
      <div className="lg:col-span-2 p-0.5 rounded-lg border-2 border-green-500/40 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent">
        <p className="text-gold-text font-medium text-xs tracking-wider">
          Join before
        </p>
        <CountdownTimer
          expiresAt={tournament.expires_at}
          label="Join before"
          style="minimal"
        />
      </div>
    );
  }

  // Ongoing Events with expiration
  if (
    tournament.status === "ongoing" &&
    !isAutomated &&
    tournament.expires_at
  ) {
    return (
      <div className="lg:col-span-2 p-0.5">
        <p className="text-gold-text font-medium text-xs tracking-wider">
          Join before
        </p>
        <CountdownTimer
          expiresAt={tournament.expires_at}
          label="Ends in"
          style="minimal"
        />
      </div>
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
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-red-500/20 flex items-center justify-center text-lg">
          ⏰
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gold-text font-medium text-xs tracking-wider">
            Status
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
            <p className="text-red-400 font-semibold text-sm">
              Tournament Started
            </p>
          </div>
          <p className="text-gray-300 text-xs mt-1">
            Matches are underway • New entries are closed
          </p>
        </div>
      </div>
    );
  }

  return null;
}
