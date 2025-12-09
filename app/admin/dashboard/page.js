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
    document.body.classList.add("dashboard-bg");
    return () => {
      document.body.classList.remove("dashboard-bg");
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
          (r) => r.action === "create" && r.success,
        );
        const skipped = data.results.filter(
          (r) => r.action === "create" && !r.success,
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <p className="text-xl text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.type !== "game_owner") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <p className="text-xl text-gray-400">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative mb-12 overflow-hidden text-center">
        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black to-purple-900/40" />

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />

        {/* Content */}
        <div className="relative z-10 px-4 py-16 sm:py-20 lg:py-24">
          <h1 className="mb-4 text-5xl font-bold drop-shadow-2xl sm:text-6xl lg:text-7xl">
            <span className="text-gold-gradient">Admin Dashboard</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-gray-200 drop-shadow-lg sm:text-2xl">
            👨‍💼 Manage automated tournaments and view statistics
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto">
          {/* Message Alert */}
          {message && (
            <div
              className={`relative mb-8 overflow-hidden rounded-2xl ${
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
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 ${
                      message.type === "success"
                        ? "border-green-500/40 bg-green-500/20"
                        : "border-red-500/40 bg-red-500/20"
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
                    <pre className="font-sans text-base leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="relative mb-8 overflow-hidden rounded-3xl">
            <div className="from-gold/20 via-dark-card to-dark-card/80 absolute inset-0 bg-gradient-to-br backdrop-blur-xl" />
            <div className="border-gold-dark/30 relative border p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="from-gold/30 to-gold/10 border-gold/20 flex h-14 w-14 items-center justify-center rounded-xl border bg-gradient-to-br">
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-gold-gradient text-3xl font-bold">
                  Quick Actions
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-dark-card/50 border-gold-dark/20 rounded-2xl border p-6">
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
                  <p className="text-sm leading-relaxed text-gray-400">
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
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="from-gold/20 via-dark-card to-dark-card/80 border-gold-dark/30 hover:shadow-gold/20 rounded-2xl border bg-gradient-to-br p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                      <span className="text-2xl">🎮</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-400">
                    Total Tournaments
                  </div>
                  <div className="text-3xl font-black text-white">
                    {parseInt(stats.overall.total_tournaments) || 0}
                  </div>
                </div>
                <div className="via-dark-card to-dark-card/80 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/30 to-blue-500/10">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-400">
                    Active Levels
                  </div>
                  <div className="text-3xl font-black text-white">
                    {parseInt(stats.overall.active_levels) || 0}
                  </div>
                </div>
                <div className="via-dark-card to-dark-card/80 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/30 to-purple-500/10">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-400">
                    Total Participants
                  </div>
                  <div className="text-3xl font-black text-white">
                    {parseInt(stats.overall.total_participants) || 0}
                  </div>
                </div>
                <div className="via-dark-card to-dark-card/80 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/20">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/30 to-green-500/10">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-400">
                    Total Prize Pool
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    $
                    {parseFloat(stats.overall.total_prize_pool || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Level Controls */}
              <div className="relative mb-8 overflow-hidden rounded-3xl">
                <div className="via-dark-card to-dark-card/80 absolute inset-0 bg-gradient-to-br from-purple-500/20 backdrop-blur-xl" />
                <div className="relative border border-purple-500/30 p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/30 to-purple-500/10">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h2 className="text-gold-gradient text-3xl font-bold">
                      Tournament Levels
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {["master", "diamond", "platinum", "gold"].map((level) => {
                      const levelData = stats.byLevel.find(
                        (l) => l.automated_level === level,
                      );
                      const hasActive = stats.activeTournaments.some(
                        (t) => t.automated_level === level,
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
                            hasActive ? "shadow-gold/20 shadow-lg" : ""
                          }`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${levelColors[level]}`}
                          />
                          <div className="relative border border-white/10 p-6">
                            <div className="mb-4 text-center">
                              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
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
                              <h3 className="mb-2 text-2xl font-black text-white capitalize">
                                {level}
                              </h3>
                              <Badge
                                variant={hasActive ? "success" : "secondary"}
                                className="mt-2"
                              >
                                {hasActive ? "● Active" : "○ Inactive"}
                              </Badge>
                            </div>

                            <div className="mb-4 space-y-3">
                              <div className="flex items-center justify-between rounded-lg bg-black/20 p-3">
                                <span className="text-sm font-medium text-gray-300">
                                  Tournaments
                                </span>
                                <span className="text-lg font-bold text-white">
                                  {parseInt(levelData?.tournament_count) || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-black/20 p-3">
                                <span className="text-sm font-medium text-gray-300">
                                  Participants
                                </span>
                                <span className="text-lg font-bold text-white">
                                  {parseInt(levelData?.total_participants) || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-black/20 p-3">
                                <span className="text-sm font-medium text-gray-300">
                                  Prize Pool
                                </span>
                                <span className="text-gold text-lg font-bold">
                                  $
                                  {parseFloat(
                                    levelData?.total_prize_pool || 0,
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
              <div className="relative mb-8 overflow-hidden rounded-3xl">
                <div className="via-dark-card to-dark-card/80 absolute inset-0 bg-gradient-to-br from-orange-500/20 backdrop-blur-xl" />
                <div className="relative border border-orange-500/30 p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/30 to-orange-500/10">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <h2 className="text-gold-gradient text-3xl font-bold">
                      Active Tournaments
                    </h2>
                  </div>
                  {stats.activeTournaments.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-500/20 bg-gradient-to-br from-gray-500/20 to-gray-500/5">
                        <span className="text-5xl">💤</span>
                      </div>
                      <p className="text-lg text-gray-400">
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
                            <div className="from-dark-card/80 via-dark-card/60 to-dark-card/80 absolute inset-0 bg-gradient-to-br" />
                            <div className="border-gold-dark/20 relative border p-6">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
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
                                    <h3 className="text-lg font-bold text-white">
                                      {tournament.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                      {tournament.date} at {tournament.time}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                  <Badge variant={tournament.status}>
                                    {tournament.status}
                                  </Badge>
                                  <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center">
                                    <div className="mb-1 text-xs text-gray-400">
                                      Participants
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                      {parseInt(tournament.participant_count) ||
                                        0}
                                      /{tournament.max_players}
                                    </div>
                                  </div>
                                  <div className="from-gold/20 border-gold/30 rounded-lg border bg-gradient-to-r to-yellow-600/20 px-4 py-2 text-center">
                                    <div className="text-gold-dark mb-1 text-xs">
                                      Prize Pool
                                    </div>
                                    <div className="text-gold text-lg font-bold">
                                      $
                                      {parseFloat(
                                        tournament.prize_pool_usd || 0,
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
                <div className="via-dark-card to-dark-card/80 absolute inset-0 bg-gradient-to-br from-blue-500/20 backdrop-blur-xl" />
                <div className="relative border border-blue-500/30 p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/30 to-blue-500/10">
                      <span className="text-3xl">📜</span>
                    </div>
                    <h2 className="text-gold-gradient text-3xl font-bold">
                      Recent Tournaments
                    </h2>
                  </div>
                  {stats.recentTournaments.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-500/20 bg-gradient-to-br from-gray-500/20 to-gray-500/5">
                        <span className="text-5xl">📋</span>
                      </div>
                      <p className="text-lg text-gray-400">
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
                            className="bg-dark-card/30 hover:bg-dark-card/50 flex items-center justify-between rounded-xl border border-white/10 p-4 transition-all duration-300"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
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
                                <p className="text-sm font-semibold text-white">
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
