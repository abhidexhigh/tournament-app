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
import { formatEntryFee, formatPrizePool } from "../lib/currencyFormatter";
import { useTranslations } from "../contexts/LocaleContext";

export default function TournamentCard({ tournament }) {
  const t = useTranslations("tournament");
  const { locale } = require("../contexts/LocaleContext").useLocale();

  const formatDate = (dateStr) => {
    // Parse date string as local time to avoid timezone shifts
    // Date strings like "2025-12-30" are parsed as UTC by default,
    // which can cause day-shift issues in different timezones
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const localeMap = {
      en: "en-US",
      ko: "ko-KR",
      ja: "ja-JP",
      zh: "zh-CN",
      vi: "vi-VN",
      ru: "ru-RU",
      es: "es-ES",
    };
    return date.toLocaleDateString(localeMap[locale] || "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isAutomated =
    tournament.is_automated === true || tournament.is_automated === "true";

  // Helper component to render countdown with proper styling - DESKTOP
  const CountdownDisplay = ({ label, timerProps }) => {
    const timeLeft = useCountdown(timerProps);

    // Check if the timer has expired
    if (timeLeft.isExpired) {
      const message = timerProps.expiresAt
        ? t("joiningClosed")
        : t("tournamentStarted");
      return (
        <div className="hidden w-full items-center justify-start gap-2 border-x border-white/20 px-4 sm:mx-auto sm:flex sm:w-40 lg:w-48">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
            <LuClock className="text-base text-red-400 sm:text-lg 2xl:text-xl" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-initial">
            <div className="truncate text-xs font-bold text-wrap text-red-400 sm:text-sm 2xl:text-base">
              {message}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden w-full items-center justify-start gap-2 border-x border-white/20 px-4 sm:mx-auto sm:flex sm:w-40 lg:w-48">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
          <LuClock className="text-base sm:text-lg 2xl:text-xl" />
        </div>
        <div className="min-w-0 flex-1 sm:flex-initial">
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
          {/* ============ MOBILE LAYOUT (now using separate MobileTournamentCard) ============ */}
          <div className="hidden flex-col gap-3">
            {/* Mobile Header: Icon + Title */}
            <div className="flex items-start gap-3">
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
                        className="h-14 w-14 object-contain"
                        unoptimized
                      />
                    );
                  }

                  return <span className="text-5xl">{icon}</span>;
                })()}
              </div>

              {/* Title + Badges */}
              <div className="min-w-0 flex-1">
                <h3 className="text-gold-light-text group-hover:text-gold mb-1.5 text-base leading-tight font-bold tracking-tight transition-colors duration-300">
                  {tournament.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={tournament.status}
                    size="sm"
                    className="!px-2 !py-0.5 !text-[10px] !capitalize"
                  >
                    {tournament.status}
                  </Badge>
                  {tournament.display_type === "tournament" && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className="!px-2 !py-0.5 !text-[10px]"
                    >
                      Tournament
                    </Badge>
                  )}
                  {tournament.display_type === "event" && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="!px-2 !py-0.5 !text-[10px]"
                    >
                      Event
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Prize Pool - Highlighted Banner */}
            {tournament?.prize_pool !== 0 && (
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-900/40 via-yellow-800/30 to-amber-900/40 px-4 py-2.5">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LuTrophy className="text-gold text-lg" />
                    <span className="text-xs font-medium text-gray-300">
                      Prize Pool
                    </span>
                  </div>
                  <div className="text-gold text-lg font-bold">
                    {formatPrizePool(tournament.prize_pool)}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Stats Grid - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-2">
              {/* Players */}
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <LuUsers className="text-gold-dark flex-shrink-0 text-sm" />
                <div className="min-w-0">
                  <div className="text-[9px] text-gray-400">Players</div>
                  <div className="text-gold-light-text truncate text-xs font-semibold">
                    {tournament.participants.length}/
                    {tournament.max_players ?? tournament.maxPlayers}
                  </div>
                </div>
              </div>

              {/* Entry Fee */}
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <TbMoneybag className="text-gold-dark flex-shrink-0 text-sm" />
                <div className="min-w-0">
                  <div className="text-[9px] text-gray-400">Entry</div>
                  <div className="text-gold-light-text truncate text-xs font-semibold">
                    {tournament.entry_fee ? (
                      formatEntryFee(tournament.entry_fee)
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <LuCalendarDays className="text-gold-dark flex-shrink-0 text-sm" />
                <div className="min-w-0">
                  <div className="text-[9px] text-gray-400">Schedule</div>
                  <div className="text-gold-light-text truncate text-xs font-semibold">
                    {formatDate(tournament.date)}
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <LuClock className="text-gold-dark flex-shrink-0 text-sm" />
                <div className="min-w-0">
                  {(tournament.status === "upcoming" ||
                    tournament.status === "ongoing") &&
                    tournament.expires_at && (
                      <>
                        <div className="text-[9px] text-gray-400">
                          {isAutomated ? "Join by" : "Starts in"}
                        </div>
                        <div className="text-gold-light-text truncate text-xs font-semibold">
                          <CountdownTimer
                            expiresAt={tournament.expires_at}
                            style="minimal"
                          />
                        </div>
                      </>
                    )}

                  {tournament.status === "completed" && (
                    <>
                      <div className="text-[9px] text-gray-400">Status</div>
                      <div className="truncate text-xs font-semibold text-gray-400">
                        {t("completed")}
                      </div>
                    </>
                  )}

                  {tournament.status === "cancelled" && (
                    <>
                      <div className="text-[9px] text-gray-400">Status</div>
                      <div className="truncate text-xs font-semibold text-red-400">
                        {t("cancelled")}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============ TABLET LAYOUT (sm to lg) ============ */}
          <div className="hidden flex-col gap-4 py-2 sm:flex lg:hidden">
            {/* Tablet Row 1: Icon + Title + Prize */}
            <div className="flex items-center gap-4">
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
                        className="h-16 w-16 object-contain"
                        unoptimized
                      />
                    );
                  }

                  return <span className="text-5xl">{icon}</span>;
                })()}
              </div>

              {/* Title + Badges */}
              <div className="min-w-0 flex-1">
                <h3 className="text-gold-light-text group-hover:text-gold mb-2 text-lg font-bold tracking-tight transition-colors duration-300">
                  {tournament.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={tournament.status}
                    size="sm"
                    className="!capitalize"
                  >
                    {t(tournament.status)}
                  </Badge>
                  {tournament.display_type === "tournament" && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className="font-semibold"
                    >
                      {t("tournament")}
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
                  {(tournament.tournament_type ?? tournament.tournamentType) ===
                    "clan_battle" && (
                    <Badge variant="warning" size="sm">
                      {t("clanBattle")}
                    </Badge>
                  )}
                  {(tournament.tournament_type ?? tournament.tournamentType) ===
                    "regular" &&
                    tournament.display_type === "event" && (
                      <Badge variant="primary" size="sm">
                        {t("autoBattle")}
                      </Badge>
                    )}
                </div>
              </div>

              {/* Prize Pool - Tablet */}
              {tournament?.prize_pool !== 0 ? (
                <div className="flex-shrink-0">
                  <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 px-4 py-2">
                    <div className="text-center">
                      <div className="text-gold mb-0.5 text-[10px] font-medium">
                        {t("prizePool")}
                      </div>
                      <div className="text-gold text-xl leading-none font-bold">
                        {formatPrizePool(tournament.prize_pool)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 px-4 py-2">
                    <div className="text-center">
                      <div className="text-gold mb-0.5 text-[10px] font-medium">
                        {t("prizePool")}
                      </div>
                    </div>
                    <div className="text-gold text-xl leading-none font-bold">
                      Drops
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tablet Row 2: Stats */}
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5">
              {/* Players */}
              <div className="flex items-center gap-2">
                <LuUsers className="text-gold-dark text-base" />
                <div>
                  <div className="text-[10px] text-gray-400">
                    {t("players")}
                  </div>
                  <div className="text-gold-light-text text-sm font-bold">
                    {tournament.participants.length}/
                    {tournament.max_players ?? tournament.maxPlayers}
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              {/* Entry Fee */}
              <div className="flex items-center gap-2">
                <TbMoneybag className="text-gold-dark text-base" />
                <div>
                  <div className="text-[10px] text-gray-400">
                    {t("entryFee")}
                  </div>
                  <div className="text-gold-light-text text-sm font-bold">
                    {tournament.entry_fee ? (
                      formatEntryFee(tournament.entry_fee)
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              {/* Schedule */}
              <div className="flex items-center gap-2">
                <LuCalendarDays className="text-gold-dark text-base" />
                <div>
                  <div className="text-[10px] text-gray-400">
                    {t("schedule")}
                  </div>
                  <div className="text-gold-light-text text-sm font-bold">
                    {formatDate(tournament.date)}
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              {/* Countdown */}
              <div className="flex items-center gap-2">
                <LuClock className="text-gold-dark text-base" />
                <div>
                  {(tournament.status === "upcoming" ||
                    tournament.status === "ongoing") &&
                    tournament.expires_at && (
                      <>
                        <div className="text-[10px] text-gray-400">
                          {isAutomated ? t("joinBy") : t("startsIn")}
                        </div>
                        <div className="text-gold-light-text text-sm font-bold">
                          <CountdownTimer
                            expiresAt={tournament.expires_at}
                            style="minimal"
                          />
                        </div>
                      </>
                    )}

                  {tournament.status === "completed" && (
                    <>
                      <div className="text-[10px] text-gray-400">
                        {t("status")}
                      </div>
                      <div className="text-sm font-bold text-gray-400">
                        {t("completed")}
                      </div>
                    </>
                  )}

                  {tournament.status === "cancelled" && (
                    <>
                      <div className="text-[10px] text-gray-400">
                        {t("status")}
                      </div>
                      <div className="text-sm font-bold text-red-400">
                        {t("cancelled")}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============ DESKTOP LAYOUT (lg+) ============ */}
          <div className="hidden min-h-[90px] items-center gap-4 lg:flex">
            {/* Left Section: Icon + Title + Badges */}
            <div className="flex min-w-0 flex-1 items-center gap-6">
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
                        className="h-20 w-20 object-contain 2xl:h-24 2xl:w-24"
                        unoptimized
                      />
                    );
                  }

                  return <span className="text-6xl 2xl:text-7xl">{icon}</span>;
                })()}
              </div>

              {/* Title and Badges */}
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex-wrap items-center gap-2">
                  <h3 className="text-gold-light-text group-hover:text-gold mb-1 text-xl font-black tracking-tight transition-colors duration-300 2xl:text-2xl">
                    {tournament.title}
                  </h3>
                  <span className="flex items-center gap-2">
                    <Badge
                      variant={tournament.status}
                      size="sm"
                      className="!capitalize"
                    >
                      {t(tournament.status)}
                    </Badge>
                    {tournament.display_type === "tournament" && (
                      <Badge
                        variant="primary"
                        size="sm"
                        className="font-semibold"
                      >
                        {t("tournament")}
                      </Badge>
                    )}
                    {tournament.display_type === "event" && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="font-semibold"
                      >
                        {t("event")}
                      </Badge>
                    )}
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "clan_battle" && (
                      <Badge variant="warning" size="sm">
                        {t("clanBattle")}
                      </Badge>
                    )}
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "regular" &&
                      tournament.display_type === "event" && (
                        <Badge variant="primary" size="sm">
                          {t("autoBattle")}
                        </Badge>
                      )}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid - Desktop */}
            <div className="flex flex-nowrap gap-4">
              {/* Players */}
              <div className="flex w-36 items-center gap-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 2xl:h-10 2xl:w-10">
                  <LuUsers className="text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium whitespace-nowrap text-gray-400 2xl:text-sm">
                    {t("players")}
                  </div>
                  <div className="text-gold-light-text truncate text-base font-bold 2xl:text-lg">
                    {tournament.participants.length}/
                    {tournament.max_players ?? tournament.maxPlayers}
                  </div>
                </div>
              </div>

              {/* Entry Fee */}
              <div className="flex w-36 items-center gap-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 2xl:h-10 2xl:w-10">
                  <TbMoneybag className="text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium whitespace-nowrap text-gray-400 2xl:text-sm">
                    {t("entryFee")}
                  </div>
                  <div className="text-gold-light-text truncate text-base font-bold 2xl:text-lg">
                    {tournament.entry_fee ? (
                      formatEntryFee(tournament.entry_fee)
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex w-36 items-center gap-2 2xl:w-42">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 2xl:h-10 2xl:w-10">
                  <LuCalendarDays className="text-lg 2xl:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium whitespace-nowrap text-gray-400 2xl:text-sm">
                    {t("schedule")}
                  </div>
                  <div className="text-gold-light-text truncate text-sm font-bold 2xl:text-base">
                    {formatDate(tournament.date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Countdown + Prize Pool - Desktop */}
            <div className="flex items-center gap-4">
              {/* Countdown Logic - Simplified to always use expires_at */}
              {(tournament.status === "upcoming" ||
                tournament.status === "ongoing") &&
                tournament.expires_at && (
                  <CountdownDisplay
                    label={t("startsIn")} // TODO: Add "Join before" for automated tournaments
                    timerProps={{ expiresAt: tournament.expires_at }}
                  />
                )}

              {tournament.status === "completed" && (
                <div className="mx-auto flex w-44 items-center justify-start gap-2 border-x border-white/20 px-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 2xl:h-10 2xl:w-10">
                    <LuClock className="text-lg text-gray-400 2xl:text-xl" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium whitespace-nowrap text-gray-400 2xl:text-sm">
                      {t("status")}
                    </div>
                    <div className="truncate text-sm font-bold text-gray-400 2xl:text-base">
                      {t("completed")}
                    </div>
                  </div>
                </div>
              )}

              {tournament.status === "cancelled" && (
                <div className="mx-auto flex w-44 items-center justify-start gap-2 border-x border-white/20 px-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 2xl:h-10 2xl:w-10">
                    <LuClock className="text-lg text-red-400 2xl:text-xl" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium whitespace-nowrap text-gray-400 2xl:text-sm">
                      {t("status")}
                    </div>
                    <div className="truncate text-sm font-bold text-red-400 2xl:text-base">
                      {t("cancelled")}
                    </div>
                  </div>
                </div>
              )}

              {/* Prize Pool - Desktop */}
              <div className="w-40 flex-shrink-0">
                {tournament?.prize_pool !== 0 ? (
                  <div className="prize-display ml-auto">
                    <div className="text-left">
                      <div className="text-gold mb-1 text-xs font-medium whitespace-nowrap 2xl:text-sm">
                        {t("prizePool")}
                      </div>
                      <div className="text-gold mb-1 text-lg leading-none font-medium 2xl:text-lg">
                        {formatPrizePool(tournament.prize_pool)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prize-display ml-auto">
                    <div className="text-left">
                      <div className="text-gold mb-1 text-xs font-medium whitespace-nowrap 2xl:text-sm">
                        {t("prizePool")}
                      </div>
                      <div className="text-gold mb-1 text-lg leading-none font-medium 2xl:text-lg">
                        Drops
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
