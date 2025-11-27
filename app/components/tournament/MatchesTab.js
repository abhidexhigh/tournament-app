"use client";

import { useState, useEffect } from "react";
import Card from "../Card";
import { LuCalendarDays, LuUsers } from "react-icons/lu";
import { FaTrophy, FaClock } from "react-icons/fa";
import matchesData from "../../../data/matches.json";
import Image from "next/image";

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
    (m) => m.status === "ongoing",
  ).length;
  const completedCount = staticMatches.filter(
    (m) => m.status === "completed",
  ).length;

  if (staticMatches.length === 0) {
    return <NoMatches />;
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Left Side - Match List */}
        <div className="order-2 lg:order-1 lg:col-span-2">
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
        <div className="order-1 lg:order-2 lg:col-span-3">
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
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">🏁</div>
        <h3 className="mb-2 text-xl font-bold text-white">
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
    <div className="mb-3 flex items-center justify-start gap-2 sm:mb-4 sm:gap-4">
      <h3 className="text-gold-gradient flex items-center gap-2 text-lg font-bold sm:text-xl">
        <FaTrophy className="text-gold text-base sm:text-lg" />{" "}
        <span>Matches</span>
      </h3>
      <div className="bg-gold/20 rounded-lg px-2 sm:px-3">
        <span className="text-gold text-[9px] font-semibold sm:text-[10px]">
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
    <div className="border-gold-dark/30 mb-4 inline-flex w-full overflow-hidden rounded-lg border sm:mb-6">
      {filters.map((filter, index) => (
        <button
          key={filter.id}
          onClick={() => setMatchFilter(filter.id)}
          className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
            index < filters.length - 1 ? "border-gold-dark/30 border-r" : ""
          } ${
            matchFilter === filter.id
              ? "bg-gold text-dark-primary"
              : "bg-dark-secondary hover:bg-dark-secondary/70 text-gray-400 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-1 sm:gap-2">
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{filter.label.slice(0, 3)}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs ${
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
    <div className="custom-scrollbar max-h-[500px] space-y-3 overflow-y-auto pr-1 sm:max-h-[700px] sm:space-y-4 sm:pr-2">
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
    <div className="py-12 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="mb-2 text-xl font-bold text-white">{message.title}</h3>
      <p className="text-gray-400">{message.description}</p>
    </div>
  );
}

function MatchCard({ match, index, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full transform overflow-hidden rounded-xl text-left transition-all duration-300 hover:scale-[1.02] ${
        isSelected ? "" : "hover:shadow-xl"
      }`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 ${
          isSelected
            ? "bg-gold-card-bg"
            : "bg-dark-secondary-accent overflow-hidden rounded-xl border border-white/20"
        }`}
      />

      {/* Content */}
      <div className="relative p-3 sm:p-4">
        {/* Match number badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="bg-gold/20 border-gold/30 rounded-lg border px-1.5 py-0.5 backdrop-blur-sm sm:px-2 sm:py-1">
            <span className="text-gold text-[10px] font-bold sm:text-xs">
              #{index + 1}
            </span>
          </div>
        </div>

        {/* Match title */}
        <h4
          className={`mb-2 pr-10 font-bold sm:mb-3 sm:pr-12 ${
            isSelected
              ? "text-gold text-base sm:text-lg"
              : "text-sm text-white sm:text-base"
          }`}
        >
          {match.title}
        </h4>

        {/* Match info grid */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:gap-0 sm:space-x-6 sm:text-sm">
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
          <div className="flex items-center justify-between border-t border-gray-700/50 pt-1.5 sm:pt-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1">
                <LuUsers className="text-xs sm:text-sm" />
                <span className="text-xs font-semibold sm:text-sm">
                  {match.participants}
                </span>
              </div>
              <div
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:py-1 sm:text-xs ${
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
              <span className="text-gold text-xs font-bold sm:text-sm">
                {match.prizePool.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="from-gold to-gold absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r via-yellow-400" />
        )}
      </div>
    </button>
  );
}

function MatchLeaderboard({ match }) {
  return (
    <Card glass className="!p-0">
      <div className="mb-4 p-3 pb-0 sm:mb-6 sm:p-4">
        <h3 className="text-gold-gradient mb-2 text-xl font-bold sm:text-2xl">
          {match.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 sm:gap-8 sm:text-sm">
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
          <span className="text-gold text-sm font-semibold sm:text-base">
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
    <div className="bg-gold-card-bg flex flex-col gap-3 border-b border-white/20 p-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:p-4 sm:px-8">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-gold min-w-[2.5rem] text-xl font-bold sm:min-w-[3rem] sm:text-2xl">
            {entry.position <= 3 ? (
              <Image
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white sm:text-base">
            {entry.username}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 sm:gap-x-4 sm:text-sm">
            <span>Score: {entry.score.toLocaleString()}</span>
            <span>Kills: {entry.kills}</span>
            {/* <span>K/D: {entry.kdRatio}</span> */}
          </div>
        </div>
      </div>
      <div className="text-left sm:text-right">
        {entry.prizeAmount > 0 && (
          <div className="bg-gold/20 border-gold/40 inline-block rounded-lg border px-3 py-1.5 sm:px-4 sm:py-2">
            <p className="text-gold text-sm font-bold sm:text-base">
              +{entry.prizeAmount.toLocaleString()} 💎
            </p>
            <p className="text-gold/80 text-xs">
              (${entry.prizeAmount.toLocaleString()} USD)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NoMatchSelected() {
  return (
    <Card>
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">🎮</div>
        <p className="text-gray-400">Select a match to view the leaderboard</p>
      </div>
    </Card>
  );
}
