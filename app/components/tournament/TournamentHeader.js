"use client";

import Link from "next/link";
import Card from "../Card";
import Badge from "../Badge";
import Button from "../Button";
import { LuCalendarDays, LuUsers } from "react-icons/lu";
import { TbMoneybag } from "react-icons/tb";
import { GiCrossedAxes } from "react-icons/gi";
import { getTournamentIcon } from "../../lib/iconSelector";
import {
  getPrizePoolDisplayDual,
  getEntryFeeDisplayDual,
} from "../../lib/prizeCalculator";
import { formatEntryFee, formatPrizePool } from "../../lib/currencyFormatter";
import TournamentStatCard from "./TournamentStatCard";
import CountdownSection from "./CountdownSection";
import Image from "next/image";
import { useTranslations } from "../../contexts/LocaleContext";
import { formatDateWithWeekday } from "../../lib/dateUtils";

export default function TournamentHeader({
  tournament,
  host,
  user,
  clan1,
  clan2,
  canJoin,
  isHost,
  isParticipant,
  loading,
  onJoin,
  onStart,
  onDeclareWinners,
}) {
  const t = useTranslations("tournament");
  const tCommon = useTranslations("common");

  const formatDate = (dateStr) => formatDateWithWeekday(dateStr);

  const isClanBattle =
    (tournament.tournament_type ?? tournament.tournamentType) === "clan_battle";

  return (
    <Card glass className="relative mb-4 overflow-hidden">
      {/* Top accent line */}
      <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      {/* Main Content */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title and Icon Section */}
        <div className="flex flex-1 items-start space-x-3 sm:items-center sm:space-x-4 lg:flex-shrink-0 lg:flex-grow-0 lg:basis-auto">
          <TournamentIcon tournament={tournament} />
          <div className="min-w-0">
            {/* Badges Row */}
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Badge
                variant={tournament.status}
                size="sm"
                className="capitalize"
              >
                {t(tournament.status)}
              </Badge>
              {!tournament.is_automated && isClanBattle && (
                <Badge variant="warning" size="sm">
                  ⚔️ {t("clanBattle")}
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

            {/* Title */}
            <h1 className="text-gold-gradient text-xl leading-tight font-bold break-words sm:text-xl lg:text-2xl 2xl:text-3xl">
              {tournament.title}
            </h1>

            {/* Host Info */}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400 sm:text-sm">
              <span>{t("hostedBy")}</span>
              {tournament.is_automated ? (
                <span className="text-gold-dark font-medium">
                  {t("system")}
                </span>
              ) : host ? (
                <div className="flex items-center gap-1.5">
                  <Image
                    src={host.avatar}
                    alt={host.username}
                    width={20}
                    height={20}
                    className="ring-gold-dark/30 h-5 w-5 rounded-full ring-1 sm:h-5 sm:w-5"
                  />
                  <span className="font-medium text-white">
                    {host.username}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">{tCommon("loading")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Countdown Timer - Mobile: Full width prominent card above stats */}
        {(tournament.status === "upcoming" ||
          tournament.status === "ongoing") && (
          <div className="w-full md:hidden">
            <div className="border-gold-dark/30 bg-dark-card/60 rounded-xl border px-4 py-3 backdrop-blur-sm">
              <CountdownSection tournament={tournament} />
            </div>
          </div>
        )}

        {/* Cancelled Status - Mobile */}
        {tournament.status === "cancelled" && (
          <div className="w-full md:hidden">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">❌</span>
                <span className="font-bold text-red-400">{t("cancelled")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Mobile: 2-col, Tablet: flex wrap, Desktop: flex row */}
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:justify-end md:gap-3 lg:flex-shrink-0 lg:flex-nowrap">
          {/* Countdown Timer Section - Hidden on mobile, visible on md+ */}
          {(tournament.status === "upcoming" ||
            tournament.status === "ongoing") && (
            <div className="border-gold-dark/20 bg-dark-card/50 lg:border-gold-dark/20 hidden items-center gap-2 rounded-lg border p-2.5 md:flex md:w-auto md:min-w-[140px] md:rounded-lg md:border lg:w-[160px] lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-4">
              <CountdownSection tournament={tournament} />
            </div>
          )}

          {/* Cancelled Status - Desktop */}
          {tournament.status === "cancelled" && (
            <div className="hidden items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 md:flex md:w-auto md:min-w-[140px] lg:w-[160px]">
              <span className="text-lg">❌</span>
              <span className="font-bold text-red-400">{t("cancelled")}</span>
            </div>
          )}

          {/* Schedule Card */}
          <TournamentStatCard
            icon={<LuCalendarDays />}
            label={t("schedule")}
            value={formatDate(tournament.date)}
            subtitle={tournament.time}
          />

          {/* Players Card */}
          <TournamentStatCard
            icon={<LuUsers />}
            label={t("players")}
            value={
              <>
                {tournament.participants.length}
                <span className="text-sm font-normal text-gray-400">
                  /{tournament.max_players ?? tournament.maxPlayers}
                </span>
              </>
            }
            subtitle={
              (tournament.max_players ?? tournament.maxPlayers) -
                tournament.participants.length >
              0
                ? `${
                    (tournament.max_players ?? tournament.maxPlayers) -
                    tournament.participants.length
                  } ${t("slotsLeft")}`
                : t("full")
            }
          />

          {/* Entry Fee Card */}
          <TournamentStatCard icon={<TbMoneybag />} label={t("entryFee")}>
            {tournament.entry_fee ? (
              <p className="text-base font-bold text-white">
                {formatEntryFee(tournament.entry_fee)}
              </p>
            ) : (
              <p className="text-base font-bold text-green-400">
                {tCommon("free")}
              </p>
            )}
          </TournamentStatCard>

          {/* Prize Pool Card - Highlighted */}
          <TournamentStatCard label={t("prizePool")} highlighted>
            <p className="text-gold text-lg font-bold">
              {formatPrizePool(tournament.prize_pool)}
            </p>
            {(tournament.prize_pool_type ?? tournament.prizePoolType) ===
              "entry-based" && (
              <p className="text-gold/70 text-xs italic">{t("entryBased")}</p>
            )}
          </TournamentStatCard>
        </div>
      </div>

      {/* Separator */}
      <div className="via-gold-dark/30 h-px bg-gradient-to-r from-transparent to-transparent" />

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 pt-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Clan Battle Details */}
        {isClanBattle && (
          <ClanBattleDetails
            tournament={tournament}
            clan1={clan1}
            clan2={clan2}
          />
        )}

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2 md:flex-row md:justify-end lg:ml-auto lg:w-auto lg:min-w-[200px]">
          {canJoin && (
            <Button variant="primary" onClick={onJoin} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("joining")}
                </span>
              ) : tournament.entry_fee ? (
                t("join")
              ) : (
                t("joinFree")
              )}
            </Button>
          )}

          {isHost && tournament.status === "upcoming" && (
            <Button variant="primary" onClick={onStart}>
              🚀 {t("startTournament")}
            </Button>
          )}

          {isHost && tournament.status === "ongoing" && (
            <Button variant="primary" onClick={onDeclareWinners}>
              🏆 {t("declareWinners")}
            </Button>
          )}

          {isParticipant && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5">
              <span className="text-green-400">✓</span>
              <span className="font-semibold text-green-400">
                {t("registered")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function TournamentIcon({ tournament }) {
  const icon = getTournamentIcon(tournament);
  const isImageUrl = typeof icon === "string" && icon.startsWith("http");

  if (isImageUrl) {
    return (
      <div className="flex-shrink-0">
        <div className="relative">
          <Image
            src={icon}
            alt={`${tournament.title} icon`}
            width={96}
            height={96}
            className="border-gold-dark/30 bg-dark-card h-14 w-14 rounded-xl border object-contain p-1 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-gold-dark/30 bg-dark-card flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border text-3xl sm:h-16 sm:w-16 sm:text-4xl lg:h-20 lg:w-20 lg:text-5xl">
      {icon}
    </div>
  );
}

function ClanBattleDetails({ tournament, clan1, clan2 }) {
  const isClanSelection =
    (tournament.clan_battle_mode ?? tournament.clanBattleMode) ===
    "clan_selection";

  if (!isClanSelection) return null;

  return (
    <div className="w-full lg:flex-1">
      {/* Mobile/Tablet View */}
      <div className="lg:hidden">
        <div className="border-gold-dark/20 bg-dark-card/50 rounded-lg border p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="bg-gold-dark/20 text-gold-dark flex h-7 w-7 items-center justify-center rounded-md text-sm">
              <GiCrossedAxes />
            </div>
            <h3 className="text-sm font-bold text-white">Clan Battle</h3>
          </div>
          <div className="flex items-center justify-between gap-3">
            {/* Clan 1 */}
            <div className="border-gold-dark/20 bg-dark-primary/50 flex-1 rounded-md border px-3 py-2 text-center">
              <p className="truncate text-sm font-semibold text-white">
                {clan1 ? `${clan1.emblem} ${clan1.name}` : "TBD"}
              </p>
            </div>

            <span className="text-gold text-xs font-bold">VS</span>

            {/* Clan 2 */}
            <div className="border-gold-dark/20 bg-dark-primary/50 flex-1 rounded-md border px-3 py-2 text-center">
              <p className="truncate text-sm font-semibold text-white">
                {clan2 ? `${clan2.emblem} ${clan2.name}` : "TBD"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Horizontal Layout */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gold-dark/20 text-gold-dark flex h-8 w-8 items-center justify-center rounded-md text-base 2xl:h-10 2xl:w-10 2xl:text-lg">
              <GiCrossedAxes />
            </div>
            <span className="text-sm font-medium text-gray-400">
              Clan Battle:
            </span>
          </div>

          {/* Clan 1 */}
          <div className="border-gold-dark/30 bg-dark-card/80 rounded-lg border px-4 py-2">
            <p className="text-sm font-semibold whitespace-nowrap text-white 2xl:text-base">
              {clan1 ? `${clan1.emblem} ${clan1.name} [${clan1.tag}]` : "TBD"}
            </p>
          </div>

          <span className="text-gold text-sm font-bold">VS</span>

          {/* Clan 2 */}
          <div className="border-gold-dark/30 bg-dark-card/80 rounded-lg border px-4 py-2">
            <p className="text-sm font-semibold whitespace-nowrap text-white 2xl:text-base">
              {clan2 ? `${clan2.emblem} ${clan2.name} [${clan2.tag}]` : "TBD"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
