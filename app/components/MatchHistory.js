"use client";

import Badge from "./Badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PRIMARY_CURRENCY, getPrimaryCurrency } from "../lib/currencyConfig";

export default function MatchHistory({ matches, playerId }) {
  const router = useRouter();
  const currencyInfo = getPrimaryCurrency();

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
            No Matches Played Yet
          </h3>
          <p className="mx-auto mb-8 max-w-md text-lg text-gray-400">
            Start competing in tournaments to see your match results here!
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
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Sort matches by date (most recent first)
  const sortedMatches = [...matches].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

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

      {/* Table Container */}
      <div className="relative overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase">
                Position
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase">
                Match
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-400 uppercase">
                Date
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                Status
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-400 uppercase">
                Score
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                Kills
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                Deaths
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold tracking-wider text-gray-400 uppercase">
                K/D
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-400 uppercase">
                Prize
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
                            Upcoming
                          </span>
                          <span className="text-[10px] text-gray-600">
                            Not Started
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
                              Live
                            </span>
                            <span className="text-[10px] text-gray-600">
                              Current
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
                          {formatCurrency(match.prizePool || 0)} Pool
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
                          🔴 Live
                        </Badge>
                        <span className="text-gold-light-text text-xs">
                          In Progress
                        </span>
                      </div>
                    ) : match.status === "upcoming" ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={match.status}
                          className="text-sm capitalize"
                        >
                          Upcoming
                        </Badge>
                        <span className="text-gold-light-text text-xs">
                          Scheduled
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
                        TBD
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
      <div className="relative border-t border-white/10 bg-white/5 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-base">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-gold-light-text">Total Matches:</span>
              <span className="text-gold ml-2 text-lg font-bold">
                {sortedMatches.length}
              </span>
            </div>
            <div>
              <span className="text-gold-light-text">Wins:</span>
              <span className="text-gold ml-2 text-lg font-bold">
                {
                  sortedMatches.filter((m) => {
                    const p = getPlayerPerformance(m);
                    return p?.position === 1;
                  }).length
                }
              </span>
            </div>
            <div>
              <span className="text-gray-400">Top 3:</span>
              <span className="text-gold ml-2 text-lg font-bold">
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
            <span className="text-gold-light-text text-base">Total Prize:</span>
            <span className="text-gold ml-2 text-xl font-black">
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
