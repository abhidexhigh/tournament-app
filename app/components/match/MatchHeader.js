"use client";

import Card from "../Card";
import Badge from "../Badge";
import { LuCalendarDays, LuUsers, LuClock } from "react-icons/lu";
import { TbTrophy } from "react-icons/tb";
import Image from "next/image";

export default function MatchHeader({ match, user, playerPerformance }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get position badge/medal
  const getPositionBadge = (position) => {
    if (position === 1)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp"
          alt="1st place"
          width={48}
          height={48}
          className="w-12 sm:w-14"
        />
      );
    if (position === 2)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp"
          alt="2nd place"
          width={48}
          height={48}
          className="w-12 sm:w-14"
        />
      );
    if (position === 3)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp"
          alt="3rd place"
          width={48}
          height={48}
          className="w-12 sm:w-14"
        />
      );
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600/30 text-xl font-bold text-gray-300 sm:h-14 sm:w-14">
        #{position}
      </div>
    );
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "ongoing":
        return "warning";
      case "upcoming":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Card glass className="mb-4">
      {/* Mobile: Stack everything vertically */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title and Icon Section */}
        <div className="flex items-start space-x-3 sm:items-center sm:space-x-4">
          <div className="flex-shrink-0 text-4xl sm:text-5xl lg:text-6xl">
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-gold-gradient text-xl font-bold break-words sm:text-xl lg:text-2xl 2xl:text-3xl">
              {match.title}
            </h1>
            {match.tournamentId && (
              <div className="mt-1">
                <span className="text-xs text-gray-400 sm:text-sm">
                  Tournament Match
                </span>
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={getStatusVariant(match.status)}
                size="sm"
                className="capitalize"
              >
                {match.status === "ongoing" && "🔴 "}
                {match.status}
              </Badge>
              {match.gameMode && (
                <Badge variant="secondary" size="sm">
                  {match.gameMode}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:w-auto lg:justify-end">
          {/* Schedule Card */}
          <StatCard
            icon={<LuCalendarDays className="text-lg" />}
            label="Date"
            value={formatDate(match.date)}
            subtitle={match.startTime}
          />

          {/* Duration Card */}
          {match.endTime && (
            <StatCard
              icon={<LuClock className="text-lg" />}
              label="Time"
              value={match.startTime}
              subtitle={`to ${match.endTime}`}
            />
          )}

          {/* Players Card */}
          <StatCard
            icon={<LuUsers className="text-lg" />}
            label="Players"
            value={match.leaderboard?.length || match.participants || 0}
          />

          {/* Prize Pool Card */}
          <StatCard
            icon={<TbTrophy className="text-lg" />}
            label="Prize Pool"
            highlighted
          >
            <p className="text-gold text-base font-bold sm:text-lg">
              {match.prizePool?.toLocaleString()} 💎
            </p>
          </StatCard>
        </div>
      </div>

      {/* Player Performance Summary (if user participated) */}
      {playerPerformance && (
        <>
          <div className="via-gold-dark/50 h-[1px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="flex flex-col gap-4 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {getPositionBadge(playerPerformance.position)}
                <div>
                  <p className="text-sm text-gray-400">Your Placement</p>
                  <p className="text-xl font-bold text-white">
                    {playerPerformance.position === 1
                      ? "1st Place 🏆"
                      : playerPerformance.position === 2
                        ? "2nd Place 🥈"
                        : playerPerformance.position === 3
                          ? "3rd Place 🥉"
                          : `#${playerPerformance.position}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs text-gray-400">Score</p>
                <p className="text-lg font-bold text-white">
                  {playerPerformance.score?.toLocaleString() || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs text-gray-400">Kills</p>
                <p className="text-lg font-bold text-green-400">
                  {playerPerformance.kills || 0}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs text-gray-400">Deaths</p>
                <p className="text-lg font-bold text-red-400">
                  {playerPerformance.deaths || 0}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs text-gray-400">K/D</p>
                <p className="text-lg font-bold text-white">
                  {playerPerformance.kdRatio || "0.0"}
                </p>
              </div>
              {playerPerformance.prizeAmount > 0 && (
                <div className="bg-gold/10 border-gold/30 rounded-lg border px-4 py-2">
                  <p className="text-gold text-xs">Prize Won</p>
                  <p className="text-gold text-lg font-bold">
                    {playerPerformance.prizeAmount.toLocaleString()} 💎
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// Reusable stat card component
function StatCard({ icon, label, value, subtitle, highlighted, children }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlighted
          ? "bg-gold/10 border-gold/30"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <div
            className={`${highlighted ? "text-gold" : "text-gray-400"}`}
          >
            {icon}
          </div>
        )}
        <span
          className={`text-xs ${highlighted ? "text-gold" : "text-gray-400"}`}
        >
          {label}
        </span>
      </div>
      {children || (
        <div className="mt-1">
          <p
            className={`text-sm font-semibold ${
              highlighted ? "text-gold" : "text-white"
            } sm:text-base`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

