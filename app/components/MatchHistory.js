"use client";

import Badge from "./Badge";

export default function MatchHistory({ matches, playerId }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl border border-gold-dark/20">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-card/60 via-dark-card/40 to-dark-card/60" />
        <div className="relative text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border-2 border-purple-500/20">
            <span className="text-6xl">🎯</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">
            No Matches Played Yet
          </h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
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
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
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
    return "bg-dark-card/40";
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
    <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-card/80" />

      {/* Info Banner for Ongoing Matches */}
      {sortedMatches.some((m) => {
        const p = getPlayerPerformance(m);
        return p && m.status === "ongoing";
      }) && (
        <div className="relative bg-white/5 border-b border-white/10 px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400 text-lg animate-pulse">🔴</span>
            <div>
              <span className="text-white font-semibold">Live Matches: </span>
              <span className="text-gray-400">
                Rankings shown are{" "}
                <span className="text-white font-bold">current standings</span>{" "}
                and will update as the match progresses.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Match
              </th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                Kills
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                Deaths
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                K/D
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
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
                  className={`${getRowBgClass(
                    performance.position
                  )} hover:bg-white/5 transition-colors duration-200`}
                >
                  {/* Position */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-2xl ${getPositionColorClass(
                          performance.position
                        )}`}
                      >
                        {getPositionBadge(performance.position)}
                      </div>
                      {match.status === "ongoing" && (
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider animate-pulse">
                            Live
                          </span>
                          <span className="text-[9px] text-gray-600">
                            Current
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Match Title */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-white line-clamp-2 max-w-xs">
                      {match.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      💎 {match.prizePool?.toLocaleString()} Pool
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatDate(match.date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {match.startTime}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {match.status === "ongoing" ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={match.status}
                          className="capitalize text-xs"
                        >
                          🔴 Live
                        </Badge>
                        <span className="text-[10px] text-gray-500">
                          In Progress
                        </span>
                      </div>
                    ) : (
                      <Badge
                        variant={match.status}
                        className="capitalize text-xs"
                      >
                        {match.status}
                      </Badge>
                    )}
                  </td>

                  {/* Score */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-white">
                      {performance.score?.toLocaleString() || "N/A"}
                    </div>
                  </td>

                  {/* Kills */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-white">
                      {performance.kills || 0}
                    </div>
                  </td>

                  {/* Deaths */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-white">
                      {performance.deaths || 0}
                    </div>
                  </td>

                  {/* K/D Ratio */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-white">
                      {performance.kdRatio || "0.0"}
                    </div>
                  </td>

                  {/* Prize */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    {match.status === "ongoing" ? (
                      <div className="text-xs text-gray-500 font-medium">
                        TBD
                      </div>
                    ) : performance.prizeAmount > 0 ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gold/20 border border-gold/30">
                        <span className="text-sm font-black text-gold">
                          {performance.prizeAmount.toLocaleString()}
                        </span>
                        <span className="text-xs">💎</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="relative bg-white/5 border-t border-white/10 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-gray-400">Total Matches:</span>
              <span className="ml-2 font-bold text-white">
                {sortedMatches.length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Wins:</span>
              <span className="ml-2 font-bold text-gold">
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
              <span className="ml-2 font-bold text-gold">
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
            <span className="text-gray-400">Total Prize:</span>
            <span className="ml-2 font-black text-gold text-lg">
              {sortedMatches
                .reduce((sum, m) => {
                  const p = getPlayerPerformance(m);
                  return sum + (p?.prizeAmount || 0);
                }, 0)
                .toLocaleString()}{" "}
              💎
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
