"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";
import CountdownTimer from "./CountdownTimer";
import { getTournamentIcon } from "../lib/iconSelector";
import {
  LuUsers,
  LuClock,
  LuChevronRight,
  LuTrophy,
  LuTicket,
} from "react-icons/lu";
import { formatEntryFee, formatPrizePool } from "../lib/currencyFormatter";

export default function MobileTournamentCard({ tournament }) {
  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  const icon = getTournamentIcon(tournament);
  const isImageUrl = typeof icon === "string" && icon.startsWith("http");

  // Get accent gradient color based on status
  const getAccentGradient = () => {
    if (tournament.status === "ongoing") {
      return "via-red-500/70";
    }
    return "via-gold-dark/70";
  };

  return (
    <Link href={`/tournament/${tournament.id}`} className="block">
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16161d] to-[#0e0e12] transition-all duration-300 active:scale-[0.98]">
        {/* Gradient borders - all sides */}
        {/* Top */}
        <div
          className={`absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent ${getAccentGradient()} to-transparent`}
        />
        {/* Bottom */}
        <div
          className={`absolute right-0 bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent ${getAccentGradient()} to-transparent`}
        />
        {/* Left */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent ${getAccentGradient()} to-transparent`}
        />
        {/* Right */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent ${getAccentGradient()} to-transparent`}
        />

        {/* Subtle gradient overlay */}
        <div className="from-gold/[0.03] pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent" />

        {/* Card Content */}
        <div className="relative p-4">
          {/* Top Row - Icon, Title & Status */}
          <div className="mb-4 flex items-start gap-3">
            {/* Tournament Icon */}
            <div className="relative flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                {isImageUrl ? (
                  <Image
                    src={icon}
                    alt={`${tournament.title} icon`}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl">{icon}</span>
                )}
              </div>
              {/* Live Pulse */}
              {tournament.status === "ongoing" && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#16161d] bg-red-500" />
                </span>
              )}
            </div>

            {/* Title & Badges */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-gold-light-text line-clamp-2 text-xl leading-snug font-bold">
                  {tournament.title}
                </h3>
                <LuChevronRight className="mt-0.5 flex-shrink-0 text-lg text-gray-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={tournament.status}
                  size="sm"
                  className="!px-2.5 !py-1 !text-xs !font-medium !capitalize"
                >
                  {tournament.status === "ongoing"
                    ? "🔴 Live"
                    : tournament.status}
                </Badge>
                {tournament.display_type === "tournament" && (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="!px-2.5 !py-1 !text-xs !font-medium"
                  >
                    Tournament
                  </Badge>
                )}
                {tournament.display_type === "event" && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="!px-2.5 !py-1 !text-xs !font-medium"
                  >
                    Event
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {/* Prize Pool */}
            <div className="from-gold/10 border-gold/20 rounded-xl border bg-gradient-to-br to-amber-500/5 p-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <LuTrophy className="text-sm text-gray-400" />
                <span className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                  Prize
                </span>
              </div>
              <div className="text-gold text-base font-bold">
                {tournament?.prize_pool !== 0
                  ? formatPrizePool(tournament.prize_pool)
                  : "—"}
              </div>
            </div>

            {/* Players */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <LuUsers className="text-sm text-gray-400" />
                <span className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                  Players
                </span>
              </div>
              <div className="text-base font-bold text-white">
                {tournament.participants.length}
                <span className="font-normal text-gray-500">/</span>
                <span className="text-sm font-medium text-gray-400">
                  {tournament.max_players ?? tournament.maxPlayers}
                </span>
              </div>
            </div>

            {/* Entry Fee */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <LuTicket className="text-sm text-gray-400" />
                <span className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                  Entry
                </span>
              </div>
              <div
                className={`text-base font-bold ${tournament.entry_fee ? "text-gold-light-text" : "text-emerald-400"}`}
              >
                {tournament.entry_fee
                  ? formatEntryFee(tournament.entry_fee)
                  : "Free"}
              </div>
            </div>
          </div>

          {/* Countdown Bar */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5">
            <LuClock className="text-gold flex-shrink-0 text-base" />
            <div className="flex items-center gap-2 text-sm">
              {tournament.status === "upcoming" &&
                isAutomated &&
                tournament.expires_at && (
                  <>
                    <span className="text-gray-400">Closes in</span>
                    <span className="text-gold font-bold">
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
                  <span className="text-gold font-bold">
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
                    <span className="text-gold font-bold">
                      <CountdownTimer
                        expiresAt={tournament.expires_at}
                        style="compact"
                      />
                    </span>
                  </>
                )}

              {tournament.status === "ongoing" && !isAutomated && (
                <span className="font-bold text-red-400">
                  Match in Progress
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Fill Progress Indicator */}
        {/* <div className="h-1 w-full bg-black/40">
          <div
            className="from-gold/70 to-gold h-full bg-gradient-to-r transition-all duration-500"
            style={{
              width: `${Math.min(100, (tournament.participants.length / (tournament.max_players ?? tournament.maxPlayers)) * 100)}%`,
            }}
          />
        </div> */}
      </div>
    </Link>
  );
}
