"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import Card from "../../components/Card";
import { tournamentsApi } from "../../lib/api";
import { selectTournamentIcon } from "../../lib/iconSelector";
import { useUser } from "../../contexts/UserContext";

function CreateTournamentContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    game: "Force of Rune", // Fixed game name
    date: "",
    time: "",
    maxPlayers: "",
    prizePoolType: "fixed", // "fixed" or "entry-based"
    prizePool: "",
    prizeSplitFirst: 50,
    prizeSplitSecond: 30,
    prizeSplitThird: 20,
    entryFee: 0, // Entry fee for players
    rules: "",
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-adjust prize split if one changes
    if (name === "prizeSplitFirst") {
      const first = parseInt(value) || 0;
      const remaining = 100 - first;
      setFormData((prev) => ({
        ...prev,
        prizeSplitFirst: first,
        prizeSplitSecond: Math.floor(remaining * 0.6),
        prizeSplitThird: Math.ceil(remaining * 0.4),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tournament title is required";
    }

    if (!formData.date) {
      newErrors.date = "Tournament date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Tournament date cannot be in the past";
      }
    }

    if (!formData.time) {
      newErrors.time = "Tournament time is required";
    }

    const maxPlayers = parseInt(formData.maxPlayers);
    if (!formData.maxPlayers || maxPlayers < 2) {
      newErrors.maxPlayers = "At least 2 players required";
    } else if (maxPlayers > 1000) {
      newErrors.maxPlayers = "Maximum 1000 players allowed";
    }

    const prizePool = parseInt(formData.prizePool);
    if (!formData.prizePool || prizePool < 100) {
      newErrors.prizePool = "Minimum prize pool is 100 diamonds";
    } else if (prizePool > 1000000) {
      newErrors.prizePool = "Maximum prize pool is 1,000,000 diamonds";
    }

    const totalSplit =
      formData.prizeSplitFirst +
      formData.prizeSplitSecond +
      formData.prizeSplitThird;
    if (totalSplit !== 100) {
      newErrors.prizeSplit = "Prize split must total 100%";
    }

    if (!formData.rules.trim()) {
      newErrors.rules = "Tournament rules are required";
    } else if (formData.rules.length < 20) {
      newErrors.rules = "Rules must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const tournamentData = {
        title: formData.title,
        game: formData.game,
        date: formData.date,
        time: formData.time,
        max_players: parseInt(formData.maxPlayers),
        prize_pool_type: formData.prizePoolType,
        prize_pool: parseInt(formData.prizePool),
        prize_split_first: formData.prizeSplitFirst,
        prize_split_second: formData.prizeSplitSecond,
        prize_split_third: formData.prizeSplitThird,
        entry_fee: parseInt(formData.entryFee),
        rules: formData.rules,
        image: selectTournamentIcon({
          title: formData.title,
          prizePoolType: formData.prizePoolType,
          maxPlayers: parseInt(formData.maxPlayers),
          entryFee: parseInt(formData.entryFee),
          prizePool: parseInt(formData.prizePool),
        }),
        host_id: user.id,
      };

      const tournament = await tournamentsApi.create(tournamentData);

      if (tournament) {
        // Success! Redirect to dashboard
        alert("Tournament created successfully! 🏆");
        router.push("/host/dashboard");
      } else {
        setErrors({ submit: "Failed to create tournament. Please try again." });
      }
    } catch (error) {
      console.error("Tournament creation error:", error);
      setErrors({
        submit: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gold-gradient">Create Tournament</span>
          </h1>
          <p className="text-gray-400">
            Set up your tournament and invite players to compete
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tournament Title */}
            <Input
              label="Tournament Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter tournament name"
              icon="🏆"
              error={errors.title}
              required
            />

            {/* Game Info (Fixed) */}
            <div className="p-4 bg-dark-secondary rounded-lg border border-gold-dark/30">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎮</span>
                <div>
                  <p className="text-gray-400 text-sm">Game</p>
                  <p className="text-gold font-bold text-lg">Force of Rune</p>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tournament Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                icon="📅"
                error={errors.date}
                required
              />
              <Input
                label="Start Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange}
                icon="⏰"
                error={errors.time}
                required
              />
            </div>

            {/* Max Players */}
            <Input
              label="Maximum Players"
              name="maxPlayers"
              type="number"
              value={formData.maxPlayers}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              icon="👥"
              error={errors.maxPlayers}
              required
            />

            {/* Prize Pool Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Prize Pool Type <span className="text-gold">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, prizePoolType: "fixed" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    formData.prizePoolType === "fixed"
                      ? "border-gold bg-gold/10"
                      : "border-gold-dark/30 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <p className="text-white font-bold">Fixed Prize Pool</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Set a fixed prize amount that doesn&apos;t change
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, prizePoolType: "entry-based" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    formData.prizePoolType === "entry-based"
                      ? "border-gold bg-gold/10"
                      : "border-gold-dark/30 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">📊</span>
                    <p className="text-white font-bold">Entry-Based Pool</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Prize scales with number of participants
                  </p>
                </button>
              </div>
            </div>

            {/* Prize Pool Amount */}
            <div>
              <Input
                label={
                  formData.prizePoolType === "fixed"
                    ? "Prize Pool (Diamonds)"
                    : "Maximum Prize Pool (Diamonds)"
                }
                name="prizePool"
                type="number"
                value={formData.prizePool}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
                icon="💎"
                error={errors.prizePool}
                required
              />
              {formData.prizePoolType === "entry-based" && (
                <p className="mt-2 text-sm text-gray-400">
                  💡 Prize will be calculated as: (Current Players / Max
                  Players) × Max Prize Pool
                  {formData.maxPlayers && formData.prizePool && (
                    <span className="block mt-1 text-gold">
                      Example: If 50 players join out of {formData.maxPlayers},
                      prize will be{" "}
                      {Math.floor(
                        (50 / parseInt(formData.maxPlayers)) *
                          parseInt(formData.prizePool)
                      ).toLocaleString()}{" "}
                      diamonds
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Entry Fee */}
            <Input
              label="Entry Fee (Diamonds)"
              name="entryFee"
              type="number"
              value={formData.entryFee}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              icon="💰"
              min="0"
              max="10000"
              error={errors.entryFee}
              required
            />
            <p className="mt-2 text-sm text-gray-400">
              💡 Players will need to pay this amount to join the tournament.
              Set to 0 for free entry.
            </p>

            {/* Prize Split */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Prize Distribution <span className="text-gold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    label="1st Place (%)"
                    name="prizeSplitFirst"
                    type="number"
                    value={formData.prizeSplitFirst}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    icon="🥇"
                  />
                </div>
                <div>
                  <Input
                    label="2nd Place (%)"
                    name="prizeSplitSecond"
                    type="number"
                    value={formData.prizeSplitSecond}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    icon="🥈"
                  />
                </div>
                <div>
                  <Input
                    label="3rd Place (%)"
                    name="prizeSplitThird"
                    type="number"
                    value={formData.prizeSplitThird}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    icon="🥉"
                  />
                </div>
              </div>
              {errors.prizeSplit && (
                <p className="mt-2 text-sm text-red-400">{errors.prizeSplit}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Total:{" "}
                {formData.prizeSplitFirst +
                  formData.prizeSplitSecond +
                  formData.prizeSplitThird}
                % (must equal 100%)
              </p>
            </div>

            {/* Rules */}
            <Textarea
              label="Tournament Rules"
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              placeholder="Enter the tournament rules and regulations..."
              rows={6}
              error={errors.rules}
              required
            />

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => router.push("/host/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Tournament (Free)"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function CreateTournament() {
  return (
    <ProtectedRoute requiredRole="host">
      <CreateTournamentContent />
    </ProtectedRoute>
  );
}
