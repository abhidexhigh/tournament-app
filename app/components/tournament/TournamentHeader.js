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
import TournamentStatCard from "./TournamentStatCard";
import CountdownSection from "./CountdownSection";

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
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isClanBattle =
    (tournament.tournament_type ?? tournament.tournamentType) === "clan_battle";

  return (
    <Card glass className="mb-4">
      {/* Mobile: Stack everything vertically */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
        {/* Title and Icon Section */}
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
          <TournamentIcon tournament={tournament} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gold-gradient break-words">
              {tournament.title}
            </h1>
            {/* Host Name */}
            <div className="mt-1 sm:mt-2">
              <div className="text-gray-400 text-xs sm:text-sm">
                <div className="text-white font-medium">
                  {tournament.is_automated ? (
                    <>🤖 Admin</>
                  ) : host ? (
                    <div className="flex items-center gap-1">
                      <img
                        src={host.avatar}
                        alt={host.username}
                        width={20}
                        height={20}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                      />
                      <span className="text-white font-medium text-sm">
                        {host.username}
                      </span>
                    </div>
                  ) : (
                    "Loading..."
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {!tournament.is_automated && isClanBattle && (
                <Badge variant="warning" size="sm">
                  ⚔️ Clan Battle
                </Badge>
              )}
              <Badge
                variant={tournament.status}
                size="sm"
                className="capitalize"
              >
                {tournament.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards - Grid on mobile, horizontal on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-end gap-2 w-full lg:w-auto">
          {/* Countdown Timer Section */}
          {(tournament.status === "upcoming" ||
            tournament.status === "ongoing") && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex items-center gap-2 lg:border-r border-white/20 lg:w-[156px]">
              <CountdownSection tournament={tournament} />
            </div>
          )}

          {/* Schedule Card */}
          <TournamentStatCard
            icon={<LuCalendarDays />}
            label="Schedule"
            value={formatDate(tournament.date)}
            subtitle={tournament.time}
          />

          {/* Players Card */}
          <TournamentStatCard
            icon={<LuUsers />}
            label="Players"
            value={
              <>
                {tournament.participants.length}
                <span className="text-gray-400 text-sm font-normal">
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
                  } left`
                : "Full"
            }
          />

          {/* Entry Fee Card */}
          <TournamentStatCard icon={<TbMoneybag />} label="Entry Fee">
            {tournament.entry_fee ? (
              <>
                <p className="text-white font-semibold text-sm sm:text-base">
                  ${getEntryFeeDisplayDual(tournament).usd}
                </p>
                <p className="text-gold text-xs">
                  {getEntryFeeDisplayDual(tournament).diamonds} 💎
                </p>
              </>
            ) : (
              <p className="text-green-400 font-semibold text-sm sm:text-base">
                Free
              </p>
            )}
          </TournamentStatCard>

          {/* Prize Pool Card - Highlighted */}
          <TournamentStatCard label="Prize Pool" highlighted>
            <p className="text-gold font-bold text-base sm:text-lg">
              ${getPrizePoolDisplayDual(tournament).usd}
            </p>
            <p className="text-gold/90 text-xs sm:text-sm">
              {getPrizePoolDisplayDual(tournament).diamonds} 💎
            </p>
            {(tournament.prize_pool_type ?? tournament.prizePoolType) ===
              "entry-based" && (
              <p className="text-gold/70 text-xs italic">Entry-based</p>
            )}
          </TournamentStatCard>
        </div>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-dark/50 to-transparent" />

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center pt-4 gap-4">
        {/* Clan Battle Details */}
        {isClanBattle && (
          <ClanBattleDetails
            tournament={tournament}
            clan1={clan1}
            clan2={clan2}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[200px]">
          {canJoin && (
            <Button variant="primary" onClick={onJoin} disabled={loading}>
              {tournament.entry_fee
                ? "Join Tournament"
                : "Join Tournament (Free)"}
            </Button>
          )}

          {isHost && tournament.status === "upcoming" && (
            <Button variant="primary" onClick={onStart}>
              Start Tournament
            </Button>
          )}

          {isHost && tournament.status === "ongoing" && (
            <Button variant="primary" onClick={onDeclareWinners}>
              Declare Winners
            </Button>
          )}

          {isParticipant && (
            <Badge variant="success" className="text-center">
              You are Registered ✓
            </Badge>
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
        <img
          src={icon}
          alt={`${tournament.title} icon`}
          width={96}
          height={96}
          className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain rounded-lg border border-gold-dark/20"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="text-3xl sm:text-4xl lg:text-6xl flex-shrink-0">{icon}</div>
  );
}

function ClanBattleDetails({ tournament, clan1, clan2 }) {
  const isClanSelection =
    (tournament.clan_battle_mode ?? tournament.clanBattleMode) ===
    "clan_selection";

  return (
    <div className="w-full lg:flex-1">
      {/* Mobile View - Stacked Layout */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-gray-500/20 flex items-center justify-center text-sm">
            <GiCrossedAxes />
          </div>
          <h3 className="text-white font-bold text-sm">Clan Battle</h3>
        </div>
        {isClanSelection && (
          <div className="space-y-2">
            <div className="p-2.5 rounded-md bg-black/50 border border-white/20">
              <p className="text-gray-400 text-xs mb-1">Clan 1</p>
              <p className="text-white font-semibold text-sm">
                {clan1
                  ? `${clan1.emblem} ${clan1.name} [${clan1.tag}]`
                  : "Not specified"}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="px-4 py-1 rounded-full bg-gold/10 border border-gold/30">
                <span className="text-gold font-bold text-xs">VS</span>
              </div>
            </div>
            <div className="p-2.5 rounded-md bg-black/50 border border-white/20">
              <p className="text-gray-400 text-xs mb-1">Clan 2</p>
              <p className="text-white font-semibold text-sm">
                {clan2
                  ? `${clan2.emblem} ${clan2.name} [${clan2.tag}]`
                  : "Not specified"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Horizontal Layout */}
      <div className="hidden lg:block px-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gray-500/20 flex items-center justify-center text-base">
              <GiCrossedAxes />
            </div>
            <h3 className="text-white font-bold text-base">Clan Details</h3>
          </div>
          {isClanSelection && (
            <>
              <div className="p-2.5 rounded-md bg-black/50 border border-white/20">
                <p className="text-white font-semibold text-sm whitespace-nowrap">
                  {clan1
                    ? `${clan1.emblem} ${clan1.name} [${clan1.tag}]`
                    : "Not specified"}
                </p>
              </div>
              <span className="text-white font-semibold text-sm">vs</span>
              <div className="p-2.5 rounded-md bg-black/50 border border-white/20">
                <p className="text-white font-semibold text-sm whitespace-nowrap">
                  {clan2
                    ? `${clan2.emblem} ${clan2.name} [${clan2.tag}]`
                    : "Not specified"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
