"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import StatCard from "../../components/StatCard";
import TransactionHistory from "../../components/TransactionHistory";
import { useUser } from "../../contexts/UserContext";
import { tournamentsApi, transactionsApi, matchesApi } from "../../lib/api";
import MatchHistory from "../../components/MatchHistory";
import Image from "next/image";
import { useTranslations } from "../../contexts/LocaleContext";
import PlayerDashboardSkeleton from "../../components/skeletons/PlayerDashboardSkeleton";

function PlayerDashboardContent() {
  const { user } = useUser();
  const t = useTranslations("dashboard");
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
  const router = useRouter();

  // Apply dashboard-specific background
  useEffect(() => {
    document.body.classList.add("dashboard-bg");
    return () => {
      document.body.classList.remove("dashboard-bg");
    };
  }, []);

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
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {/* Tournaments Joined Card */}
            <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
              <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                  <Image
                    src="/icons/002.webp"
                    alt="Tournaments"
                    width={26}
                    height={26}
                  />
                </div>
                <div className="text-gold-text text-2xl font-bold md:text-3xl">
                  {stats.totalJoined}
                </div>
                <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                  {t("tournaments")}
                </div>
              </div>
            </div>

            {/* Total Winnings Card */}
            <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
              <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
              <div className="flex flex-col items-center text-center">
                <div className="border-gold-dark/30 bg-gold-dark/15 mb-3 flex h-11 w-11 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                  <Image
                    src="/icons/004.webp"
                    alt="Gold"
                    width={26}
                    height={26}
                  />
                </div>
                <div className="text-gold text-2xl font-bold md:text-3xl">
                  {stats.totalWinnings.toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                  {t("totalWinnings")}
                </div>
              </div>
            </div>

            {/* Wins Card */}
            <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
              <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                  <Image
                    src="/icons/003.webp"
                    alt="Wins"
                    width={26}
                    height={26}
                  />
                </div>
                <div className="text-gold-text text-2xl font-bold md:text-3xl">
                  {stats.wins}
                </div>
                <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                  {t("totalWins")}
                </div>
              </div>
            </div>

            {/* Top 3 Finishes Card */}
            <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
              <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                  <Image
                    src="/icons/001.webp"
                    alt="Top 3 Finishes"
                    width={26}
                    height={26}
                  />
                </div>
                <div className="text-gold-text text-2xl font-bold md:text-3xl">
                  {stats.top3Finishes}
                </div>
                <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                  {t("top3Finishes")}
                </div>
              </div>
            </div>
          </div>

          {/* Match History Section */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-gold-text text-3xl font-bold">
                {t("matchResults")}
              </h2>
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
