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
import { tournamentsApi, transactionsApi } from "../../lib/api";

function PlayerDashboardContent() {
  const { user } = useUser();
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalJoined: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    totalWinnings: 0,
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

          // Calculate stats
          const totalWinnings = userTransactions
            .filter((t) => t.type === "prize_won")
            .reduce((sum, t) => sum + t.amount, 0);

          setStats({
            totalJoined: userTournaments.length,
            upcoming: userTournaments.filter((t) => t.status === "upcoming")
              .length,
            ongoing: userTournaments.filter((t) => t.status === "ongoing")
              .length,
            completed: userTournaments.filter((t) => t.status === "completed")
              .length,
            totalWinnings,
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gold-gradient">Player Dashboard</span>
            </h1>
            <p className="text-gray-400">Welcome back, {user?.username}! 🎮</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/">
              <Button variant="primary" size="lg">
                Browse Tournaments
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon="🎮"
            label="Tournaments Joined"
            value={stats.totalJoined}
            color="gold"
          />
          <StatCard
            icon="📅"
            label="Upcoming"
            value={stats.upcoming}
            color="blue"
          />
          <StatCard
            icon="🎯"
            label="Ongoing"
            value={stats.ongoing}
            color="green"
          />
          <StatCard
            icon="✅"
            label="Completed"
            value={stats.completed}
            color="gold"
          />
          <StatCard
            icon="💰"
            label="Total Winnings"
            value={stats.totalWinnings.toLocaleString()}
            color="green"
          />
        </div>

        {/* Diamond Balance Card */}
        <Card glass className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Your Diamond Balance</p>
              <div className="flex items-center space-x-3">
                <span className="text-gold text-4xl">💎</span>
                <span className="text-gold text-4xl font-bold">
                  {user?.diamonds?.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Total Winnings</p>
              <p className="text-green-400 font-bold text-2xl">
                +{stats.totalWinnings.toLocaleString()} 💎
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tournaments */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gold mb-4">
                My Tournaments
              </h2>

              {joinedTournaments.length === 0 ? (
                <Card glass className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">
                    No Tournaments Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Browse and join tournaments to start competing!
                  </p>
                  <Link href="/">
                    <Button variant="primary">Browse Tournaments</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {joinedTournaments.map((tournament) => {
                    const placement = hasWon(tournament, user?.id);
                    return (
                      <Card key={tournament.id} hover className="group">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Tournament Info */}
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="text-4xl">{tournament.image}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">
                                  {tournament.title}
                                </h3>
                                <Badge
                                  variant={tournament.status}
                                  className="capitalize"
                                >
                                  {tournament.status}
                                </Badge>
                                {placement && (
                                  <Badge variant="primary" size="lg">
                                    {placement}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm mb-2">
                                {tournament.game}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className="text-gray-400">
                                  📅 {formatDate(tournament.date)} at{" "}
                                  {tournament.time}
                                </span>
                                <span className="text-gray-400">
                                  👥 {tournament.participants.length}/
                                  {tournament.max_players ??
                                    tournament.maxPlayers}
                                </span>
                                <span className="text-gold">
                                  💎{" "}
                                  {(
                                    tournament.prize_pool ??
                                    tournament.prizePool
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 md:w-48">
                            <Link href={`/tournament/${tournament.id}`}>
                              <Button variant="secondary" size="sm" fullWidth>
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div>
            <TransactionHistory transactions={transactions.slice(0, 10)} />
            {transactions.length > 10 && (
              <p className="text-center text-gray-500 text-sm mt-4">
                Showing 10 most recent transactions
              </p>
            )}
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
