"use client";

import { useState } from "react";
import Badge from "./Badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PRIMARY_CURRENCY, getPrimaryCurrency } from "../lib/currencyConfig";
import { useTranslations } from "../contexts/LocaleContext";
import { formatDate as formatDateUtil } from "../lib/dateUtils";

export default function MatchHistory({ matches, playerId }) {
  const router = useRouter();
  const currencyInfo = getPrimaryCurrency();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const MOBILE_INITIAL_COUNT = 5;
  const t = useTranslations("matchHistory");

  // Toggle individual card expansion
  const toggleCardExpansion = (matchId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  // Format currency based on config
  const formatCurrency = (amount) => {
    if (PRIMARY_CURRENCY === "USD") {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `${Number(amount).toLocaleString()} 💎`;
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="border-gold-dark/20 relative overflow-hidden rounded-2xl border backdrop-blur-xl">
        <div className="from-dark-card/60 via-dark-card/40 to-dark-card/60 absolute inset-0 bg-gradient-to-br" />
        <div className="relative px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-purple-500/5">
            <span className="text-6xl">🎯</span>
          </div>
          <h3 className="mb-3 text-3xl font-bold text-white">
            {t("noMatches")}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-lg text-gray-400">
            {t("startCompeting")}
          </p>
        </div>
      </div>
    );
  }

  // Get player's performance in a match
  const getPlayerPerformance = (match) => {
    if (!match.leaderboard) return null;
    return match.leaderboard.find((entry) => entry.playerId === playerId);
  };

  // Get position medal/emoji
  const getPositionBadge = (position) => {
    if (position === 1)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp"
          alt="1st place"
          width={24}
          height={24}
          className="w-6 sm:w-8"
        />
      );
    if (position === 2)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp"
          alt="2nd place"
          width={24}
          height={24}
          className="w-6 sm:w-8"
        />
      );
    if (position === 3)
      return (
        <Image
          src="https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp"
          alt="3rd place"
          width={24}
          height={24}
          className="w-6 sm:w-8"
        />
      );
    return position;
  };

  // Get position color classes
  const getPositionColorClass = (position) => {
    if (position === 1) return "text-yellow-400 font-black";
    if (position === 2) return "text-gray-300 font-black";
    if (position === 3) return "text-orange-400 font-black";
    if (position <= 10) return "text-green-400 font-bold";
    return "text-gray-400 font-medium";
  };

  // Get row background class
  const getRowBgClass = (position) => {
    if (position === 1)
      return "bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent";
    if (position === 2)
      return "bg-gradient-to-r from-gray-400/20 via-gray-400/10 to-transparent";
    if (position === 3)
      return "bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent";
    return "bg-dark-secondary-accent/90";
  };

  // Format date
  const formatDate = (dateStr) => formatDateUtil(dateStr);

  // Sort matches by date (most recent first)
  const sortedMatches = [...matches].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Filter matches with valid performance data
  const matchesWithPerformance = sortedMatches.filter((match) => {
    const performance = getPlayerPerformance(match);
    return performance !== null;
  });

  // Mobile visible matches based on expanded state
  const mobileVisibleMatches = mobileExpanded
    ? matchesWithPerformance
    : matchesWithPerformance.slice(0, MOBILE_INITIAL_COUNT);

  const hasMoreMatches = matchesWithPerformance.length > MOBILE_INITIAL_COUNT;
  const remainingCount = matchesWithPerformance.length - MOBILE_INITIAL_COUNT;

  // Mobile Match Card Component - Collapsible
  const MobileMatchCard = ({ match, isExpanded, onToggle }) => {
    const performance = getPlayerPerformance(match);
    if (!performance) return null;

    return (
      <div
        className={`${getRowBgClass(performance.position)} overflow-hidden rounded-xl border border-white/10 transition-all duration-200`}
      >
        {/* Collapsed Header - Always visible, clickable */}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-2 p-3 text-left"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {/* Position Badge - Compact */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30">
              {match.status === "upcoming" ? (
                <span className="text-sm text-gray-500">—</span>
              ) : (
                <div
                  className={`scale-75 ${getPositionColorClass(performance.position)}`}
                >
                  {getPositionBadge(performance.position)}
                </div>
              )}
            </div>
            {/* Match Info - Compact */}
            <div className="min-w-0 flex-1">
              <h3 className="text-gold-light-text truncate text-base font-semibold">
                {match.title}
              </h3>
              <div className="text-gold-light-text/70 mt-0.5 text-sm">
                {formatDate(match.date)}
              </div>
            </div>
          </div>
          {/* Right side: Prize + Status + Chevron */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Prize (compact) */}
            {match.status === "completed" && performance.prizeAmount > 0 ? (
              <span className="text-gold text-base font-bold">
                {formatCurrency(performance.prizeAmount)}
              </span>
            ) : match.status !== "completed" ? (
              <span className="text-sm text-gray-500">{t("tbd")}</span>
            ) : null}
            {/* Status indicator */}
            {match.status === "ongoing" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
            )}
            {/* Chevron */}
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Expandable Content */}
        <div
          className={`grid transition-all duration-200 ease-in-out ${
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-white/5 px-3 pb-3">
              {/* Status Badge */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">{t("status")}</span>
                {match.status === "ongoing" ? (
                  <Badge variant={match.status} className="text-xs">
                    🔴 {t("live")}
                  </Badge>
                ) : match.status === "upcoming" ? (
                  <Badge variant={match.status} className="text-xs">
                    {t("upcoming")}
                  </Badge>
                ) : (
                  <Badge variant={match.status} className="text-xs capitalize">
                    {match.status}
                  </Badge>
                )}
              </div>

              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-white/5 bg-black/20 p-2.5">
                <div className="text-center">
                  <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("score")}
                  </div>
                  <div className="text-gold-light-text text-base font-bold">
                    {match.status === "upcoming"
                      ? "—"
                      : performance.score?.toLocaleString() || "N/A"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("kills")}
                  </div>
                  <div className="text-gold-light-text text-base font-bold">
                    {match.status === "upcoming" ? "—" : performance.kills || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("deaths")}
                  </div>
                  <div className="text-gold-light-text text-base font-bold">
                    {match.status === "upcoming"
                      ? "—"
                      : performance.deaths || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t("kd")}
                  </div>
                  <div className="text-gold-light-text text-base font-bold">
                    {match.status === "upcoming"
                      ? "—"
                      : performance.kdRatio || "0.0"}
                  </div>
                </div>
              </div>

              {/* Prize Footer */}
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {t("pool")}: {formatCurrency(match.prizePool || 0)}
                </span>
                <span className="text-gray-500">{match.startTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-xl">
      <div className="from-dark-card/80 via-dark-card/60 to-dark-card/80 absolute inset-0 bg-gradient-to-br" />

      {/* Info Banner for Live/Upcoming Matches */}
      {(sortedMatches.some((m) => {
        const p = getPlayerPerformance(m);
        return p && m.status === "ongoing";
      }) ||
        sortedMatches.some((m) => {
          const p = getPlayerPerformance(m);
          return p && m.status === "upcoming";
        })) && (
        <div className="relative hidden border-b border-white/10 bg-white/5 px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-lg text-gray-400">ℹ️</span>
            <div>
              <span className="font-semibold text-white">
                Match Information:{" "}
              </span>
              <span className="text-gray-400">
                <span className="text-white">Live matches</span> show current
                standings. <span className="text-white">Upcoming matches</span>{" "}
                show scheduled date and prize pool. Results will appear after
                the match completes.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View - Hidden on md and above */}
      <div className="relative block md:hidden">
        <div className="space-y-2 p-3">
          {mobileVisibleMatches.map((match) => (
            <MobileMatchCard
              key={match.id}
              match={match}
              isExpanded={expandedCards[match.id] || false}
              onToggle={() => toggleCardExpansion(match.id)}
            />
          ))}
        </div>

        {/* Show More / Show Less Button */}
        {hasMoreMatches && (
          <div className="relative px-3 pb-3">
            <button
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="border-gold-dark/30 bg-gold-dark/10 hover:bg-gold-dark/20 flex w-full items-center justify-center gap-1.5 rounded-lg border py-2.5 transition-all duration-200"
            >
              <span className="text-gold-light-text text-xs font-medium">
                {mobileExpanded
                  ? t("showLess")
                  : t("showMore", { count: remainingCount })}
              </span>
              <svg
                className={`text-gold-light-text h-3.5 w-3.5 transition-transform duration-200 ${mobileExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="relative hidden overflow-x-auto md:block">
        <table className="w-full">
          {/* Table Header */}
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("position")}
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("match")}
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("date")}
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("status")}
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("score")}
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("kills")}
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("deaths")}
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("kd")}
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-400 uppercase">
                {t("prize")}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/5">
            {sortedMatches.map((match) => {
              const performance = getPlayerPerformance(match);
              if (!performance) return null;

              return (
                <tr
                  key={match.id}
                  // onClick={() => router.push(`/match/${match.id}`)}
                  className={`${getRowBgClass(
                    performance.position,
                  )} transition-colors duration-200 hover:bg-white/10`}
                >
                  {/* Position */}
                  <td className="px-4 py-5 whitespace-nowrap">
                    {match.status === "upcoming" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-gray-500">—</span>
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                            {t("upcoming")}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {t("notStarted")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-3xl ${getPositionColorClass(
                            performance.position,
                          )}`}
                        >
                          {getPositionBadge(performance.position)}
                        </div>
                        {match.status === "ongoing" && (
                          <div className="flex flex-col items-start">
                            <span className="animate-pulse text-xs font-bold tracking-wider text-gray-400 uppercase">
                              {t("live")}
                            </span>
                            <span className="text-[10px] text-gray-600">
                              {t("current")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Match Title */}
                  <td className="px-4 py-5">
                    <div className="group flex items-center gap-2">
                      <div>
                        <div className="text-gold-light-text group-hover:text-gold line-clamp-2 max-w-xs text-base font-normal transition-colors">
                          {match.title}
                        </div>
                        <div className="text-gold-light-text mt-1 text-sm">
                          {formatCurrency(match.prizePool || 0)} {t("pool")}
                        </div>
                      </div>
                      <span className="text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="text-gold-light-text text-base">
                      {formatDate(match.date)}
                    </div>
                    <div className="text-gold-light-text text-sm">
                      {match.startTime}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-5 text-center whitespace-nowrap">
                    {match.status === "ongoing" ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={match.status}
                          className="text-sm capitalize"
                        >
                          🔴 {t("live")}
                        </Badge>
                        <span className="text-gold-light-text text-xs">
                          {t("inProgress")}
                        </span>
                      </div>
                    ) : match.status === "upcoming" ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={match.status}
                          className="text-sm capitalize"
                        >
                          {t("upcoming")}
                        </Badge>
                        <span className="text-gold-light-text text-xs">
                          {t("scheduled")}
                        </span>
                      </div>
                    ) : (
                      <Badge
                        variant={match.status}
                        className="text-sm capitalize"
                      >
                        {match.status}
                      </Badge>
                    )}
                  </td>

                  {/* Score */}
                  <td className="px-4 py-5 text-right whitespace-nowrap">
                    <div className="text-gold-light-text text-base font-bold">
                      {match.status === "upcoming"
                        ? "—"
                        : performance.score?.toLocaleString() || "N/A"}
                    </div>
                  </td>

                  {/* Kills */}
                  <td className="px-4 py-5 text-center whitespace-nowrap">
                    <div className="text-gold-light-text text-base font-bold">
                      {match.status === "upcoming"
                        ? "—"
                        : performance.kills || 0}
                    </div>
                  </td>

                  {/* Deaths */}
                  <td className="px-4 py-5 text-center whitespace-nowrap">
                    <div className="text-gold-light-text text-base font-bold">
                      {match.status === "upcoming"
                        ? "—"
                        : performance.deaths || 0}
                    </div>
                  </td>

                  {/* K/D Ratio */}
                  <td className="px-4 py-5 text-center whitespace-nowrap">
                    <div className="text-gold-light-text text-base font-bold">
                      {match.status === "upcoming"
                        ? "—"
                        : performance.kdRatio || "0.0"}
                    </div>
                  </td>

                  {/* Prize */}
                  <td className="px-4 py-5 text-right whitespace-nowrap">
                    {match.status === "upcoming" ||
                    match.status === "ongoing" ? (
                      <div className="text-gold-light-text text-sm font-medium">
                        {t("tbd")}
                      </div>
                    ) : performance.prizeAmount > 0 ? (
                      <div className="bg-gold/20 border-gold/30 inline-flex items-center gap-1 rounded-lg border px-3 py-1.5">
                        <span className="text-gold text-base font-black">
                          {formatCurrency(performance.prizeAmount)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gold-light-text text-base">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="relative border-t border-white/10 bg-white/5 px-3 py-3 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-2 text-xs md:gap-4 md:text-base">
          <div className="flex items-center gap-3 md:gap-8">
            <div>
              <span className="md:text-gold-light-text text-gray-500">
                {t("matches")}:
              </span>
              <span className="text-gold ml-1 font-bold md:ml-2 md:text-lg">
                {sortedMatches.length}
              </span>
            </div>
            <div>
              <span className="md:text-gold-light-text text-gray-500">
                {t("wins")}:
              </span>
              <span className="text-gold ml-1 font-bold md:ml-2 md:text-lg">
                {
                  sortedMatches.filter((m) => {
                    const p = getPlayerPerformance(m);
                    return p?.position === 1;
                  }).length
                }
              </span>
            </div>
            <div className="hidden md:block">
              <span className="text-gray-400">{t("top3")}:</span>
              <span className="text-gold ml-2 font-bold md:text-lg">
                {
                  sortedMatches.filter((m) => {
                    const p = getPlayerPerformance(m);
                    return p?.position <= 3;
                  }).length
                }
              </span>
            </div>
          </div>
          <div>
            <span className="md:text-gold-light-text text-gray-500 md:text-base">
              {t("total")}:
            </span>
            <span className="text-gold ml-1 text-sm font-bold md:ml-2 md:text-xl md:font-black">
              {formatCurrency(
                sortedMatches.reduce((sum, m) => {
                  const p = getPlayerPerformance(m);
                  return sum + (p?.prizeAmount || 0);
                }, 0),
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
