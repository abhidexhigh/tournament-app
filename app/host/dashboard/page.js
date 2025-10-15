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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gold-gradient">Host Dashboard</span>
            </h1>
            <p className="text-gray-400">Welcome back, {user?.username}! 👑</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/host/create-tournament">
              <Button variant="primary" size="lg">
                + Create Tournament
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="🏆"
            label="Total Tournaments"
            value={stats.total}
            color="gold"
          />
          <StatCard
            icon="📅"
            label="Upcoming"
            value={stats.upcoming}
            color="blue"
          />
          <StatCard
            icon="🎮"
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
              <p className="text-gray-500 text-sm">Free Tournament Creation</p>
              <p className="text-green-400 font-bold text-lg">0 💎</p>
            </div>
          </div>
        </Card>

        {/* Tournaments List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gold mb-4">
            Your Tournaments
          </h2>
        </div>

        {tournaments.length === 0 ? (
          <Card glass className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No Tournaments Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first tournament and start hosting!
            </p>
            <Link href="/host/create-tournament">
              <Button variant="primary">Create Your First Tournament</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} hover className="group">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Tournament Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{tournament.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">
                          {tournament.title}
                        </h3>
                        <Badge
                          variant={tournament.status}
                          className="capitalize"
                        >
                          {tournament.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {tournament.game}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-400">
                          📅 {formatDate(tournament.date)} at {tournament.time}
                        </span>
                        <span className="text-gray-400">
                          👥 {tournament.participants.length}/
                          {tournament.max_players ?? tournament.maxPlayers}
                        </span>
                        <span className="text-gold">
                          💎{" "}
                          {(
                            tournament.prize_pool ?? tournament.prizePool
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

                    {tournament.status === "upcoming" && (
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() =>
                          handleStatusChange(tournament.id, "ongoing")
                        }
                      >
                        Start Tournament
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
                        Declare Winners
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
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
