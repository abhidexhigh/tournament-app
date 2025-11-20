"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";
import CountdownTimer, { useCountdown } from "./CountdownTimer";
import { getTournamentIcon } from "../lib/iconSelector";
import { LuCalendarDays, LuUsers, LuClock, LuTrophy } from "react-icons/lu";
import { TbMoneybag } from "react-icons/tb";
import {
  getPrizePoolDisplayDual,
  getEntryFeeDisplayDual,
} from "../lib/prizeCalculator";

export default function TournamentCard({ tournament }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  // Helper component to render countdown with proper styling
  const CountdownDisplay = ({ label, timerProps }) => {
    const timeLeft = useCountdown(timerProps);

    // Check if the timer has expired
    if (timeLeft.isExpired) {
      const message = timerProps.expiresAt
        ? "Joining Closed"
        : "Tournament Started";
      return (
        <div className="flex items-center gap-2 w-full sm:w-40 lg:w-44 border-x border-white/20 px-4 mx-auto">
          <div className="w-8 h-8 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
            <LuClock className="text-base sm:text-lg 2xl:text-xl text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-red-400 font-bold text-wrap text-xs sm:text-sm 2xl:text-base truncate">
              {message}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 w-full sm:w-40 lg:w-44 border-x border-white/20 px-4 mx-auto">
        <div className="w-8 h-8 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
          <LuClock className="text-base sm:text-lg 2xl:text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-xs 2xl:text-sm text-gray-400 font-medium whitespace-nowrap">
            {label}
          </div>
          <div className="text-gold-light-text font-bold text-xs sm:text-sm 2xl:text-base truncate">
            <CountdownTimer {...timerProps} style="minimal" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Link href={`/tournament/${tournament.id}`} className="block">
      <div className="tournament-card group relative">
        <div className="status-stripe overflow-hidden" />

        <div className="p-4 sm:px-6 sm:py-1 border border-[#ffb80033] rounded-xl min-h-[104px]">
          <div className="flex flex-col lg:flex-row !items-center lg:items-start gap-4">
            {/* Left Section: Icon + Title + Badges */}
            <div className="flex items-start gap-3 sm:gap-6 flex-1 min-w-0 w-full">
              {/* Tournament Icon */}
              <div className="flex-shrink-0">
                {(() => {
                  const icon = getTournamentIcon(tournament);
                  const isImageUrl =
                    typeof icon === "string" && icon.startsWith("http");

                  if (isImageUrl) {
                    return (
                      <Image
                        src={icon}
                        alt={`${tournament.title} icon`}
                        width={96}
                        height={96}
                        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 2xl:w-24 2xl:h-24 object-contain"
                        unoptimized
                      />
                    );
                  }

                  return (
                    <span className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl">
                      {icon}
                    </span>
                  );
                })()}
              </div>

              {/* Title and Badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap mb-2">
                  <h3 className="sm:hidden text-xl sm:text-xl lg:text-2xl 2xl:text-2xl font-black text-gold-light-text group-hover:text-gold transition-colors duration-300 tracking-tight">
                    {tournament.title}
                  </h3>
                </div>

                <div className="items-center gap-2 flex-wrap mb-3">
                  <h3 className="hidden sm:block text-xl sm:text-xl lg:text-xl 2xl:text-2xl font-black text-gold-light-text group-hover:text-gold transition-colors duration-300 tracking-tight mb-1">
                    {tournament.title}
                  </h3>
                  <span className="flex items-center gap-2">
                    <Badge
                      variant={tournament.status}
                      size="sm"
                      className="!capitalize"
                    >
                      {tournament.status}
                    </Badge>
                    {tournament.display_type === "tournament" && (
                      <Badge
                        variant="primary"
                        size="sm"
                        className="font-semibold"
                      >
                        ⚡ Tournament
                      </Badge>
                    )}
                    {tournament.display_type === "event" && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="font-semibold"
                      >
                        🎪 Event
                      </Badge>
                    )}
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "clan_battle" && (
                      <Badge variant="warning" size="sm">
                        ⚔️ Clan
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-3 sm:gap-2 lg:gap-4">
              {/* Players */}
              <div className="flex items-center gap-2 w-full sm:w-28 lg:w-32">
                <div className="w-8 h-8 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <LuUsers className="text-base sm:text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] sm:text-xs 2xl:text-sm text-gray-400 font-medium whitespace-nowrap">
                    Players
                  </div>
                  <div className="text-gold-light-text font-bold text-sm sm:text-base 2xl:text-lg truncate">
                    {tournament.participants.length}/
                    {tournament.max_players ?? tournament.maxPlayers}
                  </div>
                </div>
              </div>

              {/* Entry Fee */}
              <div className="flex items-center gap-2 w-full sm:w-32 lg:w-36">
                <div className="w-8 h-8 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <TbMoneybag className="text-base sm:text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] sm:text-xs 2xl:text-sm text-gray-400 font-medium whitespace-nowrap">
                    Entry Fee
                  </div>
                  <div className="text-gold-light-text font-bold text-sm sm:text-base 2xl:text-lg truncate">
                    {tournament.entry_fee ? (
                      `$${getEntryFeeDisplayDual(tournament).usd}`
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-2 w-full sm:w-32 lg:w-36">
                <div className="w-8 h-8 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <LuCalendarDays className="text-base sm:text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] sm:text-xs 2xl:text-sm text-gray-400 font-medium whitespace-nowrap">
                    Schedule
                  </div>
                  <div className="text-gold-light-text font-bold text-xs sm:text-sm 2xl:text-base truncate">
                    {formatDate(tournament.date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Countdown + Prize Pool */}
            <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Countdown Logic */}
              {tournament.status === "upcoming" &&
                isAutomated &&
                tournament.expires_at && (
                  <CountdownDisplay
                    label="Join Before"
                    timerProps={{ expiresAt: tournament.expires_at }}
                  />
                )}

              {tournament.status === "upcoming" && !isAutomated && (
                <CountdownDisplay
                  label="Starts In"
                  timerProps={{ date: tournament.date, time: tournament.time }}
                />
              )}

              {tournament.status === "ongoing" &&
                isAutomated &&
                tournament.expires_at && (
                  <CountdownDisplay
                    label="Join Before"
                    timerProps={{ expiresAt: tournament.expires_at }}
                  />
                )}

              {tournament.status === "ongoing" && !isAutomated && (
                <div className="flex items-center gap-2 w-full sm:w-40 lg:w-44 border-x border-white/20 px-4 mx-auto">
                  <div className="w-8 h-8 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <LuClock className="text-base sm:text-lg 2xl:text-xl text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs 2xl:text-sm text-gray-400 font-medium whitespace-nowrap">
                      Status
                    </div>
                    <div className="text-red-400 font-bold text-xs sm:text-sm 2xl:text-base truncate">
                      Started
                    </div>
                  </div>
                </div>
              )}

              {/* Prize Pool */}
              {/* {tournament?.prize_pool !== 0 && ( */}
              <div className="flex-shrink-0 w-full sm:w-32 lg:w-36">
                {tournament?.prize_pool !== 0 && (
                  <div className="prize-display">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] sm:text-xs 2xl:text-sm text-gold font-medium mb-1 tracking-wider whitespace-nowrap">
                        Prize Pool
                      </div>
                      <div className="text-gold font-black text-xl sm:text-xl 2xl:text-2xl leading-none mb-1">
                        ${getPrizePoolDisplayDual(tournament).usd}
                      </div>
                      <div className="text-gold-dark text-xs sm:text-sm 2xl:text-base font-semibold">
                        {getPrizePoolDisplayDual(tournament).diamonds} 💎
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
