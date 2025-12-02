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
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title and Icon Section */}
        <div className="flex items-start space-x-3 sm:items-center sm:space-x-4">
          <TournamentIcon tournament={tournament} />
          <div className="min-w-0 flex-1">
            <h1 className="text-gold-gradient text-xl font-bold break-words sm:text-xl lg:text-2xl 2xl:text-3xl">
              {tournament.title}
            </h1>
            {/* Host Name */}
            <div className="mt-1">
              <div className="text-xs text-gray-400 sm:text-sm 2xl:text-base">
                <div className="font-medium text-white">
                  {tournament.is_automated ? (
                    <>Admin</>
                  ) : host ? (
                    <div className="flex items-center gap-1">
                      <Image
                        src={host.avatar}
                        alt={host.username}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full sm:h-6 sm:w-6 2xl:h-7 2xl:w-7"
                      />
                      <span className="text-sm font-medium text-white 2xl:text-base">
                        {host.username}
                      </span>
                    </div>
                  ) : (
                    "Loading..."
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {!tournament.is_automated && isClanBattle && (
                <Badge variant="warning" size="sm">
                  Clan Battle
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
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:w-auto lg:justify-end">
          {/* Countdown Timer Section */}
          {(tournament.status === "upcoming" ||
            tournament.status === "ongoing") && (
            <div className="col-span-2 flex items-center gap-2 border-white/20 sm:col-span-3 lg:col-span-1 lg:w-[156px] lg:border-r">
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
                  } left`
                : "Full"
            }
          />

          {/* Entry Fee Card */}
          <TournamentStatCard icon={<TbMoneybag />} label="Entry Fee">
            {tournament.entry_fee ? (
                <p className="text-sm font-semibold text-white sm:text-base 2xl:text-lg">
                {formatEntryFee(tournament.entry_fee)}
                </p>
            ) : (
              <p className="text-sm font-semibold text-green-400 sm:text-base 2xl:text-lg">
                Free
              </p>
            )}
          </TournamentStatCard>

          {/* Prize Pool Card - Highlighted */}
          <TournamentStatCard label="Prize Pool" highlighted>
            <p className="text-gold text-base font-bold sm:text-lg 2xl:text-xl">
              {formatPrizePool(tournament.prize_pool)}
            </p>
            {(tournament.prize_pool_type ?? tournament.prizePoolType) ===
              "entry-based" && (
              <p className="text-gold/70 text-xs italic 2xl:text-sm">
                Entry-based
              </p>
            )}
          </TournamentStatCard>
        </div>
      </div>

      <div className="via-gold-dark/50 h-[1px] bg-gradient-to-r from-transparent to-transparent" />

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
        <div className="flex w-full flex-col gap-2 lg:ml-auto lg:w-auto lg:min-w-[200px]">
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
        <Image
          src={icon}
          alt={`${tournament.title} icon`}
          width={96}
          height={96}
          className="border-gold-dark/20 h-12 w-12 rounded-lg border object-contain sm:h-16 sm:w-16 lg:h-20 lg:w-20"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 text-3xl sm:text-4xl lg:text-6xl">{icon}</div>
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
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-500/20 text-sm 2xl:h-8 2xl:w-8 2xl:text-base">
            <GiCrossedAxes />
          </div>
          <h3 className="text-sm font-bold text-white 2xl:text-base">
            Clan Battle
          </h3>
        </div>
        {isClanSelection && (
          <div className="space-y-2">
            <div className="rounded-md border border-white/20 bg-black/50 p-2.5">
              <p className="mb-1 text-xs text-gray-400 2xl:text-sm">Clan 1</p>
              <p className="text-sm font-semibold text-white 2xl:text-base">
                {clan1
                  ? `${clan1.emblem} ${clan1.name} [${clan1.tag}]`
                  : "Not specified"}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-gold/10 border-gold/30 rounded-full border px-4 py-1">
                <span className="text-gold text-xs font-bold 2xl:text-sm">
                  VS
                </span>
              </div>
            </div>
            <div className="rounded-md border border-white/20 bg-black/50 p-2.5">
              <p className="mb-1 text-xs text-gray-400 2xl:text-sm">Clan 2</p>
              <p className="text-sm font-semibold text-white 2xl:text-base">
                {clan2
                  ? `${clan2.emblem} ${clan2.name} [${clan2.tag}]`
                  : "Not specified"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Horizontal Layout */}
      <div className="hidden px-3 lg:block">
        {isClanSelection && (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-500/20 text-base 2xl:h-10 2xl:w-10 2xl:text-lg">
                <GiCrossedAxes />
              </div>
              <h3 className="text-base font-bold text-white 2xl:text-lg">
                Clan Details
              </h3>
            </div>
            <>
              <div className="rounded-md border border-white/20 bg-black/50 p-2.5">
                <p className="text-sm font-semibold whitespace-nowrap text-white 2xl:text-base">
                  {clan1
                    ? `${clan1.emblem} ${clan1.name} [${clan1.tag}]`
                    : "Not specified"}
                </p>
              </div>
              <span className="text-sm font-semibold text-white 2xl:text-base">
                vs
              </span>
              <div className="rounded-md border border-white/20 bg-black/50 p-2.5">
                <p className="text-sm font-semibold whitespace-nowrap text-white 2xl:text-base">
                  {clan2
                    ? `${clan2.emblem} ${clan2.name} [${clan2.tag}]`
                    : "Not specified"}
                </p>
              </div>
            </>
          </div>
        )}
      </div>
    </div>
  );
}
