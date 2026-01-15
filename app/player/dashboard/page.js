"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useUser } from "../../contexts/UserContext";
import { tournamentsApi, transactionsApi, matchesApi } from "../../lib/api";
import { getUserClans } from "../../lib/dataLoader";
import MatchHistory from "../../components/MatchHistory";
import Image from "next/image";
import { useTranslations } from "../../contexts/LocaleContext";
import PlayerDashboardSkeleton from "../../components/skeletons/PlayerDashboardSkeleton";

function PlayerDashboardContent() {
  const { user, updateUser } = useUser();
  const t = useTranslations("dashboard");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJoined: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    totalWinnings: 0,
    totalMatches: 0,
    wins: 0,
    top3Finishes: 0,
  });

  const [userClans, setUserClans] = useState([]);

  // Apply dashboard-specific background
  useEffect(() => {
    document.body.classList.add("dashboard-bg");
    return () => {
      document.body.classList.remove("dashboard-bg");
    };
  }, []);

  // Load user's clan memberships when user loads
  useEffect(() => {
    if (user) {
      const loadClanData = async () => {
        try {
          const clans = await getUserClans(user.id);
          setUserClans(clans);
        } catch (error) {
          console.error("Error loading clan data:", error);
          setUserClans([]);
        }
      };

      loadClanData();
    }
  }, [user]);

  // Profile helper functions
  const getRankColor = (rank) => {
    const colors = {
      Silver: "text-gray-400",
      Gold: "text-yellow-400",
      Platinum: "text-blue-400",
      Diamond: "text-purple-400",
      Master: "text-red-400",
    };
    return colors[rank] || "text-gray-300";
  };

  const getRankEmblem = (rank) => {
    const emblems = {
      Gold: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289695/Gold_Emblem_odau8h.webp",
      Platinum:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Platinum_Emblem_with_effect_ixwafm.webp",
      Diamond:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Diomond_Emblem_with_effect_g6lssd.webp",
      Master:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747291235/Master_Emblem_with_effect_rd2xt6.webp",
    };
    return emblems[rank] || null;
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Get tournaments the user has joined
          const allTournaments = await tournamentsApi.getAll();
          const userTournaments = allTournaments.filter((t) =>
            t.participants.includes(user.id),
          );
          setJoinedTournaments(userTournaments);

          // Get user transactions
          const userTransactions = await transactionsApi.getByUserId(user.id);
          setTransactions(userTransactions);

          // Get user matches
          const userMatches = await matchesApi.getByPlayerId(user.id);
          setMatches(userMatches);

          // Calculate stats
          const totalWinnings = userTransactions
            .filter((t) => t.type === "prize_won")
            .reduce((sum, t) => sum + t.amount, 0);

          // Calculate match stats
          const completedMatches = userMatches.filter(
            (m) => m.status === "completed",
          );
          const wins = completedMatches.filter((m) => {
            const playerPerformance = m.leaderboard?.find(
              (entry) => entry.playerId === user.id,
            );
            return playerPerformance?.position === 1;
          }).length;

          const top3Finishes = completedMatches.filter((m) => {
            const playerPerformance = m.leaderboard?.find(
              (entry) => entry.playerId === user.id,
            );
            return playerPerformance?.position <= 3;
          }).length;

          setStats({
            totalJoined: userTournaments.length,
            upcoming: userTournaments.filter((t) => t.status === "upcoming")
              .length,
            ongoing: userTournaments.filter((t) => t.status === "ongoing")
              .length,
            completed: userTournaments.filter((t) => t.status === "completed")
              .length,
            totalWinnings,
            totalMatches: completedMatches.length,
            wins,
            top3Finishes,
          });
        } catch (error) {
          console.error("Failed to load dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  const formatDate = (dateStr) => {
    // Parse date string as local time to avoid timezone shifts
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasWon = (tournament, userId) => {
    if (!tournament.winners) return null;
    if (tournament.winners.first === userId) return "🥇 1st Place";
    if (tournament.winners.second === userId) return "🥈 2nd Place";
    if (tournament.winners.third === userId) return "🥉 3rd Place";
    return null;
  };

  if (isLoading) {
    return <PlayerDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto">
          {/* Profile + Stats Hero Section */}
          <div className="border-gold-dark/20 bg-dark-gray-card/80 relative mb-8 overflow-hidden rounded-2xl border p-5 shadow-lg shadow-gray-800/30 backdrop-blur-sm sm:px-6 sm:py-1 lg:px-8 lg:py-2">
            {/* Decorative elements */}
            <div className="bg-gold-dark/10 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl sm:h-64 sm:w-64"></div>
            <div className="bg-gold/5 absolute bottom-0 left-1/3 h-32 w-32 rounded-full blur-2xl sm:h-48 sm:w-48"></div>

            <div className="relative">
              {/* Profile Row */}
              <div className="mt-6 mb-6 flex flex-col gap-6 lg:mt-8 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Avatar + User Info */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="bg-gold-gradient absolute -inset-1 rounded-full opacity-75 blur"></div>
                    <div className="border-gold-dark/50 relative h-16 w-16 overflow-hidden rounded-full border-2 sm:h-20 sm:w-20">
                      {user.avatar &&
                      (user.avatar.startsWith("http") ||
                        user.avatar.startsWith("/")) ? (
                        <Image
                          src={user.avatar}
                          alt="Avatar"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="bg-gold/10 flex h-full w-full items-center justify-center text-3xl sm:text-4xl">
                          {user.avatar || "👤"}
                        </div>
                      )}
                    </div>
                    {/* <div className="border-dark-primary bg-gold text-dark-primary absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:h-7 sm:w-7">
                      P
                    </div> */}
                  </div>

                  {/* User Info */}
                  <div className="text-center sm:text-left">
                    <h1 className="text-gold-gradient mb-1 text-xl font-bold tracking-tight sm:text-2xl">
                      {user.username}
                    </h1>
                    <p className="mb-2 text-sm text-white/40">{user.email}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span className="bg-gold-dark/20 text-gold-light rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {user.type === "host" ? "🎮 " : "⚔️ "}
                        {tProfile(user.type) || user.type}
                      </span>
                      {/* {user.rank && (
                        <span
                          className={`bg-dark-primary/50 rounded-full px-3 py-1 text-xs font-medium ${getRankColor(user.rank)}`}
                        >
                          {user.rank}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Right: Game ID, Rank, Clan Info */}
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
                  {/* Game ID */}
                  <div className="border-gold-dark/30 bg-dark-primary/50 flex items-center gap-3 rounded-xl border px-4 py-3">
                    <div className="bg-gold-dark/20 text-gold flex h-9 w-9 items-center justify-center rounded-lg">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest text-white/40 uppercase">
                        {tProfile("gameId") || "Game ID"}
                      </p>
                      <p className="font-mono text-sm text-white">
                        {user?.gameId || tProfile("notSet") || "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="border-gold-dark/30 bg-dark-primary/50 flex items-center gap-3 rounded-xl border px-4 py-3">
                    {user?.rank && getRankEmblem(user.rank) ? (
                      <div className="h-9 w-9 flex-shrink-0">
                        <Image
                          src={getRankEmblem(user.rank)}
                          alt={user.rank}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-gold-dark/20 text-gold flex h-9 w-9 items-center justify-center rounded-lg">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] tracking-widest text-white/40 uppercase">
                        {tProfile("rank") || "Rank"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${user?.rank ? getRankColor(user.rank) : "text-white/50"}`}
                      >
                        {user?.rank || tProfile("notSet") || "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Clan */}
                  <div className="border-gold-dark/30 bg-dark-primary/50 flex items-center gap-3 rounded-xl border px-4 py-3">
                    {userClans.length > 0 ? (
                      <>
                        <span className="text-2xl">
                          {userClans[0].emblem || "🏰"}
                        </span>
                        <div>
                          <p className="text-[10px] tracking-widest text-white/40 uppercase">
                            {tProfile("clan") || "Clan"}
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {userClans[0].name}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gold-dark/20 text-gold flex h-9 w-9 items-center justify-center rounded-lg">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widest text-white/40 uppercase">
                            {tProfile("clan") || "Clan"}
                          </p>
                          <p className="text-sm text-white/50">
                            {tProfile("noClanJoined") || "No clan"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match History Section */}
          <div className="mb-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-gold-text text-3xl font-bold">
                {t("matchResults")}
              </h2>

              {/* Stats - Mobile: Simple inline | Desktop: Cards */}
              {/* Mobile Stats Row */}
              <div className="border-gold-dark/20 bg-dark-primary/40 flex items-center justify-between rounded-xl border px-4 py-3 sm:hidden">
                <div className="flex flex-col items-center">
                  <span className="text-gold-text text-lg font-bold">
                    {stats.totalJoined}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase">
                    {t("tournaments")}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-gold text-lg font-bold">
                    {stats.totalWinnings.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase">
                    {t("totalWinnings")}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-gold-text text-lg font-bold">
                    {stats.wins}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase">
                    {t("totalWins")}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-gold-text text-lg font-bold">
                    {stats.top3Finishes}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase">
                    Top 3
                  </span>
                </div>
              </div>

              {/* Desktop Stats Cards */}
              <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                {/* Tournaments Joined */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 transition-all duration-300">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/icons/002.webp"
                      alt="Tournaments"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>
                    <div className="text-gold-text text-lg font-bold">
                      {stats.totalJoined}
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase">
                      {t("tournaments")}
                    </div>
                  </div>
                </div>

                {/* Total Winnings */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 transition-all duration-300">
                  <div className="border-gold-dark/30 bg-gold-dark/15 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/icons/004.webp"
                      alt="Gold"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>
                    <div className="text-gold text-lg font-bold">
                      {stats.totalWinnings.toLocaleString()}
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase">
                      {t("totalWinnings")}
                    </div>
                  </div>
                </div>

                {/* Wins */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 transition-all duration-300">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/icons/003.webp"
                      alt="Wins"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>
                    <div className="text-gold-text text-lg font-bold">
                      {stats.wins}
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase">
                      {t("totalWins")}
                    </div>
                  </div>
                </div>

                {/* Top 3 Finishes */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 transition-all duration-300">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/icons/001.webp"
                      alt="Top 3 Finishes"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>
                    <div className="text-gold-text text-lg font-bold">
                      {stats.top3Finishes}
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase">
                      {t("top3Finishes")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <MatchHistory matches={matches} playerId={user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerDashboard() {
  return (
    <ProtectedRoute
      requiredRole="player"
      loadingComponent={<PlayerDashboardSkeleton />}
    >
      <PlayerDashboardContent />
    </ProtectedRoute>
  );
}
