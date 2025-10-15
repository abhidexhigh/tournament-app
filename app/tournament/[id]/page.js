"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Select from "../../components/Select";
import CountdownTimer from "../../components/CountdownTimer";
import { getCurrentUser } from "../../lib/auth";
import {
  calculateActualPrizePool,
  calculatePrizes,
  getPrizePoolDisplay,
} from "../../lib/prizeCalculator";
import { tournamentsApi } from "../../lib/api";
import { getTournamentIcon } from "../../lib/iconSelector";
import { getUserById } from "../../lib/auth";
import { refreshUserFromAPI } from "../../lib/authHelpers";
import { useUser } from "../../contexts/UserContext";

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentData = await tournamentsApi.getById(params.id);
        setTournament(tournamentData);

        if (tournamentData) {
          // Load participants
          const participantsList = tournamentData.participants.map((pId) =>
            getUserById(pId)
          );
          setParticipants(participantsList.filter((p) => p !== null));
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

    setLoading(true);

    try {
      const updatedTournament = await tournamentsApi.join(
        tournament.id,
        user.id
      );
      setTournament(updatedTournament);

      // Refresh user data from API to get updated diamond balance
      await refreshUser();

      const participantsList = updatedTournament.participants.map((pId) =>
        getUserById(pId)
      );
      setParticipants(participantsList.filter((p) => p !== null));

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
  const canJoin =
    user &&
    user.type === "player" &&
    !isParticipant &&
    tournament.status === "upcoming" &&
    tournament.participants.length <
      (tournament.max_players ?? tournament.maxPlayers);

  const prizes = calculatePrizes(tournament);
  const participantOptions = participants.map((p) => ({
    value: p.id,
    label: `${p.avatar} ${p.username}`,
  }));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm">
            ← Back to Tournaments
          </Button>
        </Link>

        {/* Tournament Header */}
        <Card glass className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-6xl">{getTournamentIcon(tournament)}</div>
              <div>
                <h1 className="text-4xl font-bold text-gold-gradient mb-2">
                  {tournament.title}
                </h1>
                <p className="text-gray-400 text-lg mb-3">{tournament.game}</p>
                <Badge
                  variant={tournament.status}
                  size="lg"
                  className="capitalize"
                >
                  {tournament.status}
                </Badge>

                {/* Countdown Timer for Upcoming Tournaments */}
                {tournament.status === "upcoming" && (
                  <div className="mt-4 p-4 bg-dark-secondary rounded-lg border border-gold-dark/30">
                    <CountdownTimer
                      date={tournament.date}
                      time={tournament.time}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {canJoin && (
                <Button
                  variant="primary"
                  onClick={handleJoinTournament}
                  disabled={loading}
                >
                  {tournament.entry_fee
                    ? `Join Tournament (${tournament.entry_fee} 💎)`
                    : "Join Tournament (Free)"}
                </Button>
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

          {/* Tournament Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">📅 Date</p>
              <p className="text-white font-medium">
                {formatDate(tournament.date)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">⏰ Time</p>
              <p className="text-white font-medium">{tournament.time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">👥 Players</p>
              <p className="text-white font-medium">
                {tournament.participants.length} /{" "}
                {tournament.max_players ?? tournament.maxPlayers}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">💰 Entry Fee</p>
              <p className="text-white font-medium">
                {tournament.entry_fee ? `${tournament.entry_fee} 💎` : "Free"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">💎 Prize Pool</p>
              <p className="text-gold font-bold text-lg">
                {getPrizePoolDisplay(tournament)}
              </p>
              {(tournament.prize_pool_type ?? tournament.prizePoolType) ===
                "entry-based" && (
                <p className="text-xs text-gray-500 mt-1">
                  Entry-based • Scales with participants
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prize Distribution */}
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
                  <p className="text-gold font-bold text-xl">
                    {prizes.first.toLocaleString()} 💎
                  </p>
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
                  <p className="text-gold font-bold text-xl">
                    {prizes.second.toLocaleString()} 💎
                  </p>
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
                  <p className="text-gold font-bold text-xl">
                    {prizes.third.toLocaleString()} 💎
                  </p>
                </div>
              </div>
            </Card>

            {/* Tournament Rules */}
            <Card>
              <h2 className="text-2xl font-bold text-gold mb-4">📜 Rules</h2>
              <p className="text-gray-300 whitespace-pre-wrap">
                {tournament.rules}
              </p>
            </Card>

            {/* Winners (if completed) */}
            {tournament.status === "completed" && tournament.winners && (
              <Card glass>
                <h2 className="text-2xl font-bold text-gold-gradient mb-6">
                  🏆 Tournament Winners
                </h2>
                <div className="space-y-4">
                  {tournament.winners.first && (
                    <div className="flex items-center justify-between p-4 bg-gold/10 rounded-lg border-2 border-gold">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">🥇</span>
                        <div>
                          <p className="text-gold font-bold text-lg">
                            1st Place
                          </p>
                          <p className="text-white">
                            {getUserById(tournament.winners.first)?.avatar}{" "}
                            {getUserById(tournament.winners.first)?.username}
                          </p>
                        </div>
                      </div>
                      <p className="text-gold font-bold text-xl">
                        +{prizes.first.toLocaleString()} 💎
                      </p>
                    </div>
                  )}
                  {tournament.winners.second && (
                    <div className="flex items-center justify-between p-4 bg-gray-500/10 rounded-lg border border-gray-500/30">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">🥈</span>
                        <div>
                          <p className="text-gray-300 font-bold">2nd Place</p>
                          <p className="text-white">
                            {getUserById(tournament.winners.second)?.avatar}{" "}
                            {getUserById(tournament.winners.second)?.username}
                          </p>
                        </div>
                      </div>
                      <p className="text-gold font-bold text-xl">
                        +{prizes.second.toLocaleString()} 💎
                      </p>
                    </div>
                  )}
                  {tournament.winners.third && (
                    <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">🥉</span>
                        <div>
                          <p className="text-orange-300 font-bold">3rd Place</p>
                          <p className="text-white">
                            {getUserById(tournament.winners.third)?.avatar}{" "}
                            {getUserById(tournament.winners.third)?.username}
                          </p>
                        </div>
                      </div>
                      <p className="text-gold font-bold text-xl">
                        +{prizes.third.toLocaleString()} 💎
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Participants */}
          <div>
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gold mb-4">
                👥 Participants ({participants.length}/
                {tournament.max_players ?? tournament.maxPlayers})
              </h2>
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No participants yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Be the first to join!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-3 p-3 bg-dark-secondary rounded-lg"
                    >
                      <span className="text-gray-400 text-sm w-6">
                        #{index + 1}
                      </span>
                      <span className="text-2xl">{participant.avatar}</span>
                      <span className="text-white font-medium flex-1">
                        {participant.username}
                      </span>
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
          </div>
        </div>

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
