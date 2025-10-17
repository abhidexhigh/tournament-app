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
import { getClanById, initializeClans } from "./lib/clans";
import Button from "./components/Button";
import Card from "./components/Card";
import Badge from "./components/Badge";
import CountdownTimer from "./components/CountdownTimer";

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedGame, setSelectedGame] = useState("all");
  const { user, loading: userLoading } = useUser();

  // Initialize clans
  useEffect(() => {
    initializeClans();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentsData = await tournamentsApi.getAll();
        setTournaments(tournamentsData);
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

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournament/${tournament.id}`}
              className="block"
            >
              <Card hover className="h-full group glow-gold-hover">
                {/* Tournament Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">
                    {getTournamentIcon(tournament)}
                  </div>
                  <Badge variant={tournament.status} className="capitalize">
                    {tournament.status}
                  </Badge>
                </div>

                {/* Tournament Info */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                  {tournament.title}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-gray-400 text-sm">{tournament.game}</p>
                  {(tournament.tournament_type ?? tournament.tournamentType) ===
                    "clan_battle" && (
                    <Badge variant="warning" size="sm">
                      ⚔️ Clan Battle
                    </Badge>
                  )}
                </div>

                {/* Countdown Timer for Upcoming Tournaments */}
                {tournament.status === "upcoming" && (
                  <div className="mb-4 p-3 bg-dark-secondary rounded-lg border border-gold-dark/30">
                    <CountdownTimer
                      date={tournament.date}
                      time={tournament.time}
                    />
                  </div>
                )}

                {/* Details Grid */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">📅 Date</span>
                    <span className="text-white font-medium">
                      {formatDate(tournament.date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">⏰ Time</span>
                    <span className="text-white font-medium">
                      {tournament.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">👥 Players</span>
                    <span className="text-white font-medium">
                      {tournament.participants.length}/
                      {tournament.max_players ?? tournament.maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">💰 Entry Fee</span>
                    <span className="text-white font-medium">
                      {tournament.entry_fee ? (
                        <span>
                          ${getEntryFeeDisplayDual(tournament).usd} USD
                          <br />
                          <span className="text-gold text-xs">
                            ({getEntryFeeDisplayDual(tournament).diamonds} 💎)
                          </span>
                        </span>
                      ) : (
                        "Free"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">🏆 Min Rank</span>
                    <span className="text-white font-medium">
                      {tournament.min_rank || "Any"}
                    </span>
                  </div>

                  {/* Clan Battle Information */}
                  {(tournament.tournament_type ?? tournament.tournamentType) ===
                    "clan_battle" && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">🎯 Mode</span>
                        <span className="text-white font-medium">
                          {(tournament.clan_battle_mode ??
                            tournament.clanBattleMode) === "auto_division"
                            ? "Auto-Division"
                            : "Clan Selection"}
                        </span>
                      </div>
                      {(tournament.clan_battle_mode ??
                        tournament.clanBattleMode) === "clan_selection" && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">🏰 Clan 1</span>
                            <span className="text-white font-medium text-xs">
                              {tournament.clan1_id
                                ? (() => {
                                    const clan = getClanById(
                                      tournament.clan1_id
                                    );
                                    return clan
                                      ? `${clan.emblem} ${clan.name}`
                                      : "TBD";
                                  })()
                                : "TBD"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">🏰 Clan 2</span>
                            <span className="text-white font-medium text-xs">
                              {tournament.clan2_id
                                ? (() => {
                                    const clan = getClanById(
                                      tournament.clan2_id
                                    );
                                    return clan
                                      ? `${clan.emblem} ${clan.name}`
                                      : "TBD";
                                  })()
                                : "TBD"}
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Prize Pool */}
                <div className="pt-4 border-t border-gold-dark/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Prize Pool</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gold text-xl">💰</span>
                      <span className="text-gold font-bold text-lg">
                        ${getPrizePoolDisplayDual(tournament).usd} USD
                      </span>
                    </div>
                  </div>
                  <div className="text-gold text-sm text-right">
                    ({getPrizePoolDisplayDual(tournament).diamonds} 💎)
                  </div>
                  {(tournament.prize_pool_type ?? tournament.prizePoolType) ===
                    "entry-based" && (
                    <div className="text-xs text-gray-500">
                      Entry-based • {tournament.participants.length}/
                      {tournament.max_players ?? tournament.maxPlayers} players
                    </div>
                  )}
                </div>
              </Card>
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
