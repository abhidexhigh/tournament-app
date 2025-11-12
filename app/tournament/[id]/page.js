"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Select from "../../components/Select";
import CountdownTimer from "../../components/CountdownTimer";
import Tabs from "../../components/Tabs";
import { getCurrentUser } from "../../lib/auth";
import {
  calculateActualPrizePool,
  calculatePrizes,
  getPrizePoolDisplay,
  getPrizePoolDisplayDual,
  getEntryFeeDisplayDual,
} from "../../lib/prizeCalculator";
import { tournamentsApi } from "../../lib/api";
import { getTournamentIcon } from "../../lib/iconSelector";
import { getUserById } from "../../lib/auth";
import { refreshUserFromAPI } from "../../lib/authHelpers";
import { useUser } from "../../contexts/UserContext";
import {
  getClanById,
  canUserJoinClanBattle,
  getUserClan,
  getUserClans,
} from "../../lib/dataLoader";
import {
  calculateClanBattlePrizeDistribution,
  formatPrizeAmount,
  formatPrizeWithDiamonds,
} from "../../lib/clanPrizeDistribution";
import {
  generateRandomLeaderboard,
  generateClanBattleLeaderboard,
  generateRegularLeaderboard,
  getPerformanceBadgeColor,
  getPerformanceEmoji,
  formatScore,
  getPositionSuffix,
} from "../../lib/leaderboardGenerator";
import matchesData from "../../../data/matches.json";

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, refreshUser } = useUser();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState({
    first: "",
    second: "",
    third: "",
  });
  const [errors, setErrors] = useState({});
  const [clan1, setClan1] = useState(null);
  const [clan2, setClan2] = useState(null);
  const [prizeDistribution, setPrizeDistribution] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("diamonds"); // "diamonds", "usd", or "tickets"
  const [selectedTicketType, setSelectedTicketType] = useState(null); // ticket_010, ticket_100, ticket_1000
  const [matchFilter, setMatchFilter] = useState("all"); // "all", "ongoing", "completed"

  // Set default payment method based on display_type
  useEffect(() => {
    if (tournament) {
      // Tournaments can only use tickets, Events can use all three
      if (tournament.display_type === "tournament") {
        setPaymentMethod("tickets");
      }
    }
  }, [tournament]);

  // Auto-select ticket type based on entry fee
  useEffect(() => {
    if (tournament && paymentMethod === "tickets") {
      const entryFeeUsd = Number(tournament.entry_fee_usd || 0);

      // Automatically select the matching ticket type (use Math.abs for floating point precision)
      if (Math.abs(entryFeeUsd - 0.1) < 0.01) {
        setSelectedTicketType("ticket_010");
      } else if (Math.abs(entryFeeUsd - 1.0) < 0.01) {
        setSelectedTicketType("ticket_100");
      } else if (Math.abs(entryFeeUsd - 10.0) < 0.01) {
        setSelectedTicketType("ticket_1000");
      } else {
        // If no matching ticket or free tournament, clear selection
        setSelectedTicketType(null);
      }
    } else if (paymentMethod !== "tickets") {
      // Clear ticket selection when switching away from tickets
      setSelectedTicketType(null);
    }
  }, [tournament, paymentMethod]);
  const [selectedMatch, setSelectedMatch] = useState(null); // For matches tab

  // Removed initializeClans since we're now using dataLoader

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentData = await tournamentsApi.getById(params.id);
        setTournament(tournamentData);

        if (tournamentData) {
          // Load participants
          const participantsList = await Promise.all(
            tournamentData.participants.map((pId) => getUserById(pId))
          );
          const validParticipants = participantsList.filter(
            (p) => p !== null && p !== undefined && p.id
          );
          console.log(
            "Loaded participants:",
            validParticipants.length,
            "out of",
            tournamentData.participants.length
          );
          setParticipants(validParticipants);

          // Load clan information for clan battle tournaments
          if (
            tournamentData.tournament_type === "clan_battle" &&
            tournamentData.clan_battle_mode === "clan_selection"
          ) {
            if (tournamentData.clan1_id) {
              const clan1Data = await getClanById(tournamentData.clan1_id);
              setClan1(clan1Data);
            }
            if (tournamentData.clan2_id) {
              const clan2Data = await getClanById(tournamentData.clan2_id);
              setClan2(clan2Data);
            }
          }

          // Calculate prize distribution for clan battle tournaments
          if (tournamentData.tournament_type === "clan_battle") {
            const maxPlayers =
              tournamentData.maxPlayers || tournamentData.max_players || 30;
            // Use USD value for calculation, fallback to diamonds converted to USD
            const prizePoolUsd =
              tournamentData.prize_pool_usd ||
              (tournamentData.prize_pool || tournamentData.prizePool || 0) /
                100;

            // Only calculate if we have valid data
            if (prizePoolUsd > 0 && maxPlayers > 0) {
              const teamSize =
                tournamentData.clan_battle_mode === "auto_division"
                  ? Math.floor(maxPlayers / 2)
                  : maxPlayers / 2; // For clan selection, each clan gets half

              const distribution = calculateClanBattlePrizeDistribution(
                prizePoolUsd,
                teamSize
              );
              setPrizeDistribution(distribution);
            } else {
              console.warn("Invalid tournament data for prize calculation:", {
                prizePoolUsd,
                maxPlayers,
                tournamentData,
              });
              setPrizeDistribution(null);
            }
          }

          // Generate leaderboard for completed tournaments
          if (
            tournamentData.status === "completed" &&
            tournamentData.participants &&
            tournamentData.participants.length > 0
          ) {
            // Generate leaderboard using the already filtered valid participants
            if (validParticipants.length > 0) {
              let generatedLeaderboard = [];

              if (tournamentData.tournament_type === "clan_battle") {
                // For clan battle, show only winning team players
                const winningTeam = tournamentData.winning_team || "clan1"; // Default to clan1 if not specified
                generatedLeaderboard = generateClanBattleLeaderboard(
                  tournamentData,
                  validParticipants.map((p) => p.id),
                  winningTeam
                );
              } else {
                // For regular tournaments, show all players
                generatedLeaderboard = generateRegularLeaderboard(
                  tournamentData,
                  validParticipants.map((p) => p.id)
                );
              }

              setLeaderboard(generatedLeaderboard);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load tournament:", error);
        // Show not found state if API fails
        setTournament(null);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleJoinTournament = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.type !== "player") {
      alert("Only players can join tournaments!");
      return;
    }

    // Validate ticket selection for ticket-based entry
    if (paymentMethod === "tickets") {
      const entryFeeUsd = Number(tournament.entry_fee_usd || 0);
      let ticketType = selectedTicketType;

      // Auto-determine ticket type if not already selected
      if (!ticketType) {
        // Use Math.abs to handle floating point precision issues
        if (Math.abs(entryFeeUsd - 0.1) < 0.01) {
          ticketType = "ticket_010";
        } else if (Math.abs(entryFeeUsd - 1.0) < 0.01) {
          ticketType = "ticket_100";
        } else if (Math.abs(entryFeeUsd - 10.0) < 0.01) {
          ticketType = "ticket_1000";
        } else if (entryFeeUsd === 0 || !tournament.entry_fee) {
          // Free tournament - no ticket required
          ticketType = null;
        } else {
          alert("No matching ticket type found for this tournament entry fee!");
          return;
        }
      }

      // Check if user has the required ticket (only if ticket is required)
      if (ticketType) {
        const ticketCount = user?.tickets?.[ticketType] || 0;
        if (ticketCount === 0) {
          alert(
            `You don't have any ${
              ticketType === "ticket_010"
                ? "$0.10"
                : ticketType === "ticket_100"
                ? "$1.00"
                : "$10.00"
            } tickets!`
          );
          return;
        }
      }
    }

    // Check clan membership for clan battle tournaments
    if (tournament.tournament_type === "clan_battle") {
      if (tournament.clan_battle_mode === "clan_selection") {
        try {
          const userClans = await getUserClans(user.id);
          if (userClans.length === 0) {
            alert("You must be a member of a clan to join this tournament!");
            return;
          }

          const isEligibleClan = userClans.some(
            (clan) =>
              clan.id === tournament.clan1_id || clan.id === tournament.clan2_id
          );
          if (!isEligibleClan) {
            const clan1Name = clan1 ? clan1.name : "Unknown";
            const clan2Name = clan2 ? clan2.name : "Unknown";
            alert(
              `You can only join this tournament if you're a member of ${clan1Name} or ${clan2Name}!`
            );
            return;
          }
        } catch (error) {
          console.error("Error checking clan membership:", error);
          alert("Error checking clan membership. Please try again.");
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Determine final ticket type for payment
      let finalTicketType = selectedTicketType;
      if (paymentMethod === "tickets" && !finalTicketType) {
        const entryFeeUsd = Number(tournament.entry_fee_usd || 0);
        // Use Math.abs to handle floating point precision issues
        if (Math.abs(entryFeeUsd - 0.1) < 0.01) {
          finalTicketType = "ticket_010";
        } else if (Math.abs(entryFeeUsd - 1.0) < 0.01) {
          finalTicketType = "ticket_100";
        } else if (Math.abs(entryFeeUsd - 10.0) < 0.01) {
          finalTicketType = "ticket_1000";
        }
        // If no matching ticket type and entry fee is 0, it's free - no ticket needed
      }

      // Prepare payment data
      const paymentData = {
        payment_method: paymentMethod,
      };
      // Always include ticket type when using tickets (auto-selected)
      if (paymentMethod === "tickets" && finalTicketType) {
        paymentData.ticket_type = finalTicketType;
      }

      const updatedTournament = await tournamentsApi.join(
        tournament.id,
        user.id,
        paymentData
      );
      setTournament(updatedTournament);

      // Refresh user data from API to get updated diamond balance
      await refreshUser();

      const participantsList = await Promise.all(
        updatedTournament.participants.map((pId) => getUserById(pId))
      );
      const validParticipants = participantsList.filter(
        (p) => p !== null && p !== undefined && p.id
      );
      setParticipants(validParticipants);

      alert("Successfully joined the tournament! 🎉");
    } catch (error) {
      console.error("Failed to join tournament:", error);
      alert(
        error.message ||
          "Failed to join tournament. It may be full or you're already registered."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinners = async () => {
    // Validate
    const newErrors = {};

    if (!winners.first) {
      newErrors.first = "1st place winner is required";
    }
    if (!winners.second) {
      newErrors.second = "2nd place winner is required";
    }
    if (!winners.third) {
      newErrors.third = "3rd place winner is required";
    }

    // Check for duplicates
    if (winners.first && winners.second && winners.first === winners.second) {
      newErrors.duplicate = "Winners must be different players";
    }
    if (winners.first && winners.third && winners.first === winners.third) {
      newErrors.duplicate = "Winners must be different players";
    }
    if (winners.second && winners.third && winners.second === winners.third) {
      newErrors.duplicate = "Winners must be different players";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const updatedTournament = await tournamentsApi.declareWinners(
        tournament.id,
        winners,
        user.id
      );
      setTournament(updatedTournament);
      setShowWinnerModal(false);
      alert("Winners declared! Prizes have been distributed. 🏆");
    } catch (error) {
      console.error("Failed to declare winners:", error);
      alert(error.message || "Failed to declare winners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      const updatedTournament = await tournamentsApi.updateStatus(
        tournament.id,
        "ongoing"
      );
      setTournament(updatedTournament);
      alert("Tournament started! 🚀");
    } catch (error) {
      console.error("Failed to start tournament:", error);
      alert(error.message || "Failed to start tournament");
    }
  };

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-gray-400">Tournament not found</p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="secondary">Back to Tournaments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isHost = user && (tournament.host_id ?? tournament.hostId) === user.id;
  const isParticipant = user && tournament.participants.includes(user.id);

  // Check if tournament is still joinable
  const isTournamentJoinable = () => {
    const now = new Date();
    if (tournament.expires_at) {
      const expiresAt = new Date(tournament.expires_at);
      if (!isNaN(expiresAt.getTime())) {
        return now < expiresAt;
      }
    }
    // Fall back to status check if no valid expiration
    return tournament.status === "upcoming";
  };

  const canJoin =
    user &&
    user.type === "player" &&
    !isParticipant &&
    isTournamentJoinable() &&
    tournament.participants.length <
      (tournament.max_players ?? tournament.maxPlayers);

  const prizes = calculatePrizes(tournament);
  const participantOptions = participants
    .filter((p) => p && p.id) // Filter out null/undefined participants
    .map((p) => ({
      value: p.id,
      label: `${p.avatar} ${p.username}`,
    }));

  // Tab render functions
  function renderOverviewTab() {
    return (
      <div className="space-y-8">
        {/* Prize Distribution - Regular Tournaments */}
        {(tournament.tournament_type ?? tournament.tournamentType) !==
          "clan_battle" && (
          <Card>
            <h2 className="text-2xl font-bold text-gold mb-4">
              💎 Prize Distribution
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-dark-secondary rounded-lg border border-gold/30">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🥇</span>
                  <div>
                    <p className="text-white font-bold">1st Place</p>
                    <p className="text-gray-400 text-sm">
                      {tournament.prize_split_first ??
                        tournament.prizeSplit?.first}
                      % of prize pool
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-xl">
                    ${Math.floor(prizes.first / 100).toLocaleString()} USD
                  </p>
                  <p className="text-gold text-sm">
                    ({prizes.first.toLocaleString()} 💎)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-dark-secondary rounded-lg border border-gold-dark/20">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🥈</span>
                  <div>
                    <p className="text-white font-bold">2nd Place</p>
                    <p className="text-gray-400 text-sm">
                      {tournament.prize_split_second ??
                        tournament.prizeSplit?.second}
                      % of prize pool
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-xl">
                    ${Math.floor(prizes.second / 100).toLocaleString()} USD
                  </p>
                  <p className="text-gold text-sm">
                    ({prizes.second.toLocaleString()} 💎)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-dark-secondary rounded-lg border border-gold-dark/20">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🥉</span>
                  <div>
                    <p className="text-white font-bold">3rd Place</p>
                    <p className="text-gray-400 text-sm">
                      {tournament.prize_split_third ??
                        tournament.prizeSplit?.third}
                      % of prize pool
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-xl">
                    ${Math.floor(prizes.third / 100).toLocaleString()} USD
                  </p>
                  <p className="text-gold text-sm">
                    ({prizes.third.toLocaleString()} 💎)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Clan Battle Prize Distribution */}
        {(tournament.tournament_type ?? tournament.tournamentType) ===
          "clan_battle" && (
          <Card>
            <div>
              <h3 className="text-gold font-bold text-lg mb-4 flex items-center gap-2">
                🏆 Clan Battle Prize Distribution
              </h3>

              {prizeDistribution ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        🥇 Top Performers (20%)
                      </h4>
                      <div className="space-y-2">
                        {prizeDistribution.topPerformers.map(
                          (performer, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-dark-primary/50 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {index === 0
                                    ? "🥇"
                                    : index === 1
                                    ? "🥈"
                                    : "🥉"}
                                </span>
                                <div>
                                  <p className="text-white font-medium">
                                    {performer.position}
                                    {performer.position === 1
                                      ? "st"
                                      : performer.position === 2
                                      ? "nd"
                                      : "rd"}{" "}
                                    Place
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {performer.percentage}% of total
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-gold font-bold text-lg">
                                  {formatPrizeWithDiamonds(performer.prize)}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        👥 Team Members (80%)
                      </h4>
                      <div className="bg-dark-primary/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {prizeDistribution.remainingMembers.count} Members
                          </span>
                          <span className="text-gold font-bold text-lg">
                            {formatPrizeWithDiamonds(
                              prizeDistribution.remainingMembers.individualPrize
                            )}{" "}
                            each
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Equal distribution of 80% total prize pool
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Total for team members:
                            </span>
                            <span className="text-gold font-semibold">
                              {formatPrizeWithDiamonds(
                                prizeDistribution.remainingMembers.totalPrize
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-gold-dark/30">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        Total Prize Pool:
                      </span>
                      <span className="text-gold font-bold text-xl">
                        {formatPrizeWithDiamonds(prizeDistribution.totalPrize)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Winning team receives 100% of the prize pool
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-gray-300 text-lg mb-2">
                    Prize Distribution Loading
                  </p>
                  <p className="text-gray-400">
                    Prize distribution details will be available once tournament
                    data is loaded.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Clan Battle Details Card */}
        {(tournament.tournament_type ?? tournament.tournamentType) ===
          "clan_battle" && (
          <Card>
            <h2 className="text-2xl font-bold text-gold mb-4 flex items-center gap-2">
              ⚔️ Clan Battle Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Battle Mode</p>
                <p className="text-white font-medium text-lg">
                  {(tournament.clan_battle_mode ??
                    tournament.clanBattleMode) === "auto_division"
                    ? "🎯 Auto-Division"
                    : "👥 Clan Selection"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {(tournament.clan_battle_mode ??
                    tournament.clanBattleMode) === "auto_division"
                    ? "Players will be automatically divided into 2 balanced teams of 30 each"
                    : "Host has selected specific clans to compete against each other"}
                </p>
              </div>

              {(tournament.clan_battle_mode ?? tournament.clanBattleMode) ===
                "clan_selection" && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Competing Clans</p>
                  <div className="space-y-3">
                    {clan1 && (
                      <div className="flex items-center gap-3 p-3 bg-dark-secondary rounded-lg border border-gold-dark/30">
                        <span className="text-2xl">{clan1.emblem}</span>
                        <div>
                          <p className="text-white font-medium">
                            {clan1.name} [{clan1.tag}]
                          </p>
                          <p className="text-gray-400 text-sm">
                            {clan1.description}
                          </p>
                          <p className="text-gold text-xs">
                            Level {clan1.level} • {clan1.wins}W-{clan1.losses}L
                          </p>
                        </div>
                      </div>
                    )}
                    {clan2 && (
                      <div className="flex items-center gap-3 p-3 bg-dark-secondary rounded-lg border border-gold-dark/30">
                        <span className="text-2xl">{clan2.emblem}</span>
                        <div>
                          <p className="text-white font-medium">
                            {clan2.name} [{clan2.tag}]
                          </p>
                          <p className="text-gray-400 text-sm">
                            {clan2.description}
                          </p>
                          <p className="text-gold text-xs">
                            Level {clan2.level} • {clan2.wins}W-{clan2.losses}L
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Team Structure</p>
                <p className="text-white">
                  {(tournament.clan_battle_mode ??
                    tournament.clanBattleMode) === "auto_division"
                    ? `Up to ${
                        tournament.max_players ?? tournament.maxPlayers
                      } players will be divided into 2 teams of ${Math.floor(
                        (tournament.max_players ?? tournament.maxPlayers) / 2
                      )} each`
                    : `Each clan can have up to ${
                        tournament.max_players ?? tournament.maxPlayers
                      } players (${
                        (tournament.max_players ?? tournament.maxPlayers) * 2
                      } total max)`}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  function renderMatchesTab() {
    // Use static matches data from JSON file
    const staticMatches = matchesData.matches;

    // Filter matches based on selected filter
    const filteredMatches = staticMatches.filter((match) => {
      if (matchFilter === "all") return true;
      if (matchFilter === "ongoing") return match.status === "ongoing";
      if (matchFilter === "completed") return match.status === "completed";
      return true;
    });

    // Set the first match as selected by default if none is selected
    if (!selectedMatch && filteredMatches.length > 0) {
      setSelectedMatch(filteredMatches[0]);
    }

    // Calculate counts for each filter
    const allCount = staticMatches.length;
    const ongoingCount = staticMatches.filter(
      (m) => m.status === "ongoing"
    ).length;
    const completedCount = staticMatches.filter(
      (m) => m.status === "completed"
    ).length;

    return (
      <div className="space-y-8">
        {/* Past Matches Section - Two Column Layout */}
        {staticMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side - Match List */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gold-gradient">
                    🎮 Matches
                  </h3>
                  <div className="bg-gold/20 px-3 py-1 rounded-full">
                    <span className="text-gold font-semibold text-sm">
                      {filteredMatches.length} of {staticMatches.length}
                    </span>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setMatchFilter("all")}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      matchFilter === "all"
                        ? "bg-gold text-dark-primary shadow-lg shadow-gold/30"
                        : "bg-dark-secondary text-gray-400 hover:bg-dark-secondary/70 hover:text-white border border-gold-dark/20"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      All
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          matchFilter === "all"
                            ? "bg-dark-primary/30 text-dark-primary"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {allCount}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setMatchFilter("ongoing")}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      matchFilter === "ongoing"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-dark-secondary text-gray-400 hover:bg-dark-secondary/70 hover:text-white border border-gold-dark/20"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Ongoing
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          matchFilter === "ongoing"
                            ? "bg-white/20 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {ongoingCount}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setMatchFilter("completed")}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      matchFilter === "completed"
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-dark-secondary text-gray-400 hover:bg-dark-secondary/70 hover:text-white border border-gold-dark/20"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Completed
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          matchFilter === "completed"
                            ? "bg-white/20 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {completedCount}
                      </span>
                    </span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        No{" "}
                        {matchFilter === "ongoing"
                          ? "Ongoing"
                          : matchFilter === "completed"
                          ? "Completed"
                          : ""}{" "}
                        Matches
                      </h3>
                      <p className="text-gray-400">
                        {matchFilter === "ongoing"
                          ? "There are no ongoing matches at the moment."
                          : matchFilter === "completed"
                          ? "No completed matches found."
                          : "No matches available yet."}
                      </p>
                    </div>
                  ) : (
                    filteredMatches.map((match, index) => (
                      <button
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`w-full text-left relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedMatch?.id === match.id
                            ? "ring-2 ring-gold shadow-lg shadow-gold/30"
                            : "hover:shadow-xl"
                        }`}
                      >
                        {/* Background gradient */}
                        <div
                          className={`absolute inset-0 ${
                            selectedMatch?.id === match.id
                              ? "bg-gradient-to-br from-gold/20 via-gold/10 to-transparent"
                              : "bg-gradient-to-br from-dark-card via-dark-secondary to-dark-card"
                          }`}
                        />

                        {/* Content */}
                        <div className="relative p-4">
                          {/* Match number badge */}
                          <div className="absolute top-3 right-3">
                            <div className="bg-gold/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-gold/30">
                              <span className="text-gold font-bold text-xs">
                                #{index + 1}
                              </span>
                            </div>
                          </div>

                          {/* Match title */}
                          <h4
                            className={`font-bold mb-3 pr-12 ${
                              selectedMatch?.id === match.id
                                ? "text-gold text-lg"
                                : "text-white text-base"
                            }`}
                          >
                            {match.title}
                          </h4>

                          {/* Match info grid */}
                          <div className="space-y-2">
                            {/* Date and time */}
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="flex items-center space-x-1 text-gray-400">
                                <span>📅</span>
                                <span className="font-medium">
                                  {match.date}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>⏰</span>
                              <span>
                                {match.startTime} - {match.endTime}
                              </span>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-blue-400">👥</span>
                                  <span className="text-blue-300 font-semibold text-sm">
                                    {match.participants}
                                  </span>
                                </div>
                                <div
                                  className={`px-2 py-1 rounded-md text-xs font-bold ${
                                    match.status === "ongoing"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : match.status === "completed"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-gray-700/50 text-gray-400"
                                  }`}
                                >
                                  {match.status?.toUpperCase() || "COMPLETED"}
                                </div>
                              </div>

                              {/* Prize pool */}
                              <div className="flex items-center space-x-1">
                                <span className="text-gold text-lg">💎</span>
                                <span className="text-gold font-bold text-sm">
                                  {match.prizePool.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selected indicator */}
                          {selectedMatch?.id === match.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-yellow-400 to-gold" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Right Side - Match Leaderboard */}
            <div className="lg:col-span-3">
              {selectedMatch ? (
                <Card glass>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gold-gradient mb-2">
                      {selectedMatch.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>📅 {selectedMatch.date}</span>
                      <span>
                        ⏰ {selectedMatch.startTime} - {selectedMatch.endTime}
                      </span>
                      <span className="text-gold font-semibold">
                        💰 {selectedMatch.prizePool.toLocaleString()} 💎
                      </span>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-4">
                    🏆 Match Results
                  </h4>
                  <div className="space-y-3">
                    {selectedMatch.leaderboard.map((entry) => (
                      <div
                        key={entry.playerId}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          entry.position === 1
                            ? "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/50"
                            : entry.position === 2
                            ? "bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/50"
                            : entry.position === 3
                            ? "bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-orange-400/50"
                            : "bg-dark-secondary/50 border-gray-600/30"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gold min-w-[3rem]">
                              {entry.position === 1 ? (
                                "🥇"
                              ) : entry.position === 2 ? (
                                "🥈"
                              ) : entry.position === 3 ? (
                                "🥉"
                              ) : (
                                <span className="text-sm">
                                  #{entry.position}
                                </span>
                              )}
                            </span>
                            <div className="text-3xl">{entry.avatar}</div>
                          </div>
                          <div>
                            <p className="text-white font-bold text-base">
                              {entry.username}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Score: {entry.score.toLocaleString()}</span>
                              <span>Kills: {entry.kills}</span>
                              <span>K/D: {entry.kdRatio}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.prizeAmount > 0 && (
                            <div className="bg-gold/20 px-4 py-2 rounded-lg border border-gold/40">
                              <p className="text-gold font-bold text-base">
                                +${(entry.prizeAmount / 100).toLocaleString()}{" "}
                                USD
                              </p>
                              <p className="text-gold/80 text-xs">Prize Won</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-gray-400">
                      Select a match to view the leaderboard
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏁</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Matches Available
              </h3>
              <p className="text-gray-400">
                Matches will be available once participants join the tournament.
              </p>
            </div>
          </Card>
        )}

        {/* Additional section for overall tournament stats if needed */}
      </div>
    );
  }

  function renderParticipantsTab() {
    return (
      <Card>
        <h2 className="text-xl font-bold text-gold mb-4">
          👥 Participants ({participants.length}/
          {tournament.max_players ?? tournament.maxPlayers})
        </h2>
        {participants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-400 text-lg">No participants yet</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants
              .filter((participant) => participant && participant.id)
              .map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3 p-4 bg-dark-secondary rounded-lg border border-gold-dark/20 hover:border-gold/50 transition-colors"
                >
                  <span className="text-gray-400 text-sm font-medium min-w-[2rem]">
                    #{index + 1}
                  </span>
                  <span className="text-3xl">{participant.avatar}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {participant.username}
                    </p>
                    {participant.rank && (
                      <p className="text-gray-400 text-sm">
                        {participant.rank} Rank
                      </p>
                    )}
                  </div>
                  {participant.id ===
                    (tournament.host_id ?? tournament.hostId) && (
                    <Badge variant="primary" size="sm">
                      Host
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        )}
      </Card>
    );
  }

  function renderRulesTab() {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-gold mb-6">
          📜 Tournament Rules
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">
            {tournament.rules}
          </p>
        </div>
      </Card>
    );
  }

  // Define tab content
  const tabs = [
    {
      id: "prize-distribution",
      label: "📊 Prize Distribution",
      content: renderOverviewTab(),
    },
    {
      id: "matches",
      label: "🎮 Matches",
      badge: tournament.status === "completed" ? leaderboard.length : null,
      content: renderMatchesTab(),
    },
    {
      id: "participants",
      label: "👥 Participants",
      // badge: participants.length,
      content: renderParticipantsTab(),
    },
    {
      id: "rules",
      label: "📜 Rules",
      content: renderRulesTab(),
    },
    {
      id: "stream",
      label: "📺 Stream",
      content: <div>Stream</div>,
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #d4af37, #aa8c2c);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #f0c14b, #d4af37);
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm">
            ← Back to Tournaments
          </Button>
        </Link>

        {/* Tournament Header */}
        <Card glass className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {(() => {
                const icon = getTournamentIcon(tournament);
                const isImageUrl =
                  typeof icon === "string" && icon.startsWith("http");

                if (isImageUrl) {
                  return (
                    <div className="flex-shrink-0">
                      <Image
                        src={icon}
                        alt={`${tournament.title} icon`}
                        width={96}
                        height={96}
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                        unoptimized
                      />
                    </div>
                  );
                }

                return <div className="text-6xl">{icon}</div>;
              })()}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gold-gradient mb-2">
                    {tournament.title}
                  </h1>
                  <Badge
                    variant={tournament.status}
                    size="lg"
                    className="capitalize"
                  >
                    {tournament.status}
                  </Badge>
                </div>
                {!tournament.is_automated && (
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-gray-400 text-lg">{tournament.game}</p>
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "clan_battle" && (
                      <Badge variant="warning" size="md">
                        ⚔️ Clan Battle
                      </Badge>
                    )}
                  </div>
                )}
                {/* Countdown Timer Section */}
                {(tournament.status === "upcoming" ||
                  tournament.status === "ongoing") && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Countdown Timer for Upcoming Automated Tournaments */}
                    {tournament.status === "upcoming" &&
                      (tournament.is_automated === true ||
                        tournament.is_automated === "true") &&
                      tournament.expires_at && (
                        <>
                          <div className="lg:col-span-2 p-0.5 rounded-lg border-2 border-gold/40 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent">
                            <CountdownTimer
                              expiresAt={tournament.expires_at}
                              label="Join before"
                              style="minimal"
                            />
                          </div>
                        </>
                      )}

                    {/* Countdown Timer for Upcoming Non-Automated Tournaments (Events) */}
                    {tournament.status === "upcoming" &&
                      !(
                        tournament.is_automated === true ||
                        tournament.is_automated === "true"
                      ) &&
                      tournament.expires_at && (
                        <>
                          <div className="lg:col-span-2 p-0.5 rounded-lg border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent">
                            <CountdownTimer
                              expiresAt={tournament.expires_at}
                              label="Starts in"
                              style="minimal"
                            />
                          </div>
                        </>
                      )}

                    {/* Countdown Timer for Ongoing Automated Tournaments */}
                    {tournament.status === "ongoing" &&
                      (tournament.is_automated === true ||
                        tournament.is_automated === "true") &&
                      tournament.expires_at && (
                        <>
                          <div className="lg:col-span-2 p-0.5 rounded-lg border-2 border-green-500/40 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent">
                            <CountdownTimer
                              expiresAt={tournament.expires_at}
                              label="Join before"
                              style="minimal"
                            />
                          </div>
                        </>
                      )}

                    {/* Countdown Timer for Ongoing Events (non-automated with expiration) */}
                    {tournament.status === "ongoing" &&
                      !(
                        tournament.is_automated === true ||
                        tournament.is_automated === "true"
                      ) &&
                      tournament.expires_at && (
                        <>
                          <div className="lg:col-span-2 p-0.5 rounded-lg border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent">
                            <CountdownTimer
                              expiresAt={tournament.expires_at}
                              label="Ends in"
                              style="minimal"
                            />
                          </div>
                        </>
                      )}

                    {/* Show Tournament Started for Ongoing Non-Automated (only if no date/time for countdown) */}
                    {tournament.status === "ongoing" &&
                      !(
                        tournament.is_automated === true ||
                        tournament.is_automated === "true"
                      ) &&
                      !tournament.expires_at && (
                        <div className="lg:col-span-3 flex items-start gap-2 p-0.5 rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent">
                          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-red-500/20 flex items-center justify-center text-lg">
                            ⏰
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                              Status
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
                              <p className="text-red-400 font-semibold text-sm">
                                Tournament Started
                              </p>
                            </div>
                            <p className="text-gray-300 text-xs mt-1">
                              Matches are underway • New entries are closed
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Always Visible */}
            <div className="flex flex-col gap-2">
              {/* Clan Information for Join Button */}
              {canJoin && tournament.tournament_type === "clan_battle" && (
                <div className="mb-4 p-3 bg-dark-secondary rounded-lg border border-gold-dark/30">
                  {tournament.clan_battle_mode === "clan_selection" ? (
                    <div>
                      <p className="text-gold text-sm font-medium mb-2">
                        🏰 Clan Battle - Selected Clans
                      </p>
                      <div className="space-y-1">
                        {clan1 && (
                          <p className="text-white text-sm">
                            {clan1.emblem}{" "}
                            <span className="font-medium">
                              {clan1.name} [{clan1.tag}]
                            </span>
                          </p>
                        )}
                        {clan2 && (
                          <p className="text-white text-sm">
                            {clan2.emblem}{" "}
                            <span className="font-medium">
                              {clan2.name} [{clan2.tag}]
                            </span>
                          </p>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">
                        Only members of these clans can join this tournament
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gold text-sm font-medium mb-1">
                        🎯 Auto-Division Clan Battle
                      </p>
                      <p className="text-gray-400 text-xs">
                        Players will be automatically divided into 2 balanced
                        teams
                      </p>
                    </div>
                  )}
                </div>
              )}

              {canJoin && (
                <div className="space-y-4">
                  {/* Payment Method Selector - Hide for automated tournaments */}
                  {tournament.entry_fee > 0 &&
                    !(
                      tournament.is_automated === true ||
                      tournament.is_automated === "true"
                    ) && (
                      <div className="bg-dark-card border border-gold-dark/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">
                          Select Payment Method
                        </h4>
                        {/* Show info message for tournaments */}
                        {tournament.display_type === "tournament" && (
                          <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-sm text-blue-300">
                              ⚡ Tournaments can only be joined using tickets
                            </p>
                          </div>
                        )}
                        <div
                          className={`grid grid-cols-1 gap-3 ${
                            tournament.display_type === "tournament"
                              ? "md:grid-cols-1"
                              : "md:grid-cols-3"
                          }`}
                        >
                          {/* Diamonds Option - Only for Events */}
                          {tournament.display_type === "event" && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("diamonds")}
                              className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                                paymentMethod === "diamonds"
                                  ? "border-gold bg-gold/10"
                                  : "border-gold-dark/30 hover:border-gold/50"
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-2xl">💎</span>
                                <p className="text-white font-bold">Diamonds</p>
                              </div>
                              <p className="text-gray-400 text-sm">
                                {getEntryFeeDisplayDual(tournament).diamonds} 💎
                              </p>
                              {user && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Balance: {user.diamonds || 0} 💎
                                </p>
                              )}
                            </button>
                          )}

                          {/* USD Option - Only for Events */}
                          {tournament.display_type === "event" && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("usd")}
                              className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                                paymentMethod === "usd"
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-green-500/30 hover:border-green-500/50"
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-2xl">💵</span>
                                <p className="text-white font-bold">USD</p>
                              </div>
                              <p className="text-gray-400 text-sm">
                                ${getEntryFeeDisplayDual(tournament).usd}
                              </p>
                              {user && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Balance: $
                                  {Number(user.usd_balance || 0).toFixed(2)}
                                </p>
                              )}
                            </button>
                          )}

                          {/* Tickets Option - Required for Tournaments, Optional for Events */}
                          {(tournament.display_type === "tournament" ||
                            tournament.accepts_tickets) && (
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("tickets")}
                              className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                                paymentMethod === "tickets"
                                  ? "border-purple-500 bg-purple-500/10"
                                  : "border-purple-500/30 hover:border-purple-500/50"
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-2xl">🎫</span>
                                <p className="text-white font-bold">Tickets</p>
                              </div>
                              <p className="text-gray-400 text-sm">
                                $
                                {Number(tournament.entry_fee_usd || 0).toFixed(
                                  2
                                )}{" "}
                                ticket
                              </p>
                              {user && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Total:{" "}
                                  {(user.tickets?.ticket_010 || 0) +
                                    (user.tickets?.ticket_100 || 0) +
                                    (user.tickets?.ticket_1000 || 0)}{" "}
                                  🎫
                                </p>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  <Button
                    variant="primary"
                    onClick={handleJoinTournament}
                    disabled={loading}
                  >
                    {tournament.entry_fee
                      ? `Join Tournament (Pay with ${
                          paymentMethod === "diamonds"
                            ? "💎 Diamonds"
                            : paymentMethod === "usd"
                            ? "💵 USD"
                            : "🎫 Tickets"
                        })`
                      : "Join Tournament (Free)"}
                  </Button>
                </div>
              )}

              {isHost && tournament.status === "upcoming" && (
                <Button variant="primary" onClick={handleStartTournament}>
                  Start Tournament
                </Button>
              )}

              {isHost && tournament.status === "ongoing" && (
                <Button
                  variant="primary"
                  onClick={() => setShowWinnerModal(true)}
                >
                  Declare Winners
                </Button>
              )}

              {isParticipant && (
                <Badge variant="success">You are Registered ✓</Badge>
              )}
            </div>
          </div>
          <div className="border-t border-gold-dark/30 pt-4 mt-4">
            {/* <h2 className="text-xl font-bold text-gold mb-3">
              Tournament Information
            </h2> */}

            {/* Main Info Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
              {/* Schedule Card */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-gold-dark/30 bg-gradient-to-br from-dark-secondary/60 to-dark-secondary/30 hover:border-gold/50 transition-all">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center text-lg">
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Schedule
                  </p>
                  <p className="text-white font-semibold text-sm leading-tight">
                    {formatDate(tournament.date)}
                  </p>
                  <p className="text-gray-300 text-xs">{tournament.time}</p>
                </div>
              </div>

              {/* Players Card */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-gold-dark/30 bg-gradient-to-br from-dark-secondary/60 to-dark-secondary/30 hover:border-gold/50 transition-all">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center text-lg">
                  👥
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Players
                  </p>
                  <p className="text-white font-semibold text-base">
                    {tournament.participants.length}
                    <span className="text-gray-400 text-sm font-normal">
                      /{tournament.max_players ?? tournament.maxPlayers}
                    </span>
                  </p>
                  <p className="text-gray-300 text-xs">
                    {(tournament.max_players ?? tournament.maxPlayers) -
                      tournament.participants.length >
                    0
                      ? `${
                          (tournament.max_players ?? tournament.maxPlayers) -
                          tournament.participants.length
                        } left`
                      : "Full"}
                  </p>
                </div>
              </div>

              {/* Entry Fee Card */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-gold-dark/30 bg-gradient-to-br from-dark-secondary/60 to-dark-secondary/30 hover:border-gold/50 transition-all">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center text-lg">
                  💰
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Entry Fee
                  </p>
                  {tournament.entry_fee ? (
                    <>
                      <p className="text-white font-semibold text-base">
                        ${getEntryFeeDisplayDual(tournament).usd}
                      </p>
                      <p className="text-gold text-xs">
                        {getEntryFeeDisplayDual(tournament).diamonds} 💎
                      </p>
                    </>
                  ) : (
                    <p className="text-green-400 font-semibold text-base">
                      Free
                    </p>
                  )}
                </div>
              </div>

              {/* Tournament Type Card */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-gold-dark/30 bg-gradient-to-br from-dark-secondary/60 to-dark-secondary/30 hover:border-gold/50 transition-all">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-orange-500/20 flex items-center justify-center text-lg">
                  {(tournament.tournament_type ?? tournament.tournamentType) ===
                  "clan_battle"
                    ? "⚔️"
                    : "🎮"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Type
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {(tournament.tournament_type ??
                      tournament.tournamentType) === "clan_battle"
                      ? "Clan Battle"
                      : "Regular"}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {tournament.min_rank
                      ? `Rank ${tournament.min_rank}`
                      : "Any Rank"}
                  </p>
                </div>
              </div>

              {/* Prize Pool Card - Highlighted */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border-2 border-gold/40 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent hover:border-gold/60 transition-all shadow-md shadow-gold/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gold/30 flex items-center justify-center text-lg">
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gold/80 text-xs uppercase tracking-wider mb-1 font-semibold">
                    Prize Pool
                  </p>
                  <p className="text-gold font-bold text-base">
                    ${getPrizePoolDisplayDual(tournament).usd}
                  </p>
                  <p className="text-gold/90 text-sm">
                    {getPrizePoolDisplayDual(tournament).diamonds} 💎
                  </p>
                  {(tournament.prize_pool_type ?? tournament.prizePoolType) ===
                    "entry-based" && (
                    <p className="text-gold/70 text-xs italic">Entry-based</p>
                  )}
                </div>
              </div>
            </div>

            {/* Clan Battle Details */}
            {(tournament.tournament_type ?? tournament.tournamentType) ===
              "clan_battle" && (
              <div className="mb-3 p-3 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center text-base">
                    ⚔️
                  </div>
                  <h3 className="text-white font-bold text-base">
                    Clan Battle Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-md bg-dark-secondary/50 border border-purple-500/20">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      Battle Mode
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {(tournament.clan_battle_mode ??
                        tournament.clanBattleMode) === "auto_division"
                        ? "Auto-Division"
                        : "Clan Selection"}
                    </p>
                  </div>
                  {(tournament.clan_battle_mode ??
                    tournament.clanBattleMode) === "clan_selection" && (
                    <>
                      <div className="p-2.5 rounded-md bg-dark-secondary/50 border border-purple-500/20">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                          Clan 1
                        </p>
                        <p className="text-white font-semibold text-sm">
                          {clan1
                            ? `${clan1.emblem} ${clan1.name} [${clan1.tag}]`
                            : "Not specified"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-md bg-dark-secondary/50 border border-purple-500/20">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                          Clan 2
                        </p>
                        <p className="text-white font-semibold text-sm">
                          {clan2
                            ? `${clan2.emblem} ${clan2.name} [${clan2.tag}]`
                            : "Not specified"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Tabbed Content */}
        <Tabs tabs={tabs} defaultTab="prize-distribution" variant="underline" />

        {/* Winner Declaration Modal */}
        {showWinnerModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gold-gradient mb-6">
                🏆 Declare Winners
              </h2>

              <div className="space-y-4 mb-6">
                <Select
                  label="🥇 1st Place"
                  name="first"
                  value={winners.first}
                  onChange={(e) =>
                    setWinners({ ...winners, first: e.target.value })
                  }
                  options={participantOptions}
                  placeholder="Select winner"
                  error={errors.first}
                  required
                />
                <Select
                  label="🥈 2nd Place"
                  name="second"
                  value={winners.second}
                  onChange={(e) =>
                    setWinners({ ...winners, second: e.target.value })
                  }
                  options={participantOptions}
                  placeholder="Select winner"
                  error={errors.second}
                  required
                />
                <Select
                  label="🥉 3rd Place"
                  name="third"
                  value={winners.third}
                  onChange={(e) =>
                    setWinners({ ...winners, third: e.target.value })
                  }
                  options={participantOptions}
                  placeholder="Select winner"
                  error={errors.third}
                  required
                />
              </div>

              {errors.duplicate && (
                <p className="text-red-400 text-sm mb-4">{errors.duplicate}</p>
              )}

              <div className="bg-dark-secondary p-4 rounded-lg mb-6">
                <p className="text-gray-400 text-sm mb-2">
                  Prize Distribution:
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-white">
                    🥇 1st: {prizes.first.toLocaleString()} 💎
                  </p>
                  <p className="text-white">
                    🥈 2nd: {prizes.second.toLocaleString()} 💎
                  </p>
                  <p className="text-white">
                    🥉 3rd: {prizes.third.toLocaleString()} 💎
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowWinnerModal(false);
                    setErrors({});
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDeclareWinners}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Declare Winners"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
