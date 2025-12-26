"use client";

import Card from "../Card";
import { LuCalendarDays, LuClock, LuUsers, LuGamepad2 } from "react-icons/lu";
import { TbTrophy, TbTarget } from "react-icons/tb";
import { PRIMARY_CURRENCY, getPrimaryCurrency } from "../../lib/currencyConfig";

export default function MatchDetailsTab({ match }) {
  // Format date - parse as local time to avoid timezone shifts
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate match statistics
  const totalKills =
    match.leaderboard?.reduce((sum, entry) => sum + (entry.kills || 0), 0) || 0;
  const totalDeaths =
    match.leaderboard?.reduce((sum, entry) => sum + (entry.deaths || 0), 0) ||
    0;
  const avgScore =
    match.leaderboard?.length > 0
      ? Math.round(
          match.leaderboard.reduce(
            (sum, entry) => sum + (entry.score || 0),
            0,
          ) / match.leaderboard.length,
        )
      : 0;
  const highestScore =
    match.leaderboard?.length > 0
      ? Math.max(...match.leaderboard.map((entry) => entry.score || 0))
      : 0;

  return (
    <div className="space-y-6">
      {/* Match Information */}
      <Card glass>
        <h3 className="text-gold mb-4 text-lg font-bold">Match Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Date */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <LuCalendarDays className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="font-semibold text-white">
                {formatDate(match.date)}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <LuClock className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Time</p>
              <p className="font-semibold text-white">
                {match.startTime}
                {match.endTime && ` - ${match.endTime}`}
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
              <LuUsers className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Players</p>
              <p className="font-semibold text-white">
                {match.leaderboard?.length || match.participants || 0}
              </p>
            </div>
          </div>

          {/* Prize Pool */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400">
              <TbTrophy className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Prize Pool</p>
              <p className="text-gold font-semibold">
                {PRIMARY_CURRENCY === "USD" ? "$" : ""}
                {match.prizePool?.toLocaleString()}
                {PRIMARY_CURRENCY === "DIAMOND" ? " 💎" : ""}
              </p>
            </div>
          </div>

          {/* Game Mode */}
          {match.gameMode && (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                <LuGamepad2 className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Game Mode</p>
                <p className="font-semibold text-white">{match.gameMode}</p>
              </div>
            </div>
          )}

          {/* Match ID */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/20 text-gray-400">
              <TbTarget className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Match ID</p>
              <p className="font-mono text-sm text-white">{match.id}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Match Statistics */}
      <Card glass>
        <h3 className="text-gold mb-4 text-lg font-bold">Match Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Kills */}
          <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-4 text-center">
            <p className="text-3xl font-black text-green-400">{totalKills}</p>
            <p className="text-sm text-gray-400">Total Kills</p>
          </div>

          {/* Total Deaths */}
          <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4 text-center">
            <p className="text-3xl font-black text-red-400">{totalDeaths}</p>
            <p className="text-sm text-gray-400">Total Deaths</p>
          </div>

          {/* Average Score */}
          <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-4 text-center">
            <p className="text-3xl font-black text-blue-400">
              {avgScore.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Average Score</p>
          </div>

          {/* Highest Score */}
          <div className="border-gold/20 from-gold/10 rounded-xl border bg-gradient-to-br to-transparent p-4 text-center">
            <p className="text-gold text-3xl font-black">
              {highestScore.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Highest Score</p>
          </div>
        </div>
      </Card>

      {/* Tournament Link (if applicable) */}
      {match.tournamentId && (
        <Card glass>
          <h3 className="text-gold mb-4 text-lg font-bold">Tournament</h3>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm text-gray-400">
                This match is part of a tournament
              </p>
              <p className="font-mono text-sm text-white">
                {match.tournamentId}
              </p>
            </div>
            <a
              href={`/tournament/${match.tournamentId}`}
              className="text-gold hover:text-gold/80 text-sm font-semibold underline transition-colors"
            >
              View Tournament →
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
