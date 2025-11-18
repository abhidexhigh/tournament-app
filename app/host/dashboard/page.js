"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import StatCard from "../../components/StatCard";
import { useUser } from "../../contexts/UserContext";
import { tournamentsApi } from "../../lib/api";

function HostDashboardContent() {
  const { user } = useUser();
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const userTournaments = await tournamentsApi.getByHostId(user.id);
          setTournaments(userTournaments);

          // Calculate stats
          setStats({
            total: userTournaments.length,
            upcoming: userTournaments.filter((t) => t.status === "upcoming")
              .length,
            ongoing: userTournaments.filter((t) => t.status === "ongoing")
              .length,
            completed: userTournaments.filter((t) => t.status === "completed")
              .length,
          });
        } catch (error) {
          console.error("Failed to load host dashboard data:", error);
        }
      }
    };

    loadData();
  }, [user]);

  const handleStatusChange = async (tournamentId, newStatus) => {
    try {
      await tournamentsApi.updateStatus(tournamentId, newStatus);
      // Refresh tournaments
      const userTournaments = await tournamentsApi.getByHostId(user.id);
      setTournaments(userTournaments);

      // Recalculate stats
      setStats({
        total: userTournaments.length,
        upcoming: userTournaments.filter((t) => t.status === "upcoming").length,
        ongoing: userTournaments.filter((t) => t.status === "ongoing").length,
        completed: userTournaments.filter((t) => t.status === "completed")
          .length,
      });
    } catch (error) {
      console.error("Failed to update tournament status:", error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative text-center mb-12 overflow-hidden">
        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-black to-red-900/40" />

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />

        {/* Content */}
        <div className="relative z-10 py-16 sm:py-20 lg:py-24 px-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl">
            <span className="text-gold-gradient">Host Dashboard</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto drop-shadow-lg font-medium mb-8">
            Welcome back, {user?.username}! 👑
          </p>
          <Link href="/host/create-tournament">
            <Button variant="primary" size="lg">
              ✨ Create Tournament
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-main mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-gold/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-gold-dark/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-gold/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/20">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Total Tournaments
              </div>
              <div className="text-3xl font-black text-white">
                {stats.total}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center border border-blue-500/20">
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
            <div className="bg-gradient-to-br from-green-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center border border-green-500/20">
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium mb-1">
                Ongoing
              </div>
              <div className="text-3xl font-black text-white">
                {stats.ongoing}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 flex items-center justify-center border border-purple-500/20">
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
          </div>

          {/* Diamond Balance Card */}
          <div className="relative overflow-hidden rounded-3xl mb-8 group">
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
                    Tournament Creation
                  </p>
                  <p className="text-white font-black text-4xl drop-shadow-2xl">
                    Free 🎉
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tournaments List */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/20">
                <span className="text-2xl">👑</span>
              </div>
              <h2 className="text-3xl font-bold text-gold-gradient">
                Your Tournaments
              </h2>
            </div>
          </div>

          {tournaments.length === 0 ? (
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
                  Create your first tournament and start hosting amazing
                  competitions!
                </p>
                <Link href="/host/create-tournament">
                  <Button variant="primary" size="lg">
                    ✨ Create Your First Tournament
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
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
                          <span className="text-4xl">{tournament.image}</span>
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
                                  tournament.prize_pool ?? tournament.prizePool
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 md:w-48">
                        <Link href={`/tournament/${tournament.id}`}>
                          <Button variant="secondary" size="sm" fullWidth>
                            View Details →
                          </Button>
                        </Link>

                        {tournament.status === "upcoming" && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() =>
                              handleStatusChange(tournament.id, "ongoing")
                            }
                          >
                            ▶️ Start Tournament
                          </Button>
                        )}

                        {tournament.status === "ongoing" && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() =>
                              router.push(`/tournament/${tournament.id}`)
                            }
                          >
                            🏆 Declare Winners
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <ProtectedRoute requiredRole="host">
      <HostDashboardContent />
    </ProtectedRoute>
  );
}
