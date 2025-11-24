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

function PlayerDashboardContent() {
  const { user } = useUser();
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
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

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Get tournaments the user has joined
          const allTournaments = await tournamentsApi.getAll();
          const userTournaments = allTournaments.filter((t) =>
            t.participants.includes(user.id)
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
            (m) => m.status === "completed"
          );
          const wins = completedMatches.filter((m) => {
            const playerPerformance = m.leaderboard?.find(
              (entry) => entry.playerId === user.id
            );
            return playerPerformance?.position === 1;
          }).length;

          const top3Finishes = completedMatches.filter((m) => {
            const playerPerformance = m.leaderboard?.find(
              (entry) => entry.playerId === user.id
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
        }
      }
    };

    loadData();
  }, [user]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
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

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-main mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {/* Tournaments Joined Card */}
            <div className="bg-gold-light/80 backdrop-blur-xl p-[1px] chamfered-div">
              <div className="group relative overflow-hidden bg-gold-card-bg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] chamfered-div">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-5">
                  <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 group-hover:shadow-white/20 transition-all duration-300">
                      <span className="text-3xl">🎮</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-white mb-1">
                        {stats.totalJoined}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Tournaments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Winnings Card */}
            <div className="bg-gold-light/80 backdrop-blur-xl p-[1px] chamfered-div">
              <div className="group relative overflow-hidden bg-gold-card-bg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] chamfered-div">
                <div className="absolute inset-0 bg-gradient-to-tl from-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-5">
                  <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-gold/40 via-gold/20 to-transparent items-center justify-center border border-gold/40 shadow-xl shadow-gold/30 group-hover:scale-110 group-hover:shadow-gold/50 transition-all duration-300">
                      <span className="text-3xl">💰</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-gold mb-1">
                        {stats.totalWinnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Total Winnings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wins Card */}
            <div className="bg-gold-light/80 backdrop-blur-xl p-[1px] chamfered-div">
              <div className="group relative overflow-hidden bg-gold-card-bg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] chamfered-div">
                <div className="absolute inset-0 bg-gradient-to-tl from-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-5">
                  <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-gold/40 via-gold/20 to-transparent items-center justify-center border border-gold/40 shadow-xl shadow-gold/30 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-gold/50 transition-all duration-300">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-gold mb-1">
                        {stats.wins}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Total Wins
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Finishes Card */}
            <div className="bg-gold-light/80 backdrop-blur-xl p-[1px] chamfered-div">
              <div className="group relative overflow-hidden bg-gold-card-bg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] chamfered-div">
                <div className="absolute inset-0 bg-gradient-to-tl from-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-5">
                  <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-gold/40 via-gold/20 to-transparent items-center justify-center border border-gold/40 shadow-xl shadow-gold/30 group-hover:scale-110 group-hover:shadow-gold/50 transition-all duration-300">
                      <span className="text-3xl">🥇</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-gold mb-1">
                        {stats.top3Finishes}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Top 3 Finishes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match History Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-gold-text">
                Match Results
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
    <ProtectedRoute requiredRole="player">
      <PlayerDashboardContent />
    </ProtectedRoute>
  );
}
