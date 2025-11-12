"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  calculateActualPrizePool,
  getPrizePoolDisplay,
  getPrizePoolDisplayDual,
  getEntryFeeDisplayDual,
} from "./lib/prizeCalculator";
import { tournamentsApi } from "./lib/api";
import { getTournamentIcon } from "./lib/iconSelector";
import { useUser } from "./contexts/UserContext";
import { getClanById } from "./lib/dataLoader";
import {
  calculateClanBattlePrizeDistribution,
  formatPrizeAmount,
  formatPrizeWithDiamonds,
} from "./lib/clanPrizeDistribution";
import Button from "./components/Button";
import Card from "./components/Card";
import Badge from "./components/Badge";
import CountdownTimer from "./components/CountdownTimer";

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [displayTypeTab, setDisplayTypeTab] = useState("tournaments"); // Default to tournaments
  const [selectedGame, setSelectedGame] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clanData, setClanData] = useState({});
  const { user, loading: userLoading } = useUser();

  // Initialize clans
  // Removed initializeClans since we're now using dataLoader

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentsData = await tournamentsApi.getAll();

        // Debug: Log automated tournaments
        const automatedTournaments = tournamentsData.filter(
          (t) => t.is_automated
        );
        if (automatedTournaments.length > 0) {
          console.log(
            "Automated tournaments found:",
            automatedTournaments.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              is_automated: t.is_automated,
              expires_at: t.expires_at,
            }))
          );
        }

        setTournaments(tournamentsData);

        // Load clan data for clan battle tournaments
        const clanIds = new Set();
        tournamentsData.forEach((tournament) => {
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
        console.error("Failed to load tournaments:", error);
        // Show empty state if API fails
        setTournaments([]);
      }
    };

    loadData();
  }, []);

  const filteredTournaments = tournaments
    .filter((t) => {
      // Only show active tournaments (upcoming or ongoing)
      const isActive = t.status === "upcoming" || t.status === "ongoing";

      // Only show automated tournaments with Gold, Platinum, Diamond, or Master levels
      const isAutomated = t.is_automated === true || t.is_automated === "true";
      const allowedLevels = ["gold", "platinum", "diamond", "master"];
      const isAllowedLevel =
        t.automated_level &&
        allowedLevels.includes(t.automated_level.toLowerCase());

      // Apply additional filters
      const statusMatch = activeTab === "all" || t.status === activeTab;
      const gameMatch = selectedGame === "all" || t.game === selectedGame;
      const displayTypeMatch =
        (displayTypeTab === "tournaments" && t.display_type === "tournament") ||
        (displayTypeTab === "events" && t.display_type === "event");

      // Search filter - check title, game, and tournament type
      const searchMatch =
        searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.game && t.game.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tournament_type &&
          t.tournament_type.toLowerCase().includes(searchQuery.toLowerCase()));

      return (
        isActive &&
        // isAutomated &&
        // isAllowedLevel &&
        statusMatch &&
        gameMatch &&
        displayTypeMatch &&
        searchMatch
      );
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

  // Get unique games for filter
  const availableGames = [...new Set(tournaments.map((t) => t.game))].sort();

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
      {/* Hero Section - Full Width */}
      <div className="relative text-center mb-12 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://res.cloudinary.com/dg0cmj6su/image/upload/v1741077269/Champions_Webpage_Succubus_pqguqq.webp)",
            backgroundPosition: "0 15%",
          }}
        />

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

        {/* Content */}
        <div className="relative z-10 py-16 sm:py-20 lg:py-24 px-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl">
            <span className="text-gold-gradient">
              Force of Rune Tournaments
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto drop-shadow-lg font-medium">
            Join competitive Force of Rune tournaments, compete with the best,
            and win amazing prizes! 💎
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* CTA for different user types */}
          {!user && (
            <Card glass padding="p-8" className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-gold mb-4">
                Ready to compete? 🎮
              </h2>
              <p className="text-gray-300 mb-6">
                Login as a player to join tournaments or as a host to create
                your own!
              </p>
              <Link href="/login">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
            </Card>
          )}

          {user && user.type === "host" && (
            <Card
              glass
              className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-xl font-bold text-gold mb-2">
                  Host a Tournament 👑
                </h2>
                <p className="text-gray-300">
                  Create your own tournament and manage participants
                </p>
              </div>
              <Link href="/host/create-tournament">
                <Button variant="primary">Create Tournament</Button>
              </Link>
            </Card>
          )}

          {user && user.type === "player" && (
            <Card glass padding="p-6" className="mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">💎</div>
                  <div>
                    <p className="text-gray-400 text-sm">Your Balance</p>
                    <p className="text-gold font-bold text-2xl">
                      {user.diamonds.toLocaleString()} Diamonds
                    </p>
                  </div>
                </div>
                <Link href="/player/dashboard">
                  <Button variant="secondary">View Dashboard</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Display Type Tabs - Tournament vs Event */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-dark-card/80 via-dark-card to-dark-card/80 p-1.5 rounded-2xl border border-gold-dark/30 backdrop-blur-sm max-w-md mx-auto">
              <div className="flex gap-2">
                {[
                  {
                    key: "tournaments",
                    label: "Tournaments",
                    icon: "⚡",
                    gradient: "from-yellow-500/20 to-orange-500/20",
                  },
                  {
                    key: "events",
                    label: "Events",
                    icon: "🎪",
                    gradient: "from-purple-500/20 to-pink-500/20",
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDisplayTypeTab(tab.key)}
                    className={`
                    flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-base
                    transition-all duration-300 ease-out
                    ${
                      displayTypeTab === tab.key
                        ? `bg-gradient-to-br ${tab.gradient} border-2 border-gold text-white shadow-lg shadow-gold/30 scale-105`
                        : "bg-dark-card/50 border-2 border-transparent text-gray-400 hover:text-white hover:bg-dark-card/80"
                    }
                  `}
                  >
                    <span
                      className={`text-2xl transition-transform duration-300 ${
                        displayTypeTab === tab.key ? "scale-110" : ""
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span className="tracking-wide">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-dark-card/60 via-dark-card/40 to-dark-card/60 backdrop-blur-xl border border-gold-dark/20 rounded-2xl p-4 sm:px-4 sm:py-0 shadow-2xl shadow-black/30">
              <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
                {/* Left Section - Status Filters */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "All", icon: "🎯" },
                      { key: "upcoming", label: "Upcoming", icon: "⏰" },
                      { key: "ongoing", label: "Ongoing", icon: "🔥" },
                      { key: "completed", label: "Completed", icon: "✅" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                          group relative px-4 py-2.5 rounded-xl font-semibold text-sm
                          transition-all duration-300 ease-out
                          ${
                            activeTab === tab.key
                              ? "bg-gradient-to-r from-gold to-yellow-600 text-black shadow-lg shadow-gold/40 scale-105"
                              : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`text-base transition-transform duration-300 ${
                              activeTab === tab.key ? "scale-110" : ""
                            }`}
                          >
                            {tab.icon}
                          </span>
                          <span>{tab.label}</span>
                        </span>
                        {activeTab === tab.key && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold to-yellow-600 opacity-30 blur-xl -z-10 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Divider - Hidden on Mobile */}
                <div className="hidden lg:block w-px h-20 bg-gradient-to-b from-transparent via-gold-dark/30 to-transparent" />

                {/* Right Section - Search */}
                <div className="lg:w-96 space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                      <svg
                        className="w-5 h-5 text-gold-dark group-focus-within:text-gold transition-colors duration-300"
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
                      className="w-full bg-gradient-to-r from-black/40 to-black/20 border-2 border-white/10 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all duration-300 hover:border-white/20"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gold transition-all duration-200 hover:scale-110"
                        aria-label="Clear search"
                      >
                        <div className="p-1 rounded-full hover:bg-gold/20">
                          <svg
                            className="w-4 h-4"
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
                    {/* Active indicator glow */}
                    {searchQuery && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/20 to-yellow-600/20 opacity-20 blur-lg -z-10 animate-pulse pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Filter */}
          {/* {availableGames.length > 1 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-gray-300 font-medium text-sm sm:text-base">
                Filter by Game:
              </span>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-dark-card border border-gold-dark/30 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Games</option>
                {availableGames.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )} */}

          {/* Tournament List - Vertical View */}
          <div className="space-y-4">
            {filteredTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}`}
                className="block"
              >
                <div className="tournament-card group relative">
                  <div className="status-stripe overflow-hidden" />

                  <div className="p-4 sm:p-6 border border-[#ffb80033] rounded-lg">
                    {/* Top Row: Title, Status, and Prize */}
                    <div className="flex flex-col lg:flex-row !items-center lg:items-start gap-4">
                      {/* Left Section: Icon + Title + Stats */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                        <div className="tournament-icon flex-shrink-0">
                          {(() => {
                            const icon = getTournamentIcon(tournament);
                            const isImageUrl =
                              typeof icon === "string" &&
                              icon.startsWith("http");

                            if (isImageUrl) {
                              return (
                                <Image
                                  src={icon}
                                  alt={`${tournament.title} icon`}
                                  width={80}
                                  height={80}
                                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                                  unoptimized
                                />
                              );
                            }

                            return (
                              <span className="text-4xl sm:text-5xl lg:text-6xl">
                                {icon}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Title and Badges */}
                          <div className="flex items-start gap-2 flex-wrap mb-2">
                            <h3 className="sm:hidden text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-gold transition-colors duration-300 tracking-tight">
                              {tournament.title}
                            </h3>
                          </div>

                          {/* Badges Row */}
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <h3 className="hidden sm:block text-xl sm:text-xl lg:text-2xl font-black text-white group-hover:text-gold transition-colors duration-300 tracking-tight">
                              {tournament.title}
                            </h3>
                            <Badge
                              variant={tournament.status}
                              size="sm"
                              className="!capitalize"
                            >
                              {tournament.status}
                            </Badge>
                            {tournament.display_type === "tournament" && (
                              <Badge
                                variant="primary"
                                size="sm"
                                className="font-semibold"
                              >
                                ⚡ Tournament
                              </Badge>
                            )}
                            {tournament.display_type === "event" && (
                              <Badge
                                variant="secondary"
                                size="sm"
                                className="font-semibold"
                              >
                                🎪 Event
                              </Badge>
                            )}
                            {(tournament.tournament_type ??
                              tournament.tournamentType) === "clan_battle" && (
                              <Badge variant="warning" size="sm">
                                ⚔️ Clan
                              </Badge>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-gold/30 via-gold/30 to-transparent mb-3 lg:mb-4" />

                          {/* Stats - Responsive Grid */}
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 lg:gap-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                                <span className="text-base sm:text-lg">👥</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                  Players
                                </div>
                                <div className="text-white font-bold text-sm sm:text-base truncate">
                                  {tournament.participants.length}/
                                  {tournament.max_players ??
                                    tournament.maxPlayers}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/20 flex-shrink-0">
                                <span className="text-base sm:text-lg">💰</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                  Entry Fee
                                </div>
                                <div className="text-white font-bold text-sm sm:text-base truncate">
                                  {tournament.entry_fee ? (
                                    `$${getEntryFeeDisplayDual(tournament).usd}`
                                  ) : (
                                    <span className="text-green-400">Free</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                                <span className="text-base sm:text-lg">📅</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                  Schedule
                                </div>
                                <div className="text-white font-bold text-xs sm:text-sm truncate">
                                  {formatDate(tournament.date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Countdown + Prize Pool */}
                      <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                        {/* Show countdown for upcoming automated tournaments (to expires_at) */}
                        {tournament.status === "upcoming" &&
                          (tournament.is_automated === true ||
                            tournament.is_automated === "true") &&
                          tournament.expires_at && (
                            <div className="countdown-wrapper w-full sm:w-auto">
                              <CountdownTimer
                                expiresAt={tournament.expires_at}
                                label="Join before"
                              />
                            </div>
                          )}

                        {/* Show countdown for upcoming non-automated tournaments */}
                        {tournament.status === "upcoming" &&
                          !(
                            tournament.is_automated === true ||
                            tournament.is_automated === "true"
                          ) && (
                            <div className="countdown-wrapper w-full sm:w-auto">
                              <CountdownTimer
                                date={tournament.date}
                                time={tournament.time}
                                label="Starts in"
                              />
                            </div>
                          )}

                        {/* Show countdown to joining deadline for ongoing automated tournaments */}
                        {tournament.status === "ongoing" &&
                          (tournament.is_automated === true ||
                            tournament.is_automated === "true") &&
                          tournament.expires_at && (
                            <div className="countdown-wrapper w-full sm:w-auto">
                              <CountdownTimer
                                expiresAt={tournament.expires_at}
                                label="Join before"
                              />
                            </div>
                          )}

                        {/* Show started message for ongoing non-automated */}
                        {tournament.status === "ongoing" &&
                          !(
                            tournament.is_automated === true ||
                            tournament.is_automated === "true"
                          ) && (
                            <div className="countdown-wrapper w-full sm:w-auto">
                              <div className="text-red-400 text-sm font-medium">
                                ⏰ Tournament Started
                              </div>
                            </div>
                          )}

                        {/* Prize Pool */}
                        {tournament?.prize_pool !== 0 && (
                          <div className="prize-display flex-shrink-0 w-full sm:w-auto">
                            <div className="text-center sm:text-right">
                              <div className="text-[10px] sm:text-xs text-gold uppercase font-bold mb-1 tracking-wider">
                                Prize Pool
                              </div>
                              <div className="text-gold font-black text-xl sm:text-2xl lg:text-2xl leading-none mb-1">
                                ${getPrizePoolDisplayDual(tournament).usd}
                              </div>
                              <div className="text-gold-dark text-xs sm:text-sm font-semibold">
                                {getPrizePoolDisplayDual(tournament).diamonds}{" "}
                                💎
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredTournaments.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{searchQuery ? "🔍" : "🎮"}</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No tournaments found"}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Check back later for new tournaments!"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-6 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg font-medium transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
