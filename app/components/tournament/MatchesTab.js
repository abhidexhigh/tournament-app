"use client";

import { useState, useEffect } from "react";
import Card from "../Card";
import { LuCalendarDays, LuUsers } from "react-icons/lu";
import { FaTrophy, FaClock } from "react-icons/fa";
import matchesData from "../../../data/matches.json";

export default function MatchesTab() {
  const [matchFilter, setMatchFilter] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const staticMatches = matchesData.matches;

  const filteredMatches = staticMatches.filter((match) => {
    if (matchFilter === "all") return true;
    if (matchFilter === "ongoing") return match.status === "ongoing";
    if (matchFilter === "completed") return match.status === "completed";
    return true;
  });

  useEffect(() => {
    if (!selectedMatch && filteredMatches.length > 0) {
      setSelectedMatch(filteredMatches[0]);
    }
  }, [filteredMatches, selectedMatch]);

  const allCount = staticMatches.length;
  const ongoingCount = staticMatches.filter(
    (m) => m.status === "ongoing"
  ).length;
  const completedCount = staticMatches.filter(
    (m) => m.status === "completed"
  ).length;

  if (staticMatches.length === 0) {
    return <NoMatches />;
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Left Side - Match List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <MatchListHeader
              filteredCount={filteredMatches.length}
              totalCount={staticMatches.length}
            />

            <MatchFilterButtons
              matchFilter={matchFilter}
              setMatchFilter={setMatchFilter}
              allCount={allCount}
              ongoingCount={ongoingCount}
              completedCount={completedCount}
            />

            <MatchList
              matches={filteredMatches}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              matchFilter={matchFilter}
            />
          </Card>
        </div>

        {/* Right Side - Match Leaderboard */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {selectedMatch ? (
            <MatchLeaderboard match={selectedMatch} />
          ) : (
            <NoMatchSelected />
          )}
        </div>
      </div>
    </div>
  );
}

function NoMatches() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏁</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No Matches Available
        </h3>
        <p className="text-gray-400">
          Matches will be available once participants join the tournament.
        </p>
      </div>
    </Card>
  );
}

function MatchListHeader({ filteredCount, totalCount }) {
  return (
    <div className="flex items-center justify-start mb-3 sm:mb-4 gap-2 sm:gap-4">
      <h3 className="text-lg sm:text-xl font-bold text-gold-gradient flex items-center gap-2">
        <FaTrophy className="text-gold text-base sm:text-lg" />{" "}
        <span>Matches</span>
      </h3>
      <div className="bg-gold/20 px-2 sm:px-3 rounded-lg">
        <span className="text-gold font-semibold text-[9px] sm:text-[10px]">
          {filteredCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}

function MatchFilterButtons({
  matchFilter,
  setMatchFilter,
  allCount,
  ongoingCount,
  completedCount,
}) {
  const filters = [
    { id: "all", label: "All", count: allCount },
    { id: "ongoing", label: "Ongoing", count: ongoingCount },
    { id: "completed", label: "Completed", count: completedCount },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gold-dark/30 overflow-hidden mb-4 sm:mb-6 w-full">
      {filters.map((filter, index) => (
        <button
          key={filter.id}
          onClick={() => setMatchFilter(filter.id)}
          className={`flex-1 px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
            index < filters.length - 1 ? "border-r border-gold-dark/30" : ""
          } ${
            matchFilter === filter.id
              ? "bg-gold text-dark-primary"
              : "bg-dark-secondary text-gray-400 hover:bg-dark-secondary/70 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-1 sm:gap-2">
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{filter.label.slice(0, 3)}</span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                matchFilter === filter.id
                  ? "bg-dark-primary/30 text-dark-primary"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {filter.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function MatchList({ matches, selectedMatch, setSelectedMatch, matchFilter }) {
  if (matches.length === 0) {
    return <EmptyMatchList matchFilter={matchFilter} />;
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[700px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
      {matches.map((match, index) => (
        <MatchCard
          key={match.id}
          match={match}
          index={index}
          isSelected={selectedMatch?.id === match.id}
          onClick={() => setSelectedMatch(match)}
        />
      ))}
    </div>
  );
}

function EmptyMatchList({ matchFilter }) {
  const messages = {
    ongoing: {
      title: "No Ongoing Matches",
      description: "There are no ongoing matches at the moment.",
    },
    completed: {
      title: "No Completed Matches",
      description: "No completed matches found.",
    },
    all: {
      title: "No Matches",
      description: "No matches available yet.",
    },
  };

  const message = messages[matchFilter] || messages.all;

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-white mb-2">{message.title}</h3>
      <p className="text-gray-400">{message.description}</p>
    </div>
  );
}

function MatchCard({ match, index, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
        isSelected ? "" : "hover:shadow-xl"
      }`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 ${
          isSelected
            ? "bg-gold/10 from-gold/20 via-gold/10 to-transparent"
            : "bg-gradient-to-br from-dark-card via-dark-secondary to-dark-card"
        }`}
      />

      {/* Content */}
      <div className="relative p-3 sm:p-4">
        {/* Match number badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className="bg-gold/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-gold/30">
            <span className="text-gold font-bold text-[10px] sm:text-xs">
              #{index + 1}
            </span>
          </div>
        </div>

        {/* Match title */}
        <h4
          className={`font-bold mb-2 sm:mb-3 pr-10 sm:pr-12 ${
            isSelected
              ? "text-gold text-base sm:text-lg"
              : "text-white text-sm sm:text-base"
          }`}
        >
          {match.title}
        </h4>

        {/* Match info grid */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-1 sm:gap-0 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-gray-400">
                <LuCalendarDays className="text-xs sm:text-sm" />
                <span className="font-medium">{match.date}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <FaClock className="text-xs sm:text-sm" />
              <span className="text-xs sm:text-sm">
                {match.startTime} - {match.endTime}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-700/50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1">
                <LuUsers className="text-xs sm:text-sm" />
                <span className="font-semibold text-xs sm:text-sm">
                  {match.participants}
                </span>
              </div>
              <div
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold ${
                  match.status === "ongoing"
                    ? "bg-blue-500/20 text-blue-400"
                    : match.status === "completed"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-700/50 text-gray-400"
                }`}
              >
                {match.status?.toUpperCase() || "COMPLETED"}
              </div>
            </div>

            {/* Prize pool */}
            <div className="flex items-center space-x-1">
              <span className="text-gold text-base sm:text-lg">💎</span>
              <span className="text-gold font-bold text-xs sm:text-sm">
                {match.prizePool.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold via-yellow-400 to-gold" />
        )}
      </div>
    </button>
  );
}

function MatchLeaderboard({ match }) {
  return (
    <Card glass className="!p-0">
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 pb-0">
        <h3 className="text-xl sm:text-2xl font-bold text-gold-gradient mb-2">
          {match.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 sm:gap-8 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <LuCalendarDays className="text-xs sm:text-sm" />
            <span>{match.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-xs sm:text-sm" />
            <span className="text-gray-400">
              {match.startTime} - {match.endTime}
            </span>
          </div>
          <span className="text-gold font-semibold text-sm sm:text-base">
            {match.prizePool.toLocaleString()} 💎
          </span>
        </div>
      </div>
      <div>
        {match.leaderboard.map((entry) => (
          <LeaderboardEntry key={entry.playerId} entry={entry} />
        ))}
      </div>
    </Card>
  );
}

function LeaderboardEntry({ entry }) {
  const positionIcons = {
    1: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/First_xf1xz2.webp",
    2: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/second_nak1rc.webp",
    3: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/3rd_dxdd3t.webp",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gold/10 border-b border-white/20 px-4 sm:px-8 gap-3 sm:gap-0">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-gold min-w-[2.5rem] sm:min-w-[3rem]">
            {entry.position <= 3 ? (
              <img
                src={positionIcons[entry.position]}
                alt={`${entry.position} Place`}
                width={24}
                height={24}
                className="w-6 sm:w-8"
              />
            ) : (
              <span className="text-xs sm:text-sm">#{entry.position}</span>
            )}
          </span>
          <div className="text-2xl sm:text-3xl">{entry.avatar}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm sm:text-base truncate">
            {entry.username}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
            <span>Score: {entry.score.toLocaleString()}</span>
            <span>Kills: {entry.kills}</span>
            {/* <span>K/D: {entry.kdRatio}</span> */}
          </div>
        </div>
      </div>
      <div className="text-left sm:text-right">
        {entry.prizeAmount > 0 && (
          <div className="bg-gold/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gold/40 inline-block">
            <p className="text-gold font-bold text-sm sm:text-base">
              +${(entry.prizeAmount / 100).toLocaleString()} USD
            </p>
            <p className="text-gold/80 text-xs">Prize Won</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NoMatchSelected() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-gray-400">Select a match to view the leaderboard</p>
      </div>
    </Card>
  );
}
