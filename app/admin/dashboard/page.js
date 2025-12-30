"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserTypeId, setUpdatingUserTypeId] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");

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
      fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch users" });
    } finally {
      setUsersLoading(false);
    }
  };

  const updateUserType = async (userId, newType) => {
    try {
      setUpdatingUserTypeId(userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Successfully updated user type to ${newType}!`,
        });
        fetchUsers(); // Refresh users list
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update user type" });
    } finally {
      setUpdatingUserTypeId(null);
    }
  };

  const filteredUsers = users
    .filter((u) => u.type !== "game_owner")
    .filter((u) => {
      const matchesSearch =
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesFilter = userFilter === "all" || u.type === userFilter;
      return matchesSearch && matchesFilter;
    });

  const userStats = {
    total: users.filter((u) => u.type !== "game_owner").length,
    hosts: users.filter((u) => u.type === "host").length,
    players: users.filter((u) => u.type === "player").length,
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
        <div className="relative z-10 px-4 py-16 sm:py-10 lg:py-12">
          <h1 className="mb-4 text-5xl font-bold drop-shadow-2xl sm:text-6xl lg:text-7xl">
            <span className="text-gold-gradient">Admin Dashboard</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl font-medium text-gray-200 drop-shadow-lg sm:text-2xl">
            Manage automated tournaments and view statistics 👨‍💼
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto">
          {/* Message Alert */}
          {message && (
            <div
              className={`bg-dark-gray-card/80 mb-8 overflow-hidden rounded-xl border shadow-lg shadow-gray-800/30 backdrop-blur-sm ${
                message.type === "success"
                  ? "border-green-500/30"
                  : "border-red-500/30"
              }`}
            >
              <div
                className={`h-[2px] bg-gradient-to-r from-transparent via-current to-transparent ${
                  message.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              />
              <div className="p-5">
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border bg-white/10 ${
                      message.type === "success"
                        ? "border-green-500/30"
                        : "border-red-500/30"
                    }`}
                  >
                    <span className="text-2xl">
                      {message.type === "success" ? "✅" : "❌"}
                    </span>
                  </div>
                  <div
                    className={`flex-1 ${
                      message.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-gold-gradient text-3xl font-bold">
                Quick Actions
              </h2>
            </div>
            <div className="border-gold-dark/20 bg-dark-gray-card/80 rounded-2xl border p-6 shadow-lg shadow-gray-800/30 backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  variant="primary"
                  onClick={runScheduler}
                  disabled={actionLoading}
                  size="lg"
                >
                  {actionLoading
                    ? "⏳ Processing..."
                    : "🚀 Create Next Tournaments"}
                </Button>
                <Button variant="secondary" onClick={fetchStats} size="lg">
                  📊 Refresh Stats
                </Button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Creates tournaments for the nearest upcoming scheduled time for
                all levels
              </p>
            </div>
          </div>

          {/* Overall Statistics */}
          {stats && (
            <>
              <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {/* Total Tournaments Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/002.webp"
                        alt="Total Tournaments"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      {parseInt(stats.overall.total_tournaments) || 0}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Total Tournaments
                    </div>
                  </div>
                </div>

                {/* Active Levels Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/004.webp"
                        alt="Active Levels"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      {parseInt(stats.overall.active_levels) || 0}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Active Levels
                    </div>
                  </div>
                </div>

                {/* Total Participants Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/003.webp"
                        alt="Participants"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      {parseInt(stats.overall.total_participants) || 0}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Total Participants
                    </div>
                  </div>
                </div>

                {/* Total Prize Pool Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/001.webp"
                        alt="Prize Pool"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      $
                      {parseFloat(stats.overall.total_prize_pool || 0).toFixed(
                        2,
                      )}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Total Prize Pool
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Controls */}
              <div className="mb-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                    <span className="text-2xl">🎯</span>
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

                    return (
                      <div
                        key={level}
                        className={`group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-5 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 ${
                          hasActive ? "border-gold-dark/30" : ""
                        }`}
                      >
                        <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                        <div className="mb-4 text-center">
                          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105">
                            <span className="text-3xl">
                              {level === "gold"
                                ? "🥇"
                                : level === "platinum"
                                  ? "🥈"
                                  : level === "diamond"
                                    ? "💎"
                                    : "👑"}
                            </span>
                          </div>
                          <h3 className="text-gold-text mb-2 text-xl font-bold capitalize">
                            {level}
                          </h3>
                          <Badge
                            variant={hasActive ? "success" : "secondary"}
                            className="mt-1"
                          >
                            {hasActive ? "● Active" : "○ Inactive"}
                          </Badge>
                        </div>

                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
                            <span className="text-xs font-medium text-gray-400">
                              Tournaments
                            </span>
                            <span className="text-sm font-bold text-white">
                              {parseInt(levelData?.tournament_count) || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
                            <span className="text-xs font-medium text-gray-400">
                              Participants
                            </span>
                            <span className="text-sm font-bold text-white">
                              {parseInt(levelData?.total_participants) || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
                            <span className="text-xs font-medium text-gray-400">
                              Prize Pool
                            </span>
                            <span className="text-gold-text text-sm font-bold">
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
                    );
                  })}
                </div>
              </div>

              {/* Active Tournaments */}
              <div className="mb-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <h2 className="text-gold-gradient text-3xl font-bold">
                    Active Tournaments
                  </h2>
                </div>
                {stats.activeTournaments.length === 0 ? (
                  <div className="border-gold-dark/20 bg-dark-gray-card/80 rounded-2xl border px-6 py-16 text-center shadow-lg shadow-gray-800/30 backdrop-blur-sm">
                    <div className="from-gold/20 to-gold/5 border-gold/20 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 bg-gradient-to-br">
                      <span className="text-6xl">💤</span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-white">
                      No Active Tournaments
                    </h3>
                    <p className="text-gray-400">
                      Start a tournament level to see active tournaments here
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
                        const levelA = (a.automated_level || "").toLowerCase();
                        const levelB = (b.automated_level || "").toLowerCase();
                        const orderA = levelOrder[levelA] || 999;
                        const orderB = levelOrder[levelB] || 999;
                        return orderA - orderB;
                      })
                      .map((tournament) => (
                        <div
                          key={tournament.id}
                          className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 relative overflow-hidden rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300 md:p-5"
                        >
                          <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105">
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
                                <h3 className="text-base font-bold text-white md:text-lg">
                                  {tournament.title}
                                </h3>
                                <p className="text-xs text-gray-400 md:text-sm">
                                  {tournament.date} at {tournament.time}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant={tournament.status}>
                                {tournament.status}
                              </Badge>
                              <div className="rounded-lg bg-black/30 px-3 py-2 text-center">
                                <div className="text-[10px] text-gray-400 uppercase md:text-xs">
                                  Players
                                </div>
                                <div className="text-sm font-bold text-white md:text-base">
                                  {parseInt(tournament.participant_count) || 0}/
                                  {tournament.max_players}
                                </div>
                              </div>
                              <div className="rounded-lg bg-black/30 px-3 py-2 text-center">
                                <div className="text-[10px] text-gray-400 uppercase md:text-xs">
                                  Prize
                                </div>
                                <div className="text-gold-text text-sm font-bold md:text-base">
                                  $
                                  {parseFloat(
                                    tournament.prize_pool_usd || 0,
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Recent Tournaments */}
              <div className="mb-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                    <span className="text-2xl">📜</span>
                  </div>
                  <h2 className="text-gold-gradient text-3xl font-bold">
                    Recent Tournaments
                  </h2>
                </div>
                {stats.recentTournaments.length === 0 ? (
                  <div className="border-gold-dark/20 bg-dark-gray-card/80 rounded-2xl border px-6 py-16 text-center shadow-lg shadow-gray-800/30 backdrop-blur-sm">
                    <div className="from-gold/20 to-gold/5 border-gold/20 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 bg-gradient-to-br">
                      <span className="text-6xl">📋</span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-white">
                      No Tournaments Yet
                    </h3>
                    <p className="text-gray-400">
                      Created tournaments will appear here
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
                        const levelA = (a.automated_level || "").toLowerCase();
                        const levelB = (b.automated_level || "").toLowerCase();
                        const orderA = levelOrder[levelA] || 999;
                        const orderB = levelOrder[levelB] || 999;
                        return orderA - orderB;
                      })
                      .map((tournament) => (
                        <div
                          key={tournament.id}
                          className="group hover:border-gold-dark/40 bg-dark-gray-card/80 hover:bg-dark-gray-card/90 flex items-center justify-between rounded-xl border border-white/10 p-4 shadow-lg shadow-gray-800/30 backdrop-blur-sm transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105">
                              <span className="text-xl">
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

              {/* User Management */}
              <div className="mb-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h2 className="text-gold-gradient text-3xl font-bold">
                      User Management
                    </h2>
                  </div>

                  {/* User Mini Stats */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                      <span className="text-xs text-gray-400">Total:</span>
                      <span className="text-sm font-bold text-white">
                        {userStats.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                      <span className="text-gold text-xs">Hosts:</span>
                      <span className="text-gold text-sm font-bold">
                        {userStats.hosts}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                      <span className="text-xs text-blue-400">Players:</span>
                      <span className="text-sm font-bold text-blue-400">
                        {userStats.players}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="relative sm:col-span-8">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="focus:border-gold/50 focus:ring-gold/50 w-full rounded-xl border border-white/10 bg-black/40 py-3 pr-4 pl-12 text-sm text-white focus:ring-1 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="focus:border-gold/50 w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="player">Players</option>
                      <option value="host">Hosts</option>
                    </select>
                  </div>
                </div>

                <div className="border-gold-dark/20 bg-dark-gray-card/80 overflow-hidden rounded-2xl border shadow-lg shadow-gray-800/30 backdrop-blur-sm">
                  {usersLoading ? (
                    <div className="px-6 py-24 text-center">
                      <div className="border-gold/20 border-t-gold mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
                      <p className="text-lg font-medium text-gray-400">
                        Loading system users...
                      </p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="px-6 py-20 text-center">
                      <div className="from-gold/20 to-gold/5 border-gold/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border bg-gradient-to-br">
                        <span className="text-4xl">🔍</span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-white">
                        No Users Found
                      </h3>
                      <p className="text-gray-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-400 uppercase">
                              User Info
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-400 uppercase">
                              Contact
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-400 uppercase">
                              Status & Rank
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-400 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.map((user) => (
                            <tr
                              key={user.id}
                              className="group transition-colors hover:bg-white/[0.03]"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="from-gold/20 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br to-purple-900/40 text-2xl shadow-inner">
                                      {typeof user.avatar === "string" &&
                                      (user.avatar.startsWith("http") ||
                                        user.avatar.startsWith("/")) ? (
                                        <Image
                                          src={user.avatar}
                                          alt={user.username}
                                          width={48}
                                          height={48}
                                          className="h-full w-full object-cover"
                                          unoptimized
                                        />
                                      ) : (
                                        user.avatar
                                      )}
                                    </div>
                                    <div
                                      className={`border-dark-gray-card absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                                        user.type === "host"
                                          ? "bg-gold"
                                          : "bg-blue-400"
                                      }`}
                                    ></div>
                                  </div>
                                  <div>
                                    <div className="text-base font-bold text-white">
                                      {user.username}
                                    </div>
                                    <div className="text-[10px] font-bold tracking-tighter text-gray-500 uppercase">
                                      ID: {user.id.slice(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                  <svg
                                    className="h-3.5 w-3.5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    ></path>
                                  </svg>
                                  {user.email}
                                </div>
                                <div className="mt-1 text-[10px] text-gray-500">
                                  Joined {new Date().toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex">
                                    <Badge
                                      variant={
                                        user.type === "host"
                                          ? "primary"
                                          : "secondary"
                                      }
                                      size="sm"
                                      className="font-bold"
                                    >
                                      {user.type === "host"
                                        ? "👑 Host"
                                        : "⚔️ Player"}
                                    </Badge>
                                  </div>
                                  {user.rank && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                                        Rank:
                                      </span>
                                      <span className="text-xs font-semibold text-gray-300">
                                        {user.rank}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {user.type === "player" ? (
                                  <button
                                    onClick={() =>
                                      updateUserType(user.id, "host")
                                    }
                                    disabled={updatingUserTypeId === user.id}
                                    className="border-gold group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 px-4 py-2 font-bold text-white shadow-md transition duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <span className="bg-gold ease absolute inset-0 flex h-full w-full -translate-x-full items-center justify-center text-black duration-300 group-hover:translate-x-0">
                                      {updatingUserTypeId === user.id
                                        ? "..."
                                        : "Confirm 👑"}
                                    </span>
                                    <span className="text-gold ease absolute flex h-full w-full transform items-center justify-center text-sm transition-all duration-300 group-hover:translate-x-full">
                                      {updatingUserTypeId === user.id
                                        ? "Promoting..."
                                        : "Promote to Host"}
                                    </span>
                                    <span className="invisible relative text-sm">
                                      Promote to Host
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      updateUserType(user.id, "player")
                                    }
                                    disabled={updatingUserTypeId === user.id}
                                    className="group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-blue-400 px-4 py-2 font-bold text-white shadow-md transition duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <span className="ease absolute inset-0 flex h-full w-full -translate-x-full items-center justify-center bg-blue-400 text-black duration-300 group-hover:translate-x-0">
                                      {updatingUserTypeId === user.id
                                        ? "..."
                                        : "Confirm ⚔️"}
                                    </span>
                                    <span className="ease absolute flex h-full w-full transform items-center justify-center text-sm text-blue-400 transition-all duration-300 group-hover:translate-x-full">
                                      {updatingUserTypeId === user.id
                                        ? "Demoting..."
                                        : "Demote to Player"}
                                    </span>
                                    <span className="invisible relative text-sm">
                                      Demote to Player
                                    </span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
