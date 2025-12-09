"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import Button from "../../components/Button";
import TournamentCard from "../../components/TournamentCard";
import EmptyState from "../../components/EmptyState";
import { useUser } from "../../contexts/UserContext";
import { tournamentsApi } from "../../lib/api";
import { getClanById } from "../../lib/dataLoader";

function HostDashboardContent() {
  const { user } = useUser();
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clanData, setClanData] = useState({});

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

          // Load clan data for clan battle tournaments
          const clanIds = new Set();
          userTournaments.forEach((tournament) => {
            if (
              tournament.tournament_type === "clan_battle" &&
              tournament.clan_battle_mode === "clan_selection"
            ) {
              if (tournament.clan1_id) clanIds.add(tournament.clan1_id);
              if (tournament.clan2_id) clanIds.add(tournament.clan2_id);
            }
          });

          // Load all unique clan IDs
          const clanPromises = Array.from(clanIds).map(async (clanId) => {
            const clan = await getClanById(clanId);
            return [clanId, clan];
          });

          const clanResults = await Promise.all(clanPromises);
          const clanMap = Object.fromEntries(clanResults);
          setClanData(clanMap);
        } catch (error) {
          console.error("Failed to load host dashboard data:", error);
          setTournaments([]);
        }
      }
    };

    loadData();
  }, [user]);

  const filteredTournaments = tournaments
    .filter((t) => {
      // Apply filters
      const statusMatch = activeTab === "all" || t.status === activeTab;

      // Search filter - check title, game, and tournament type
      const searchMatch =
        searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.game && t.game.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tournament_type &&
          t.tournament_type.toLowerCase().includes(searchQuery.toLowerCase()));

      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      // Define the order: Master, Diamond, Platinum, Gold
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
    });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative mb-12 overflow-hidden text-center">
        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-black to-red-900/40" />

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />

        {/* Content */}
        <div className="relative z-10 px-4 py-16 sm:py-20 lg:py-24">
          <h1 className="mb-4 text-5xl font-bold drop-shadow-2xl sm:text-6xl lg:text-7xl">
            <span className="text-gold-gradient">Host Dashboard</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl font-medium text-gray-200 drop-shadow-lg sm:text-2xl">
            Welcome back, {user?.username}! 👑
          </p>
          <Link href="/host/create-tournament">
            <Button variant="primary" size="lg">
              ✨ Create Tournament
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto">
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="from-gold/20 via-dark-card to-dark-card/80 border-gold-dark/30 hover:shadow-gold/20 rounded-2xl border bg-gradient-to-br p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105">
              <div className="mb-2 flex items-center gap-3">
                <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="mb-1 text-sm font-medium text-gray-400">
                Total Tournaments
              </div>
              <div className="text-3xl font-black text-white">
                {stats.total}
              </div>
            </div>
            <div className="via-dark-card to-dark-card/80 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/30 to-blue-500/10">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
              <div className="mb-1 text-sm font-medium text-gray-400">
                Upcoming
              </div>
              <div className="text-3xl font-black text-white">
                {stats.upcoming}
              </div>
            </div>
            <div className="via-dark-card to-dark-card/80 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/20">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/30 to-green-500/10">
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
              <div className="mb-1 text-sm font-medium text-gray-400">
                Ongoing
              </div>
              <div className="text-3xl font-black text-white">
                {stats.ongoing}
              </div>
            </div>
            <div className="via-dark-card to-dark-card/80 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/30 to-purple-500/10">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="mb-1 text-sm font-medium text-gray-400">
                Completed
              </div>
              <div className="text-3xl font-black text-white">
                {stats.completed}
              </div>
            </div>
          </div>

          {/* Tournaments List */}
          <div className="mb-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="from-gold/30 to-gold/10 border-gold/20 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
                <span className="text-2xl">👑</span>
              </div>
              <h2 className="text-gold-gradient text-3xl font-bold">
                Your Tournaments
              </h2>
            </div>
          </div>

          {tournaments.length === 0 ? (
            <div className="border-gold-dark/20 relative overflow-hidden rounded-2xl border backdrop-blur-xl">
              <div className="from-dark-card/60 via-dark-card/40 to-dark-card/60 absolute inset-0 bg-gradient-to-br" />
              <div className="relative px-6 py-16 text-center">
                <div className="from-gold/20 to-gold/5 border-gold/20 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 bg-gradient-to-br">
                  <span className="text-6xl">🎮</span>
                </div>
                <h3 className="mb-3 text-3xl font-bold text-white">
                  No Tournaments Yet
                </h3>
                <p className="mx-auto mb-8 max-w-md text-lg text-gray-400">
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
            <>
              {/* Simple Filter Bar for Host Dashboard */}
              <div className="relative z-10 mb-8">
                <div className="border-gold-dark/20 rounded-2xl p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-6 sm:py-4">
                  <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                    {/* Status Filter */}
                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-400">
                        Filter by Status
                      </label>
                      <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="border-gold-dark/30 focus:border-gold focus:ring-gold/30 hover:border-gold/40 w-full cursor-pointer rounded-xl border bg-gradient-to-r from-black/40 to-black/20 px-4 py-3 text-sm font-medium text-white transition-all duration-300 focus:ring-2 focus:outline-none sm:w-48"
                      >
                        <option value="all">All Tournaments</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium text-gray-400">
                        Search
                      </label>
                      <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                          <svg
                            className="text-gold-dark group-focus-within:text-gold h-5 w-5 transition-colors duration-300"
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
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name, game..."
                          className="border-gold-dark/30 focus:border-gold focus:ring-gold/30 hover:border-gold/40 w-full rounded-xl border bg-gradient-to-r from-black/40 to-black/20 py-3 pr-11 pl-12 text-sm font-medium text-white placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:outline-none"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="hover:text-gold absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-all duration-200 hover:scale-110"
                            aria-label="Clear search"
                          >
                            <div className="hover:bg-gold/20 rounded-full p-1">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament List */}
              <div className="space-y-8">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>

              {/* Empty State */}
              {filteredTournaments.length === 0 && (
                <EmptyState
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery("")}
                />
              )}
            </>
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
