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
        <div className="max-w-[1460px] mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white/10 via-dark-card to-dark-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Tournaments Joined
              </div>
              <div className="text-3xl font-black text-white">
                {stats.totalJoined}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 via-dark-card to-dark-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Upcoming
              </div>
              <div className="text-3xl font-black text-white">
                {stats.upcoming}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 via-dark-card to-dark-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Ongoing
              </div>
              <div className="text-3xl font-black text-white">
                {stats.ongoing}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 via-dark-card to-dark-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Completed
              </div>
              <div className="text-3xl font-black text-white">
                {stats.completed}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gold/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-gold/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-gold/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Total Winnings
              </div>
              <div className="text-3xl font-black text-gold">
                {stats.totalWinnings.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 via-dark-card to-dark-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Matches Played
              </div>
              <div className="text-3xl font-black text-white">
                {stats.totalMatches}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gold/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-gold/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-gold/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">Wins</div>
              <div className="text-3xl font-black text-gold">{stats.wins}</div>
            </div>
            <div className="bg-gradient-to-br from-gold/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-gold/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-gold/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                  <span className="text-2xl">🥇</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Top 3 Finishes
              </div>
              <div className="text-3xl font-black text-gold">
                {stats.top3Finishes}
              </div>
            </div>
          </div>

          {/* Diamond Balance Card */}
          {/* <div className="relative overflow-hidden rounded-3xl mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-br from-gold via-yellow-600 to-orange-500 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50" />
            <div className="relative backdrop-blur-sm p-8 border border-gold/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl drop-shadow-lg">💎</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wider">
                      Your Diamond Balance
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-5xl font-black drop-shadow-2xl">
                        {user?.diamonds?.toLocaleString()}
                      </span>
                      <span className="text-white/90 text-3xl">💎</span>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wider">
                    Total Winnings
                  </p>
                  <p className="text-white font-black text-4xl drop-shadow-2xl">
                    +{stats.totalWinnings.toLocaleString()} 💎
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Match History Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Match Results</h2>
            </div>
            <MatchHistory matches={matches} playerId={user?.id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tournaments */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    My Tournaments
                  </h2>
                </div>

                {joinedTournaments.length === 0 ? (
                  <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl border border-gold-dark/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-card/60 via-dark-card/40 to-dark-card/60" />
                    <div className="relative text-center py-16 px-6">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border-2 border-gold/20">
                        <span className="text-6xl">🎮</span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">
                        No Tournaments Yet
                      </h3>
                      <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                        Browse and join tournaments to start competing and win
                        amazing prizes!
                      </p>
                      <Link href="/">
                        <Button variant="primary" size="lg">
                          🎯 Browse Tournaments
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinedTournaments.map((tournament) => {
                      const placement = hasWon(tournament, user?.id);
                      return (
                        <div
                          key={tournament.id}
                          className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-card/80 backdrop-blur-xl" />
                          <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative p-6 border border-gold-dark/30 rounded-2xl">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              {/* Tournament Info */}
                              <div className="flex items-start space-x-4 flex-1">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                  <span className="text-4xl">
                                    {tournament.image}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-gold transition-colors duration-300">
                                      {tournament.title}
                                    </h3>
                                    <Badge
                                      variant={tournament.status}
                                      className="capitalize"
                                    >
                                      {tournament.status}
                                    </Badge>
                                    {placement && (
                                      <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-sm shadow-lg shadow-gold/40">
                                        {placement}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-sm mb-3 font-medium">
                                    {tournament.game}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                      <span className="text-lg">📅</span>
                                      <span className="text-gray-300">
                                        {formatDate(tournament.date)} at{" "}
                                        {tournament.time}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                      <span className="text-lg">👥</span>
                                      <span className="text-gray-300">
                                        {tournament.participants.length}/
                                        {tournament.max_players ??
                                          tournament.maxPlayers}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold/20 to-yellow-600/20 border border-gold/30">
                                      <span className="text-lg">💎</span>
                                      <span className="text-gold font-bold">
                                        {(
                                          tournament.prize_pool ??
                                          tournament.prizePool
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2 md:w-48">
                                <Link href={`/tournament/${tournament.id}`}>
                                  <Button variant="primary" size="sm" fullWidth>
                                    View Details →
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Transaction History */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-2xl">💳</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Transaction History
                </h2>
              </div>
              <TransactionHistory transactions={transactions.slice(0, 10)} />
              {transactions.length > 10 && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Showing 10 most recent transactions
                </p>
              )}
            </div>
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
