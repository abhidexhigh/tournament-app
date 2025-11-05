"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [selectedGame, setSelectedGame] = useState("all");
  const [clanData, setClanData] = useState({});
  const { user, loading: userLoading } = useUser();

  // Initialize clans
  // Removed initializeClans since we're now using dataLoader

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentsData = await tournamentsApi.getAll();
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
    const statusMatch = activeTab === "all" || t.status === activeTab;
    const gameMatch = selectedGame === "all" || t.game === selectedGame;
    return statusMatch && gameMatch;
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

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: "all", label: "All Tournaments" },
            { key: "upcoming", label: "Upcoming" },
            { key: "ongoing", label: "Ongoing" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "primary" : "secondary"}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Game Filter */}
        {availableGames.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gray-300 font-medium">Filter by Game:</span>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-dark-card border border-gold-dark/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
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
                <div className="status-stripe" />

                <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                  {/* Left Section - Icon and Main Info */}
                  <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                    <div className="tournament-icon flex-shrink-0">
                      <span className="text-4xl">
                        {getTournamentIcon(tournament)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-gold transition-colors duration-300 tracking-tight">
                          {tournament.title}
                        </h3>
                        <Badge
                          variant={tournament.status}
                          className="!capitalize text-xs font-semibold"
                        >
                          {tournament.status}
                        </Badge>
                      </div>

                      {/* Game Name - Highlighted */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-gold/20 to-gold/5 border border-gold/30 rounded-lg">
                          <span className="text-gold font-bold text-base flex items-center gap-2">
                            🎮 {tournament.game}
                          </span>
                        </div>
                        {tournament.is_automated && (
                          <Badge
                            variant="primary"
                            size="sm"
                            className="font-semibold animate-pulse"
                          >
                            ⚡ Auto Match
                          </Badge>
                        )}
                        {(tournament.tournament_type ??
                          tournament.tournamentType) === "clan_battle" && (
                          <Badge
                            variant="warning"
                            size="sm"
                            className="font-semibold"
                          >
                            ⚔️ Clan Battle
                          </Badge>
                        )}
                        {tournament.status === "ongoing" &&
                          !tournament.is_automated && (
                            <Badge
                              variant="primary"
                              size="sm"
                              className="animate-pulse font-semibold"
                            >
                              🔥 1 Slot Left
                            </Badge>
                          )}
                      </div>

                      {/* Info Pills - Enhanced */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-colors">
                          <span className="text-gold text-sm">👥</span>
                          <span className="text-white font-semibold text-sm">
                            {tournament.participants.length}/
                            {tournament.max_players ?? tournament.maxPlayers}
                          </span>
                          <span className="text-gray-400 text-xs">players</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-colors">
                          <span className="text-blue-400 text-sm">📅</span>
                          <span className="text-white font-medium text-sm">
                            {formatDate(tournament.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-colors">
                          <span className="text-purple-400 text-sm">⏰</span>
                          <span className="text-white font-medium text-sm">
                            {tournament.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Section - Countdown Timer */}
                  {tournament.status === "upcoming" && (
                    <div className="flex items-center justify-center">
                      <div className="countdown-wrapper">
                        <CountdownTimer
                          date={tournament.date}
                          time={tournament.time}
                        />
                      </div>
                    </div>
                  )}

                  {/* Right Section - Prize Pool */}
                  <div className="flex-shrink-0">
                    <div className="prize-display text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-gold text-3xl">💰</span>
                        <div className="text-left">
                          <div className="text-gold font-bold text-2xl">
                            ${getPrizePoolDisplayDual(tournament).usd}
                          </div>
                          <div className="text-gold-dark text-sm">
                            {getPrizePoolDisplayDual(tournament).diamonds} 💎
                          </div>
                        </div>
                      </div>
                      {(tournament.prize_pool_type ??
                        tournament.prizePoolType) === "entry-based" && (
                        <div className="text-xs text-gray-500 mt-2">
                          Entry-based
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details - Shown on Hover */}
                <div className="overflow-hidden max-h-0 group-hover:max-h-[600px] transition-all duration-500">
                  <div className="info-grid px-6 pb-6 opacity-0 transform translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out">
                    <div className="info-item group/fee relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover/fee:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-3 w-full">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30">
                          <span className="text-xl">💰</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-0.5">
                            Entry Fee
                          </div>
                          <div className="text-white font-bold text-base">
                            {tournament.entry_fee ? (
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-white">
                                  ${getEntryFeeDisplayDual(tournament).usd}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  USD
                                </span>
                                <span className="text-gold text-sm ml-1">
                                  ({getEntryFeeDisplayDual(tournament).diamonds}{" "}
                                  💎)
                                </span>
                              </div>
                            ) : (
                              <span className="text-green-400 font-bold">
                                Free Entry!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="info-item group/rank relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover/rank:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-3 w-full">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/30">
                          <span className="text-xl">🏆</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-0.5">
                            Minimum Rank
                          </div>
                          <div className="text-white font-bold text-base">
                            {tournament.min_rank ? (
                              <span className="text-white">
                                {tournament.min_rank}
                              </span>
                            ) : (
                              <span className="text-green-400">
                                Open to All
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clan Battle Information */}
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "clan_battle" && (
                      <>
                        <div className="info-item">
                          <span className="text-gold">🎯</span>
                          <div className="flex-1">
                            <div className="text-xs text-gray-400">
                              Battle Mode
                            </div>
                            <div className="text-white font-medium text-sm">
                              {(tournament.clan_battle_mode ??
                                tournament.clanBattleMode) === "auto_division"
                                ? "Auto-Division"
                                : "Clan Selection"}
                            </div>
                          </div>
                        </div>
                        {(tournament.clan_battle_mode ??
                          tournament.clanBattleMode) === "clan_selection" && (
                          <>
                            <div className="info-item">
                              <span className="text-gold">🏰</span>
                              <div className="flex-1">
                                <div className="text-xs text-gray-400">
                                  Clan 1
                                </div>
                                <div className="text-white font-medium text-sm">
                                  {tournament.clan1_id
                                    ? (() => {
                                        const clan =
                                          clanData[tournament.clan1_id];
                                        return clan
                                          ? `${clan.emblem} ${clan.name}`
                                          : "Loading...";
                                      })()
                                    : "TBD"}
                                </div>
                              </div>
                            </div>
                            <div className="info-item">
                              <span className="text-gold">🏰</span>
                              <div className="flex-1">
                                <div className="text-xs text-gray-400">
                                  Clan 2
                                </div>
                                <div className="text-white font-medium text-sm">
                                  {tournament.clan2_id
                                    ? (() => {
                                        const clan =
                                          clanData[tournament.clan2_id];
                                        return clan
                                          ? `${clan.emblem} ${clan.name}`
                                          : "Loading...";
                                      })()
                                    : "TBD"}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Prize Distribution Preview */}
                        <div className="col-span-full mt-2 pt-3 border-t border-gold-dark/20">
                          <div className="text-xs text-gray-400 mb-3 font-semibold">
                            🏆 Prize Distribution
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="info-item">
                              <div className="flex-1">
                                <div className="text-xs text-gray-400">
                                  1st Place
                                </div>
                                <div className="text-gold font-semibold text-sm">
                                  {(() => {
                                    const maxPlayers =
                                      tournament.max_players ||
                                      tournament.maxPlayers ||
                                      30;
                                    const prizePoolUsd =
                                      tournament.prize_pool_usd ||
                                      (tournament.prize_pool ||
                                        tournament.prizePool ||
                                        0) / 100;

                                    if (prizePoolUsd <= 0) return "$0 (0 💎)";

                                    const teamSize =
                                      tournament.clan_battle_mode ===
                                      "auto_division"
                                        ? Math.floor(maxPlayers / 2)
                                        : maxPlayers / 2;
                                    const distribution =
                                      calculateClanBattlePrizeDistribution(
                                        prizePoolUsd,
                                        teamSize
                                      );
                                    return formatPrizeWithDiamonds(
                                      distribution.topPerformers[0]?.prize || 0
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div className="info-item">
                              <div className="flex-1">
                                <div className="text-xs text-gray-400">
                                  Team Members
                                </div>
                                <div className="text-gold font-semibold text-sm">
                                  {(() => {
                                    const maxPlayers =
                                      tournament.max_players ||
                                      tournament.maxPlayers ||
                                      30;
                                    const prizePoolUsd =
                                      tournament.prize_pool_usd ||
                                      (tournament.prize_pool ||
                                        tournament.prizePool ||
                                        0) / 100;

                                    if (prizePoolUsd <= 0) return "$0 (0 💎)";

                                    const teamSize =
                                      tournament.clan_battle_mode ===
                                      "auto_division"
                                        ? Math.floor(maxPlayers / 2)
                                        : maxPlayers / 2;
                                    const distribution =
                                      calculateClanBattlePrizeDistribution(
                                        prizePoolUsd,
                                        teamSize
                                      );
                                    return formatPrizeWithDiamonds(
                                      distribution.remainingMembers
                                        ?.individualPrize || 0
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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
