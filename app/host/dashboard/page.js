"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import Button from "../../components/Button";
import TournamentCard from "../../components/TournamentCard";
import MobileTournamentCard from "../../components/MobileTournamentCard";
import EmptyState from "../../components/EmptyState";
import { useUser } from "../../contexts/UserContext";
import { tournamentsApi } from "../../lib/api";
import { getClanById } from "../../lib/dataLoader";
import { useTranslations } from "../../contexts/LocaleContext";

function HostDashboardContent() {
  const { user } = useUser();
  const tProfile = useTranslations("profile");
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

  // Profile helper functions
  const getRankColor = (rank) => {
    const colors = {
      Silver: "text-gray-400",
      Gold: "text-yellow-400",
      Platinum: "text-blue-400",
      Diamond: "text-purple-400",
      Master: "text-red-400",
    };
    return colors[rank] || "text-gray-300";
  };

  const getRankEmblem = (rank) => {
    const emblems = {
      Gold: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289695/Gold_Emblem_odau8h.webp",
      Platinum:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Platinum_Emblem_with_effect_ixwafm.webp",
      Diamond:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Diomond_Emblem_with_effect_g6lssd.webp",
      Master:
        "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747291235/Master_Emblem_with_effect_rd2xt6.webp",
    };
    return emblems[rank] || null;
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto">
          {/* Profile + Stats Hero Section */}
          <div className="border-gold-dark/20 bg-dark-gray-card/80 relative mb-8 overflow-hidden rounded-2xl border p-5 shadow-lg shadow-gray-800/30 backdrop-blur-sm sm:p-6 lg:p-8">
            {/* Decorative elements */}
            <div className="bg-gold-dark/10 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl sm:h-64 sm:w-64"></div>
            <div className="bg-gold/5 absolute bottom-0 left-1/3 h-32 w-32 rounded-full blur-2xl sm:h-48 sm:w-48"></div>

            <div className="relative">
              {/* Profile Row */}
              <div className="mb-6 flex flex-col gap-6 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Avatar + User Info */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="bg-gold-gradient absolute -inset-1 rounded-full opacity-75 blur"></div>
                    <div className="border-gold-dark/50 relative h-16 w-16 overflow-hidden rounded-full border-2 sm:h-20 sm:w-20">
                      {user.avatar &&
                      (user.avatar.startsWith("http") ||
                        user.avatar.startsWith("/")) ? (
                        <Image
                          src={user.avatar}
                          alt="Avatar"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="bg-gold/10 flex h-full w-full items-center justify-center text-3xl sm:text-4xl">
                          {user.avatar || "👤"}
                        </div>
                      )}
                    </div>
                    {/* <div className="border-dark-primary bg-gold text-dark-primary absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:h-7 sm:w-7">
                      H
                    </div> */}
                  </div>

                  {/* User Info */}
                  <div className="text-center sm:text-left">
                    <h1 className="text-gold-gradient mb-1 text-xl font-bold tracking-tight sm:text-2xl">
                      {user.username}
                    </h1>
                    <p className="mb-2 text-sm text-white/40">{user.email}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span className="bg-gold-dark/20 text-gold-light rounded-full px-3 py-1 text-xs font-medium capitalize">
                        {user.type === "host" ? "🎮 " : "⚔️ "}
                        {tProfile(user.type) || user.type}
                      </span>
                      {user.rank && (
                        <span
                          className={`bg-dark-primary/50 rounded-full px-3 py-1 text-xs font-medium ${getRankColor(user.rank)}`}
                        >
                          {user.rank}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Game ID, Rank, Create Tournament */}
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
                  {/* Game ID */}
                  <div className="border-gold-dark/30 bg-dark-primary/50 flex items-center gap-3 rounded-xl border px-4 py-3">
                    <div className="bg-gold-dark/20 text-gold flex h-9 w-9 items-center justify-center rounded-lg">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest text-white/40 uppercase">
                        {tProfile("gameId") || "Game ID"}
                      </p>
                      <p className="font-mono text-sm text-white">
                        {user?.gameId || tProfile("notSet") || "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="border-gold-dark/30 bg-dark-primary/50 flex items-center gap-3 rounded-xl border px-4 py-3">
                    {user?.rank && getRankEmblem(user.rank) ? (
                      <div className="h-9 w-9 flex-shrink-0">
                        <Image
                          src={getRankEmblem(user.rank)}
                          alt={user.rank}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-gold-dark/20 text-gold flex h-9 w-9 items-center justify-center rounded-lg">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] tracking-widest text-white/40 uppercase">
                        {tProfile("rank") || "Rank"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${user?.rank ? getRankColor(user.rank) : "text-white/50"}`}
                      >
                        {user?.rank || tProfile("notSet") || "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Create Tournament Button */}
                  <Link href="/host/create-tournament">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      ✨ Create Tournament
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {/* Total Tournaments Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 relative overflow-hidden rounded-xl border border-white/10 p-4 transition-all duration-300 md:p-5">
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
                      {stats.total}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Total Tournaments
                    </div>
                  </div>
                </div>

                {/* Upcoming Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 relative overflow-hidden rounded-xl border border-white/10 p-4 transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/004.webp"
                        alt="Upcoming"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      {stats.upcoming}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Upcoming
                    </div>
                  </div>
                </div>

                {/* Ongoing Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 relative overflow-hidden rounded-xl border border-white/10 p-4 transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/003.webp"
                        alt="Ongoing"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      {stats.ongoing}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Ongoing
                    </div>
                  </div>
                </div>

                {/* Completed Card */}
                <div className="group hover:border-gold-dark/40 bg-dark-primary/60 hover:bg-dark-primary/80 relative overflow-hidden rounded-xl border border-white/10 p-4 transition-all duration-300 md:p-5">
                  <div className="via-gold-dark/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                      <Image
                        src="/icons/001.webp"
                        alt="Completed"
                        width={26}
                        height={26}
                      />
                    </div>
                    <div className="text-gold-text text-2xl font-bold md:text-3xl">
                      {stats.completed}
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase md:text-xs">
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tournaments List */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-3">
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

              {/* Tournament List - Desktop */}
              <div className="hidden space-y-8 sm:block">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>

              {/* Tournament List - Mobile */}
              <div className="space-y-3 sm:hidden">
                {filteredTournaments.map((tournament) => (
                  <MobileTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                  />
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
