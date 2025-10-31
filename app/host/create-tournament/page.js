"use client";

import { useState, useEffect } from "react";
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
import { getClanOptions, initializeClans } from "../../lib/clans";
import { getEntryPriceOptions } from "../../lib/ticketConfig";

function CreateTournamentContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    game: "", // Game selection
    tournamentType: "regular", // "regular" or "clan_battle"
    acceptsTickets: false, // Whether tournament accepts ticket payments
    clanBattleMode: "auto_division", // "auto_division" or "clan_selection"
    clan1_id: "", // First clan ID for clan selection mode
    clan2_id: "", // Second clan ID for clan selection mode
    date: "",
    time: "",
    maxPlayers: "",
    minRank: "", // Minimum rank required
    prizePoolType: "fixed", // "fixed" or "entry-based"
    prizePool: "",
    prizeSplitFirst: 50,
    prizeSplitSecond: 30,
    prizeSplitThird: 20,
    entryFee: 0, // Entry fee for players
    rules: "",
  });

  const [clanOptions, setClanOptions] = useState([]);

  const router = useRouter();

  // Initialize clans on component mount
  useEffect(() => {
    initializeClans();
    setClanOptions(getClanOptions());
  }, []);

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

    if (!formData.game) {
      newErrors.game = "Game selection is required";
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
    } else if (formData.tournamentType === "clan_battle") {
      if (formData.clanBattleMode === "auto_division" && maxPlayers > 60) {
        newErrors.maxPlayers =
          "Maximum 60 players allowed for auto-division clan battle";
      } else if (
        formData.clanBattleMode === "clan_selection" &&
        maxPlayers > 30
      ) {
        newErrors.maxPlayers =
          "Maximum 30 players per clan allowed for clan selection mode";
      }
    } else if (maxPlayers > 1000) {
      newErrors.maxPlayers = "Maximum 1000 players allowed";
    }

    // Clan battle specific validations
    if (formData.tournamentType === "clan_battle") {
      if (formData.clanBattleMode === "clan_selection") {
        if (!formData.clan1_id) {
          newErrors.clan1_id = "First clan is required";
        }
        if (!formData.clan2_id) {
          newErrors.clan2_id = "Second clan is required";
        }
        if (
          formData.clan1_id &&
          formData.clan2_id &&
          formData.clan1_id === formData.clan2_id
        ) {
          newErrors.clan2_id = "Clans must be different";
        }
      }
    }

    if (!formData.minRank) {
      newErrors.minRank = "Minimum rank is required";
    }

    const prizePool = parseInt(formData.prizePool);
    if (!formData.prizePool || prizePool < 1) {
      newErrors.prizePool = "Minimum prize pool is $1 USD";
    } else if (prizePool > 10000) {
      newErrors.prizePool = "Maximum prize pool is $10,000 USD";
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
        tournament_type: formData.tournamentType,
        accepts_tickets: formData.acceptsTickets,
        clan_battle_mode:
          formData.tournamentType === "clan_battle"
            ? formData.clanBattleMode
            : null,
        clan1_id:
          formData.tournamentType === "clan_battle" &&
          formData.clanBattleMode === "clan_selection"
            ? formData.clan1_id
            : null,
        clan2_id:
          formData.tournamentType === "clan_battle" &&
          formData.clanBattleMode === "clan_selection"
            ? formData.clan2_id
            : null,
        date: formData.date,
        time: formData.time,
        max_players: parseInt(formData.maxPlayers),
        min_rank: formData.minRank,
        prize_pool_type: formData.prizePoolType,
        prize_pool: parseInt(formData.prizePool) * 100, // Convert USD to diamonds
        prize_pool_usd: parseInt(formData.prizePool), // Store USD amount
        prize_split_first: formData.prizeSplitFirst,
        prize_split_second: formData.prizeSplitSecond,
        prize_split_third: formData.prizeSplitThird,
        entry_fee: parseFloat(formData.entryFee) * 100, // Convert USD to diamonds
        entry_fee_usd: parseFloat(formData.entryFee), // Store USD amount
        rules: formData.rules,
        image: selectTournamentIcon({
          title: formData.title,
          game: formData.game,
          prizePoolType: formData.prizePoolType,
          maxPlayers: parseInt(formData.maxPlayers),
          entryFee: parseFloat(formData.entryFee),
          prizePool: parseInt(formData.prizePool),
          tournamentType: formData.tournamentType,
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
            {/* Game Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Game <span className="text-gold">*</span>
              </label>
              <select
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                className="w-full bg-dark-card border border-gold-dark/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              >
                <option value="">Select a game</option>
                <option value="Force of Rune">Force of Rune</option>
                <option value="League of Legends">League of Legends</option>
                <option value="Dota 2">Dota 2</option>
                <option value="Counter-Strike 2">Counter-Strike 2</option>
                <option value="Valorant">Valorant</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="Fortnite">Fortnite</option>
                <option value="Rocket League">Rocket League</option>
                <option value="Overwatch 2">Overwatch 2</option>
                <option value="Call of Duty: Warzone">
                  Call of Duty: Warzone
                </option>
                <option value="Other">Other</option>
              </select>
              {errors.game && (
                <p className="mt-2 text-sm text-red-400">{errors.game}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                💡 Choose the game for your tournament
              </p>
            </div>

            {/* Tournament Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tournament Type <span className="text-gold">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tournamentType: "regular" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    formData.tournamentType === "regular"
                      ? "border-gold bg-gold/10"
                      : "border-gold-dark/30 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">🏆</span>
                    <p className="text-white font-bold">Regular</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Standard tournament for individual players
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tournamentType: "clan_battle" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    formData.tournamentType === "clan_battle"
                      ? "border-gold bg-gold/10"
                      : "border-gold-dark/30 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">⚔️</span>
                    <p className="text-white font-bold">Clan Battle</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Team-based tournament with clan vs clan battles
                  </p>
                </button>
              </div>
            </div>

            {/* Accept Ticket Payments Toggle */}
            <div className="bg-purple-500/5 border border-purple-500/30 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptsTickets}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acceptsTickets: e.target.checked,
                      entryFee: 0,
                    })
                  }
                  className="w-5 h-5 text-purple-500 bg-dark-card border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-white font-medium">
                    🎫 Accept Ticket Payments
                  </span>
                  <p className="text-sm text-gray-400 mt-1">
                    Allow players to join using tickets with fixed entry fees
                    ($0.10, $1.00, $10.00)
                  </p>
                </div>
              </label>
            </div>

            {/* Clan Battle Mode Selection */}
            {formData.tournamentType === "clan_battle" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Clan Battle Mode <span className="text-gold">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        clanBattleMode: "auto_division",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      formData.clanBattleMode === "auto_division"
                        ? "border-gold bg-gold/10"
                        : "border-gold-dark/30 hover:border-gold/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">🎯</span>
                      <p className="text-white font-bold">Auto-Division</p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Up to 60 players join, system divides into 2 teams of 30
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        clanBattleMode: "clan_selection",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      formData.clanBattleMode === "clan_selection"
                        ? "border-gold bg-gold/10"
                        : "border-gold-dark/30 hover:border-gold/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">👥</span>
                      <p className="text-white font-bold">Clan Selection</p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Host selects 2 specific clans (max 30 players each)
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Clan Selection Fields */}
            {formData.tournamentType === "clan_battle" &&
              formData.clanBattleMode === "clan_selection" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      First Clan <span className="text-gold">*</span>
                    </label>
                    <select
                      name="clan1_id"
                      value={formData.clan1_id}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-gold-dark/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      required
                    >
                      <option value="">Select first clan</option>
                      {clanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.clan1_id && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.clan1_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Second Clan <span className="text-gold">*</span>
                    </label>
                    <select
                      name="clan2_id"
                      value={formData.clan2_id}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-gold-dark/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      required
                    >
                      <option value="">Select second clan</option>
                      {clanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.clan2_id && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.clan2_id}
                      </p>
                    )}
                  </div>
                </div>
              )}

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
              label={
                formData.tournamentType === "clan_battle"
                  ? formData.clanBattleMode === "auto_division"
                    ? "Maximum Players (60 max)"
                    : "Maximum Players per Clan (30 max)"
                  : "Maximum Players"
              }
              name="maxPlayers"
              type="number"
              value={formData.maxPlayers}
              onChange={handleInputChange}
              placeholder={
                formData.tournamentType === "clan_battle"
                  ? formData.clanBattleMode === "auto_division"
                    ? "e.g., 60"
                    : "e.g., 30"
                  : "e.g., 100"
              }
              icon="👥"
              error={errors.maxPlayers}
              required
              max={
                formData.tournamentType === "clan_battle"
                  ? formData.clanBattleMode === "auto_division"
                    ? 60
                    : 30
                  : 1000
              }
            />
            {formData.tournamentType === "clan_battle" && (
              <p className="mt-2 text-sm text-gray-400">
                💡{" "}
                {formData.clanBattleMode === "auto_division"
                  ? "System will automatically divide players into 2 teams of 30 each"
                  : "Each clan can have up to 30 players (60 total players max)"}
              </p>
            )}

            {/* Minimum Rank Required */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Minimum Rank Required <span className="text-gold">*</span>
              </label>
              <select
                name="minRank"
                value={formData.minRank}
                onChange={handleInputChange}
                className="w-full bg-dark-card border border-gold-dark/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              >
                <option value="">Select minimum rank</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
                <option value="Master">Master</option>
              </select>
              {errors.minRank && (
                <p className="mt-2 text-sm text-red-400">{errors.minRank}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                💡 Only players with this rank or higher can join the tournament
              </p>
            </div>

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
                    ? "Prize Pool (USD)"
                    : "Maximum Prize Pool (USD)"
                }
                name="prizePool"
                type="number"
                value={formData.prizePool}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                icon="💰"
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
                      prize will be $
                      {Math.floor(
                        (50 / parseInt(formData.maxPlayers)) *
                          parseInt(formData.prizePool)
                      ).toLocaleString()}{" "}
                      USD (
                      {(
                        Math.floor(
                          (50 / parseInt(formData.maxPlayers)) *
                            parseInt(formData.prizePool)
                        ) * 100
                      ).toLocaleString()}{" "}
                      💎)
                    </span>
                  )}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                💡 1 USD = 100 Diamonds
              </p>
            </div>

            {/* Entry Fee - Conditional UI based on acceptsTickets */}
            {formData.acceptsTickets ? (
              /* Fixed Entry Price Options for Ticket-Based Entry */
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Entry Fee <span className="text-gold">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getEntryPriceOptions().map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, entryFee: option.value })
                      }
                      className={`p-4 rounded-lg border-2 transition-all duration-300 text-left relative ${
                        formData.entryFee === option.value
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-500/30 hover:border-purple-500/50"
                      }`}
                    >
                      {option.popular && (
                        <span className="absolute -top-2 -right-2 bg-gold text-dark-primary text-xs font-bold px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🎫</span>
                        <p className="text-white font-bold">{option.label}</p>
                      </div>
                      <p className="text-purple-400 text-sm mb-1">
                        {option.description}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {option.diamonds_equivalent} 💎 equivalent
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  💡 Players can use matching tickets or pay with diamonds/USD
                </p>
              </div>
            ) : (
              /* Manual Entry Fee Input for Regular Entry */
              <div>
                <Input
                  label="Entry Fee (USD)"
                  name="entryFee"
                  type="number"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                  icon="💰"
                  min="0"
                  max="100"
                  error={errors.entryFee}
                  required
                />
                <p className="mt-2 text-sm text-gray-400">
                  💡 Players will need to pay this amount to join the
                  tournament. Set to 0 for free entry.
                  {formData.entryFee > 0 && (
                    <span className="block mt-1 text-gold">
                      Entry fee: ${formData.entryFee} USD (
                      {(formData.entryFee * 100).toLocaleString()} 💎)
                    </span>
                  )}
                </p>
              </div>
            )}

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
