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

  // Apply dashboard-specific background
  useEffect(() => {
    document.body.classList.add('dashboard-bg');
    return () => {
      document.body.classList.remove('dashboard-bg');
    };
  }, []);

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
        // Build detailed message showing what was created
        let detailText = "Tournaments created for next scheduled times:\n";
        const created = data.results.filter(
          (r) => r.action === "create" && r.success
        );
        const skipped = data.results.filter(
          (r) => r.action === "create" && !r.success
        );

        if (created.length > 0) {
          created.forEach((result) => {
            detailText += `✅ ${result.level}: ${result.message}\n`;
          });
        }

        if (skipped.length > 0) {
          skipped.forEach((result) => {
            detailText += `⚠️ ${result.level}: ${result.message}\n`;
          });
        }

        setMessage({
          type: "success",
          text: detailText,
          details: data.results,
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative text-center mb-12 overflow-hidden">
        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black to-purple-900/40" />

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />

        {/* Content */}
        <div className="relative z-10 py-16 sm:py-20 lg:py-24 px-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl">
            <span className="text-gold-gradient">Admin Dashboard</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto drop-shadow-lg font-medium">
            👨‍💼 Manage automated tournaments and view statistics
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-main mx-auto">
          {/* Message Alert */}
          {message && (
            <div
              className={`relative overflow-hidden rounded-2xl mb-8 ${
                message.type === "success"
                  ? "border-2 border-green-500/40"
                  : "border-2 border-red-500/40"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  message.type === "success"
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/10"
                    : "bg-gradient-to-br from-red-500/20 to-rose-500/10"
                }`}
              />
              <div className="relative p-6 backdrop-blur-xl">
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 flex-shrink-0 ${
                      message.type === "success"
                        ? "bg-green-500/20 border-green-500/40"
                        : "bg-red-500/20 border-red-500/40"
                    }`}
                  >
                    <span className="text-3xl">
                      {message.type === "success" ? "✅" : "❌"}
                    </span>
                  </div>
                  <div
                    className={`flex-1 ${
                      message.type === "success"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                      {message.text}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="relative overflow-hidden rounded-3xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-dark-card to-dark-card/80 backdrop-blur-xl" />
            <div className="relative p-8 border border-gold-dark/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/20">
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-3xl font-bold text-gold-gradient">
                  Quick Actions
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-dark-card/50 rounded-2xl p-6 border border-gold-dark/20">
                  <Button
                    variant="primary"
                    onClick={runScheduler}
                    disabled={actionLoading}
                    className="mb-3 w-full sm:w-auto"
                    size="lg"
                  >
                    {actionLoading
                      ? "⏳ Processing..."
                      : "🚀 Create Next Tournaments"}
                  </Button>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Creates tournaments for the nearest upcoming scheduled time
                    for all levels
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={fetchStats}
                  size="lg"
                  fullWidth
                >
                  📊 Refresh Stats
                </Button>
              </div>
            </div>
          </div>

          {/* Overall Statistics */}
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-gold/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-gold-dark/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-gold/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/20">
                      <span className="text-2xl">🎮</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-medium mb-1">
                    Total Tournaments
                  </div>
                  <div className="text-3xl font-black text-white">
                    {parseInt(stats.overall.total_tournaments) || 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-medium mb-1">
                    Active Levels
                  </div>
                  <div className="text-3xl font-black text-white">
                    {parseInt(stats.overall.active_levels) || 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-medium mb-1">
                    Total Participants
                  </div>
                  <div className="text-3xl font-black text-white">
                    {parseInt(stats.overall.total_participants) || 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl shadow-black/30 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center border border-green-500/20">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-medium mb-1">
                    Total Prize Pool
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    $
                    {parseFloat(stats.overall.total_prize_pool || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Level Controls */}
              <div className="relative overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl" />
                <div className="relative p-8 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gold-gradient">
                      Tournament Levels
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["master", "diamond", "platinum", "gold"].map((level) => {
                      const levelData = stats.byLevel.find(
                        (l) => l.automated_level === level
                      );
                      const hasActive = stats.activeTournaments.some(
                        (t) => t.automated_level === level
                      );

                      const levelColors = {
                        master:
                          "from-red-500/30 to-red-500/10 border-red-500/30",
                        diamond:
                          "from-blue-500/30 to-blue-500/10 border-blue-500/30",
                        platinum:
                          "from-gray-400/30 to-gray-400/10 border-gray-400/30",
                        gold: "from-yellow-500/30 to-yellow-500/10 border-yellow-500/30",
                      };

                      return (
                        <div
                          key={level}
                          className={`relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                            hasActive ? "shadow-lg shadow-gold/20" : ""
                          }`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${levelColors[level]}`}
                          />
                          <div className="relative p-6 border border-white/10">
                            <div className="text-center mb-4">
                              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <span className="text-4xl">
                                  {level === "gold"
                                    ? "🥇"
                                    : level === "platinum"
                                    ? "🥈"
                                    : level === "diamond"
                                    ? "💎"
                                    : "👑"}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black text-white capitalize mb-2">
                                {level}
                              </h3>
                              <Badge
                                variant={hasActive ? "success" : "secondary"}
                                className="mt-2"
                              >
                                {hasActive ? "● Active" : "○ Inactive"}
                              </Badge>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-300 text-sm font-medium">
                                  Tournaments
                                </span>
                                <span className="text-white font-bold text-lg">
                                  {parseInt(levelData?.tournament_count) || 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-300 text-sm font-medium">
                                  Participants
                                </span>
                                <span className="text-white font-bold text-lg">
                                  {parseInt(levelData?.total_participants) || 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-300 text-sm font-medium">
                                  Prize Pool
                                </span>
                                <span className="text-gold font-bold text-lg">
                                  $
                                  {parseFloat(
                                    levelData?.total_prize_pool || 0
                                  ).toFixed(2)}
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Tournaments */}
              <div className="relative overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl" />
                <div className="relative p-8 border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gold-gradient">
                      Active Tournaments
                    </h2>
                  </div>
                  {stats.activeTournaments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-500/5 flex items-center justify-center border-2 border-gray-500/20">
                        <span className="text-5xl">💤</span>
                      </div>
                      <p className="text-gray-400 text-lg">
                        No active tournaments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.activeTournaments
                        .sort((a, b) => {
                          const levelOrder = {
                            master: 1,
                            diamond: 2,
                            platinum: 3,
                            gold: 4,
                          };
                          const levelA = (
                            a.automated_level || ""
                          ).toLowerCase();
                          const levelB = (
                            b.automated_level || ""
                          ).toLowerCase();
                          const orderA = levelOrder[levelA] || 999;
                          const orderB = levelOrder[levelB] || 999;
                          return orderA - orderB;
                        })
                        .map((tournament) => (
                          <div
                            key={tournament.id}
                            className="relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-card/80" />
                            <div className="relative p-6 border border-gold-dark/20">
                              <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                                    <span className="text-3xl">
                                      {tournament.automated_level === "gold"
                                        ? "🥇"
                                        : tournament.automated_level ===
                                          "platinum"
                                        ? "🥈"
                                        : tournament.automated_level ===
                                          "diamond"
                                        ? "💎"
                                        : "👑"}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white text-lg">
                                      {tournament.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                      {tournament.date} at {tournament.time}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 flex-wrap">
                                  <Badge variant={tournament.status}>
                                    {tournament.status}
                                  </Badge>
                                  <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-xs text-gray-400 mb-1">
                                      Participants
                                    </div>
                                    <div className="text-white font-bold text-lg">
                                      {parseInt(tournament.participant_count) ||
                                        0}
                                      /{tournament.max_players}
                                    </div>
                                  </div>
                                  <div className="text-center px-4 py-2 bg-gradient-to-r from-gold/20 to-yellow-600/20 rounded-lg border border-gold/30">
                                    <div className="text-xs text-gold-dark mb-1">
                                      Prize Pool
                                    </div>
                                    <div className="text-gold font-bold text-lg">
                                      $
                                      {parseFloat(
                                        tournament.prize_pool_usd || 0
                                      ).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Tournaments */}
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-dark-card to-dark-card/80 backdrop-blur-xl" />
                <div className="relative p-8 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <span className="text-3xl">📜</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gold-gradient">
                      Recent Tournaments
                    </h2>
                  </div>
                  {stats.recentTournaments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-500/5 flex items-center justify-center border-2 border-gray-500/20">
                        <span className="text-5xl">📋</span>
                      </div>
                      <p className="text-gray-400 text-lg">
                        No tournaments yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stats.recentTournaments
                        .sort((a, b) => {
                          const levelOrder = {
                            master: 1,
                            diamond: 2,
                            platinum: 3,
                            gold: 4,
                          };
                          const levelA = (
                            a.automated_level || ""
                          ).toLowerCase();
                          const levelB = (
                            b.automated_level || ""
                          ).toLowerCase();
                          const orderA = levelOrder[levelA] || 999;
                          const orderB = levelOrder[levelB] || 999;
                          return orderA - orderB;
                        })
                        .map((tournament) => (
                          <div
                            key={tournament.id}
                            className="flex items-center justify-between p-4 bg-dark-card/30 rounded-xl border border-white/10 hover:bg-dark-card/50 transition-all duration-300"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                                <span className="text-2xl">
                                  {tournament.automated_level === "gold"
                                    ? "🥇"
                                    : tournament.automated_level === "platinum"
                                    ? "🥈"
                                    : tournament.automated_level === "diamond"
                                    ? "💎"
                                    : "👑"}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">
                                  {tournament.title}
                                </p>
                                <p className="text-xs text-gray-400">
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
