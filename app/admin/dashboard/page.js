"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import StatCard from "../../components/StatCard";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Redirect if not game owner
    if (status === "authenticated" && session?.user?.type !== "game_owner") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.type === "game_owner") {
      fetchStats();
    }
  }, [session, status]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/automated-tournaments/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch statistics" });
    } finally {
      setLoading(false);
    }
  };

  const runScheduler = async () => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/automated-tournaments", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Scheduler executed successfully!",
        });
        fetchStats(); // Refresh stats
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to run scheduler" });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleLevel = async (level, action) => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/automated-tournaments/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, action }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        fetchStats(); // Refresh stats
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to ${action} tournaments` });
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.type !== "game_owner") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-xl text-gray-400">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold-gradient mb-2">
            👨‍💼 Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage automated tournaments and view statistics
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <Card
            className={`mb-6 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <p
                className={
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }
              >
                {message.text}
              </p>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card glass className="mb-8">
          <h2 className="text-2xl font-bold text-gold mb-4">
            ⚡ Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={runScheduler}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "🔄 Run Scheduler Now"}
            </Button>
            <Button variant="secondary" onClick={fetchStats}>
              📊 Refresh Stats
            </Button>
          </div>
        </Card>

        {/* Overall Statistics */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Tournaments"
                value={stats.overall.total_tournaments || 0}
                icon="🎮"
                color="gold"
              />
              <StatCard
                title="Active Levels"
                value={stats.overall.active_levels || 0}
                icon="🏆"
                color="blue"
              />
              <StatCard
                title="Total Participants"
                value={stats.overall.total_participants || 0}
                icon="👥"
                color="purple"
              />
              <StatCard
                title="Total Prize Pool"
                value={`$${(stats.overall.total_prize_pool || 0).toFixed(2)}`}
                icon="💰"
                color="green"
              />
            </div>

            {/* Level Controls */}
            <Card glass className="mb-8">
              <h2 className="text-2xl font-bold text-gold mb-4">
                🎯 Tournament Levels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["gold", "platinum", "diamond", "master"].map((level) => {
                  const levelData = stats.byLevel.find(
                    (l) => l.automated_level === level
                  );
                  const hasActive = stats.activeTournaments.some(
                    (t) => t.automated_level === level
                  );

                  return (
                    <Card
                      key={level}
                      className="bg-dark-card/50 border-gold-dark/30"
                    >
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">
                          {level === "gold"
                            ? "🥇"
                            : level === "platinum"
                            ? "🥈"
                            : level === "diamond"
                            ? "💎"
                            : "👑"}
                        </div>
                        <h3 className="text-xl font-bold text-white capitalize">
                          {level}
                        </h3>
                        <Badge
                          variant={hasActive ? "success" : "secondary"}
                          className="mt-2"
                        >
                          {hasActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tournaments:</span>
                          <span className="text-white font-semibold">
                            {levelData?.tournament_count || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white font-semibold">
                            {levelData?.total_participants || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prize Pool:</span>
                          <span className="text-gold font-semibold">
                            ${(levelData?.total_prize_pool || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleLevel(level, "start")}
                          disabled={actionLoading || hasActive}
                        >
                          ▶️ Start
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleLevel(level, "stop")}
                          disabled={actionLoading || !hasActive}
                        >
                          ⏹️ Stop
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            {/* Active Tournaments */}
            <Card glass className="mb-8">
              <h2 className="text-2xl font-bold text-gold mb-4">
                🔥 Active Tournaments
              </h2>
              {stats.activeTournaments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No active tournaments
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.activeTournaments.map((tournament) => (
                    <Card
                      key={tournament.id}
                      className="bg-dark-card/30 border-gold-dark/20"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {tournament.automated_level === "gold"
                              ? "🥇"
                              : tournament.automated_level === "platinum"
                              ? "🥈"
                              : tournament.automated_level === "diamond"
                              ? "💎"
                              : "👑"}
                          </span>
                          <div>
                            <h3 className="font-bold text-white">
                              {tournament.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {tournament.date} at {tournament.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge variant={tournament.status}>
                            {tournament.status}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              Participants
                            </div>
                            <div className="text-white font-bold">
                              {tournament.participant_count || 0}/
                              {tournament.max_players}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              Prize Pool
                            </div>
                            <div className="text-gold font-bold">
                              ${tournament.prize_pool_usd}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Tournaments */}
            <Card glass>
              <h2 className="text-2xl font-bold text-gold mb-4">
                📜 Recent Tournaments
              </h2>
              {stats.recentTournaments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No tournaments yet
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentTournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex items-center justify-between p-3 bg-dark-card/20 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {tournament.automated_level === "gold"
                            ? "🥇"
                            : tournament.automated_level === "platinum"
                            ? "🥈"
                            : tournament.automated_level === "diamond"
                            ? "💎"
                            : "👑"}
                        </span>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {tournament.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tournament.date}
                          </p>
                        </div>
                      </div>
                      <Badge variant={tournament.status} size="sm">
                        {tournament.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

