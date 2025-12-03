"use client";

import Card from "../Card";
import Image from "next/image";
import { PRIMARY_CURRENCY, getPrimaryCurrency } from "../../lib/currencyConfig";

export default function MatchStatsTab({ match, playerPerformance, user }) {
  if (!user) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-xl">
        <div className="from-dark-card/80 via-dark-card/60 to-dark-card/80 absolute inset-0 bg-gradient-to-br" />
        <div className="relative px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-500/20 bg-gradient-to-br from-gray-500/20 to-gray-500/5">
            <span className="text-6xl">🔒</span>
          </div>
          <h3 className="mb-3 text-3xl font-bold text-white">Login Required</h3>
          <p className="mx-auto max-w-md text-lg text-gray-400">
            Please login to view your personal stats for this match.
          </p>
        </div>
      </div>
    );
  }

  if (!playerPerformance) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-xl">
        <div className="from-dark-card/80 via-dark-card/60 to-dark-card/80 absolute inset-0 bg-gradient-to-br" />
        <div className="relative px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-500/20 bg-gradient-to-br from-gray-500/20 to-gray-500/5">
            <span className="text-6xl">👀</span>
          </div>
          <h3 className="mb-3 text-3xl font-bold text-white">
            Not a Participant
          </h3>
          <p className="mx-auto max-w-md text-lg text-gray-400">
            You did not participate in this match. Check the leaderboard to see
            match results.
          </p>
        </div>
      </div>
    );
  }

  // Get position badge
  const getPositionBadge = (position) => {
    if (position === 1)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp"
          alt="1st place"
          width={80}
          height={80}
          className="w-20"
        />
      );
    if (position === 2)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp"
          alt="2nd place"
          width={80}
          height={80}
          className="w-20"
        />
      );
    if (position === 3)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp"
          alt="3rd place"
          width={80}
          height={80}
          className="w-20"
        />
      );
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-600/30 text-3xl font-bold text-gray-300">
        #{position}
      </div>
    );
  };

  // Calculate percentile
  const totalPlayers = match.leaderboard?.length || 1;
  const percentile = Math.round(
    ((totalPlayers - playerPerformance.position + 1) / totalPlayers) * 100
  );

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card glass>
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
          {/* Position Badge */}
          <div className="flex flex-col items-center">
            {getPositionBadge(playerPerformance.position)}
            <p className="mt-2 text-xl font-bold text-white">
              {playerPerformance.position === 1
                ? "1st Place"
                : playerPerformance.position === 2
                  ? "2nd Place"
                  : playerPerformance.position === 3
                    ? "3rd Place"
                    : `#${playerPerformance.position}`}
            </p>
            <p className="text-sm text-gray-400">
              Top {percentile}% of players
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Score */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-4xl font-black text-white">
                {playerPerformance.score?.toLocaleString() || "N/A"}
              </p>
              <p className="mt-1 text-sm text-gray-400">Final Score</p>
            </div>

            {/* Kills */}
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
              <p className="text-4xl font-black text-green-400">
                {playerPerformance.kills || 0}
              </p>
              <p className="mt-1 text-sm text-gray-400">Kills</p>
            </div>

            {/* Deaths */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
              <p className="text-4xl font-black text-red-400">
                {playerPerformance.deaths || 0}
              </p>
              <p className="mt-1 text-sm text-gray-400">Deaths</p>
            </div>

            {/* K/D Ratio */}
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-center">
              <p className="text-4xl font-black text-purple-400">
                {playerPerformance.kdRatio || "0.0"}
              </p>
              <p className="mt-1 text-sm text-gray-400">K/D Ratio</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Prize Information */}
      {playerPerformance.prizeAmount > 0 && (
        <Card glass className="bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-gold text-xl font-bold">Prize Won! 🎉</h3>
              <p className="text-gray-400">
                Congratulations on your placement!
              </p>
            </div>
            <div className="bg-gold/20 border-gold/30 rounded-xl border px-6 py-3">
              <p className="text-gold text-3xl font-black">
                {PRIMARY_CURRENCY === "USD" ? "$" : ""}{playerPerformance.prizeAmount.toLocaleString()}{PRIMARY_CURRENCY === "DIAMOND" ? " 💎" : ""}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison with Match Average */}
      <Card glass>
        <h3 className="text-gold mb-4 text-lg font-bold">
          Comparison with Match Average
        </h3>
        <div className="space-y-4">
          {/* Score Comparison */}
          <ComparisonBar
            label="Score"
            playerValue={playerPerformance.score || 0}
            avgValue={
              match.leaderboard?.length > 0
                ? Math.round(
                    match.leaderboard.reduce((sum, e) => sum + (e.score || 0), 0) /
                      match.leaderboard.length
                  )
                : 0
            }
            color="blue"
          />

          {/* Kills Comparison */}
          <ComparisonBar
            label="Kills"
            playerValue={playerPerformance.kills || 0}
            avgValue={
              match.leaderboard?.length > 0
                ? Math.round(
                    match.leaderboard.reduce((sum, e) => sum + (e.kills || 0), 0) /
                      match.leaderboard.length
                  )
                : 0
            }
            color="green"
          />

          {/* K/D Comparison */}
          <ComparisonBar
            label="K/D Ratio"
            playerValue={parseFloat(playerPerformance.kdRatio || "0")}
            avgValue={
              match.leaderboard?.length > 0
                ? parseFloat(
                    (
                      match.leaderboard.reduce(
                        (sum, e) => sum + parseFloat(e.kdRatio || "0"),
                        0
                      ) / match.leaderboard.length
                    ).toFixed(2)
                  )
                : 0
            }
            color="purple"
            decimals
          />
        </div>
      </Card>
    </div>
  );
}

function ComparisonBar({ label, playerValue, avgValue, color, decimals }) {
  const max = Math.max(playerValue, avgValue, 1);
  const playerWidth = (playerValue / max) * 100;
  const avgWidth = (avgValue / max) * 100;
  const isAboveAverage = playerValue >= avgValue;

  const colorClasses = {
    blue: {
      bar: "bg-blue-500",
      text: "text-blue-400",
    },
    green: {
      bar: "bg-green-500",
      text: "text-green-400",
    },
    purple: {
      bar: "bg-purple-500",
      text: "text-purple-400",
    },
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-bold ${colorClasses[color].text}`}>
            You: {decimals ? playerValue.toFixed(2) : playerValue.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            Avg: {decimals ? avgValue.toFixed(2) : avgValue.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-gray-700/50">
        {/* Player bar */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${colorClasses[color].bar} transition-all duration-500`}
          style={{ width: `${playerWidth}%` }}
        />
        {/* Average marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/50"
          style={{ left: `${avgWidth}%` }}
        />
      </div>
      <div className="mt-1 text-right">
        <span
          className={`text-xs ${isAboveAverage ? "text-green-400" : "text-red-400"}`}
        >
          {isAboveAverage ? "↑" : "↓"}{" "}
          {Math.abs(
            decimals
              ? (playerValue - avgValue).toFixed(2)
              : playerValue - avgValue
          ).toLocaleString()}{" "}
          {isAboveAverage ? "above" : "below"} average
        </span>
      </div>
    </div>
  );
}

