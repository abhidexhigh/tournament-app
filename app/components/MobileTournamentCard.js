"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";
import CountdownTimer from "./CountdownTimer";
import { getTournamentIcon } from "../lib/iconSelector";
import { LuUsers, LuClock, LuChevronRight } from "react-icons/lu";
import { formatEntryFee, formatPrizePool } from "../lib/currencyFormatter";

export default function MobileTournamentCard({ tournament }) {
  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  const icon = getTournamentIcon(tournament);
  const isImageUrl = typeof icon === "string" && icon.startsWith("http");

  // Get status color
  const getStatusGradient = () => {
    if (tournament.status === "ongoing") {
      return "from-red-500/20 to-orange-500/20 border-red-500/30";
    }
    return "from-gold/10 to-amber-500/10 border-gold/20";
  };

  return (
    <Link href={`/tournament/${tournament.id}`} className="block">
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#13131a] to-[#0f0f14] transition-all duration-300 active:scale-[0.98]">
        {/* Gradient overlay on hover/active */}
        <div className="from-gold/5 pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent to-transparent opacity-0 transition-opacity group-active:opacity-100" />

        {/* Main Content */}
        <div className="flex items-stretch">
          {/* Left Section - Icon & Prize */}
          <div
            className={`relative flex w-24 flex-col items-center justify-center bg-gradient-to-br ${getStatusGradient()} p-3`}
          >
            {/* Tournament Icon */}
            <div className="mb-2">
              {isImageUrl ? (
                <Image
                  src={icon}
                  alt={`${tournament.title} icon`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-4xl">{icon}</span>
              )}
            </div>

            {/* Prize Pool */}
            {tournament?.prize_pool !== 0 && (
              <div className="text-center">
                <div className="text-gold text-sm leading-tight font-bold">
                  {formatPrizePool(tournament.prize_pool)}
                </div>
                <div className="text-[9px] tracking-wide text-gray-400 uppercase">
                  Prize
                </div>
              </div>
            )}

            {/* Live Indicator */}
            {tournament.status === "ongoing" && (
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-[8px] font-bold text-red-400 uppercase">
                  Live
                </span>
              </div>
            )}
          </div>

          {/* Right Section - Details */}
          <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
            {/* Title & Badge Row */}
            <div className="mb-2">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <h3 className="text-gold-light-text line-clamp-2 text-sm leading-tight font-bold">
                  {tournament.title}
                </h3>
                <LuChevronRight className="mt-0.5 flex-shrink-0 text-gray-500" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={tournament.status}
                  size="sm"
                  className="!px-1.5 !py-0.5 !text-[9px] !capitalize"
                >
                  {tournament.status}
                </Badge>
                {tournament.display_type === "tournament" && (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="!px-1.5 !py-0.5 !text-[9px]"
                  >
                    Tournament
                  </Badge>
                )}
                {tournament.display_type === "event" && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="!px-1.5 !py-0.5 !text-[9px]"
                  >
                    Event
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-xs">
              {/* Players */}
              <div className="flex items-center gap-1.5">
                <LuUsers className="text-gold-dark text-sm" />
                <span className="text-gray-300">
                  <span className="font-semibold text-white">
                    {tournament.participants.length}
                  </span>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-400">
                    {tournament.max_players ?? tournament.maxPlayers}
                  </span>
                </span>
              </div>

              {/* Divider */}
              <div className="h-3 w-px bg-white/10" />

              {/* Entry Fee */}
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Entry:</span>
                <span
                  className={`font-semibold ${tournament.entry_fee ? "text-gold-light-text" : "text-green-400"}`}
                >
                  {tournament.entry_fee
                    ? formatEntryFee(tournament.entry_fee)
                    : "Free"}
                </span>
              </div>
            </div>

            {/* Countdown Row */}
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5">
              <LuClock className="text-gold-dark text-sm" />
              <div className="flex items-center gap-1.5 text-xs">
                {tournament.status === "upcoming" &&
                  isAutomated &&
                  tournament.expires_at && (
                    <>
                      <span className="text-gray-400">Closes in</span>
                      <span className="text-gold font-semibold">
                        <CountdownTimer
                          expiresAt={tournament.expires_at}
                          style="compact"
                        />
                      </span>
                    </>
                  )}

                {tournament.status === "upcoming" && !isAutomated && (
                  <>
                    <span className="text-gray-400">Starts in</span>
                    <span className="text-gold font-semibold">
                      <CountdownTimer
                        date={tournament.date}
                        time={tournament.time}
                        style="compact"
                      />
                    </span>
                  </>
                )}

                {tournament.status === "ongoing" &&
                  isAutomated &&
                  tournament.expires_at && (
                    <>
                      <span className="text-gray-400">Join before</span>
                      <span className="text-gold font-semibold">
                        <CountdownTimer
                          expiresAt={tournament.expires_at}
                          style="compact"
                        />
                      </span>
                    </>
                  )}

                {tournament.status === "ongoing" && !isAutomated && (
                  <span className="font-semibold text-red-400">
                    🔴 Live Now
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar - Player Fill */}
        {/* <div className="h-1 w-full bg-black/30">
          <div
            className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-500"
            style={{
              width: `${Math.min(100, (tournament.participants.length / (tournament.max_players ?? tournament.maxPlayers)) * 100)}%`,
            }}
          />
        </div> */}
      </div>
    </Link>
  );
}
