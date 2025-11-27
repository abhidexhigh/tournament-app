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
        <div className="mx-auto flex w-full items-center gap-2 border-x border-white/20 px-4 sm:w-40 lg:w-44">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
            <LuClock className="text-base text-red-400 sm:text-lg 2xl:text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-wrap text-red-400 sm:text-sm 2xl:text-base">
              {message}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full items-center gap-2 border-x border-white/20 px-4 sm:w-40 lg:w-44">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
          <LuClock className="text-base sm:text-lg 2xl:text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium whitespace-nowrap text-gray-400 sm:text-xs 2xl:text-sm">
            {label}
          </div>
          <div className="text-gold-light-text truncate text-xs font-bold sm:text-sm 2xl:text-base">
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

        <div className="rounded-xl border border-[#ffb80033] p-4 sm:px-6 sm:py-1">
          <div className="flex min-h-[90px] flex-col !items-center gap-4 lg:flex-row lg:items-start">
            {/* Left Section: Icon + Title + Badges */}
            <div className="flex w-full min-w-0 flex-1 items-start gap-3 sm:gap-6">
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
                        className="h-12 w-12 object-contain sm:h-16 sm:w-16 lg:h-20 lg:w-20 2xl:h-24 2xl:w-24"
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
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-start gap-2">
                  <h3 className="text-gold-light-text group-hover:text-gold text-xl font-black tracking-tight transition-colors duration-300 sm:hidden sm:text-xl lg:text-2xl 2xl:text-2xl">
                    {tournament.title}
                  </h3>
                </div>

                <div className="mb-3 flex-wrap items-center gap-2">
                  <h3 className="text-gold-light-text group-hover:text-gold mb-1 hidden text-xl font-black tracking-tight transition-colors duration-300 sm:block sm:text-xl lg:text-xl 2xl:text-2xl">
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
                        Tournament
                      </Badge>
                    )}
                    {tournament.display_type === "event" && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="font-semibold"
                      >
                        Event
                      </Badge>
                    )}
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "clan_battle" && (
                      <Badge variant="warning" size="sm">
                        Clan Battle
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-nowrap sm:gap-2 lg:gap-4">
              {/* Players */}
              <div className="flex w-full items-center gap-2 sm:w-32 lg:w-36">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
                  <LuUsers className="text-base sm:text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium whitespace-nowrap text-gray-400 sm:text-xs 2xl:text-sm">
                    Players
                  </div>
                  <div className="text-gold-light-text truncate text-sm font-bold sm:text-base 2xl:text-lg">
                    {tournament.participants.length}/
                    {tournament.max_players ?? tournament.maxPlayers}
                  </div>
                </div>
              </div>

              {/* Entry Fee */}
              <div className="flex w-full items-center gap-2 sm:w-32 lg:w-36">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
                  <TbMoneybag className="text-base sm:text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium whitespace-nowrap text-gray-400 sm:text-xs 2xl:text-sm">
                    Entry Fee
                  </div>
                  <div className="text-gold-light-text truncate text-sm font-bold sm:text-base 2xl:text-lg">
                    {tournament.entry_fee ? (
                      `${getEntryFeeDisplayDual(tournament).diamonds} 💎`
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex w-full items-center gap-2 sm:w-32 lg:w-36">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
                  <LuCalendarDays className="text-base sm:text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium whitespace-nowrap text-gray-400 sm:text-xs 2xl:text-sm">
                    Schedule
                  </div>
                  <div className="text-gold-light-text truncate text-xs font-bold sm:text-sm 2xl:text-base">
                    {formatDate(tournament.date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Countdown + Prize Pool */}
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto">
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
                <div className="mx-auto flex w-full items-center gap-2 border-x border-white/20 px-4 sm:w-40 lg:w-44">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
                    <LuClock className="text-base text-red-400 sm:text-lg 2xl:text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium whitespace-nowrap text-gray-400 sm:text-xs 2xl:text-sm">
                      Status
                    </div>
                    <div className="truncate text-xs font-bold text-red-400 sm:text-sm 2xl:text-base">
                      Started
                    </div>
                  </div>
                </div>
              )}

              {/* Prize Pool */}
              {/* {tournament?.prize_pool !== 0 && ( */}
              <div className="w-full flex-shrink-0 sm:w-32 lg:w-40">
                {tournament?.prize_pool !== 0 && (
                  <div className="prize-display">
                    <div className="text-center sm:text-left">
                      <div className="text-gold mb-1 text-[10px] font-medium whitespace-nowrap sm:text-xs 2xl:text-sm">
                        Prize Pool
                      </div>
                      <div className="text-gold mb-1 text-xl leading-none font-medium sm:text-lg 2xl:text-lg">
                        {getPrizePoolDisplayDual(tournament).diamonds} 💎
                      </div>
                      <div className="text-gold-dark text-xs font-semibold sm:text-xs 2xl:text-sm">
                        ${getPrizePoolDisplayDual(tournament).usd}
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
