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
  const [displayTypeTab, setDisplayTypeTab] = useState("all"); // New: Tournament/Event filter
  const [selectedGame, setSelectedGame] = useState("all");
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

  const filteredTournaments = tournaments.filter((t) => {
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
      displayTypeTab === "all" ||
      (displayTypeTab === "tournaments" && t.display_type === "tournament") ||
      (displayTypeTab === "events" && t.display_type === "event");

    return (
      isActive &&
      isAutomated &&
      isAllowedLevel &&
      statusMatch &&
      gameMatch &&
      displayTypeMatch
    );
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            <span className="text-gold-gradient">
              Force of Rune Tournaments
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join competitive Force of Rune tournaments, compete with the best,
            and win amazing prizes! 💎
          </p>
        </div>

        {/* CTA for different user types */}
        {!user && (
          <Card glass padding="p-8" className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gold mb-4">
              Ready to compete? 🎮
            </h2>
            <p className="text-gray-300 mb-6">
              Login as a player to join tournaments or as a host to create your
              own!
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
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
          {[
            { key: "all", label: "All", icon: "🎯" },
            { key: "tournaments", label: "Tournaments", icon: "⚡" },
            { key: "events", label: "Events", icon: "🎪" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={displayTypeTab === tab.key ? "primary" : "secondary"}
              onClick={() => setDisplayTypeTab(tab.key)}
              size="sm"
            >
              <span className="flex items-center gap-1.5">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </Button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {[
            { key: "all", label: "All Status" },
            { key: "upcoming", label: "Upcoming" },
            { key: "ongoing", label: "Ongoing" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "primary" : "secondary"}
              onClick={() => setActiveTab(tab.key)}
              size="sm"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Game Filter */}
        {availableGames.length > 1 && (
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
        )}

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
                            typeof icon === "string" && icon.startsWith("http");

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
                              {getPrizePoolDisplayDual(tournament).diamonds} 💎
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
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No tournaments found
            </h3>
            <p className="text-gray-500">
              Check back later for new tournaments!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
