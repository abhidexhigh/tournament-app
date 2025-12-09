"use client";

import { useState, useEffect, useMemo } from "react";
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
import { CONVERSION_RATE, PRIMARY_CURRENCY } from "../../lib/currencyConfig";

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
  const entryPriceOptions = useMemo(() => getEntryPriceOptions(), []);

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

    // Validation for Regular tournaments
    if (formData.tournamentType === "regular") {
      if (!formData.maxPlayers || maxPlayers < 12) {
        newErrors.maxPlayers =
          "Minimum 12 players required for regular tournaments";
      } else if (maxPlayers > 100) {
        newErrors.maxPlayers =
          "Maximum 100 players allowed for regular tournaments";
      }
    }

    // Validation for Clan Battle tournaments
    else if (formData.tournamentType === "clan_battle") {
      // Both modes now ask for players per clan (not total)
      if (!formData.maxPlayers || maxPlayers < 8) {
        newErrors.maxPlayers = "Minimum 8 players per clan required";
      } else if (maxPlayers > 30) {
        newErrors.maxPlayers = "Maximum 30 players per clan allowed";
      }
    }

    // Fallback validation
    else {
      if (!formData.maxPlayers || maxPlayers < 2) {
        newErrors.maxPlayers = "At least 2 players required";
      }
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
        prize_pool: parseInt(formData.prizePool) * CONVERSION_RATE.USD_TO_DIAMOND, // Convert using currency config
        prize_pool_usd: parseInt(formData.prizePool), // Store USD amount
        prize_split_first: formData.prizeSplitFirst,
        prize_split_second: formData.prizeSplitSecond,
        prize_split_third: formData.prizeSplitThird,
        entry_fee: parseFloat(formData.entryFee) * CONVERSION_RATE.USD_TO_DIAMOND, // Convert using currency config
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
    <div className="min-h-screen bg-gradient-to-b from-dark-primary via-dark-primary to-dark-secondary px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/host/dashboard")}
          className="group mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-all hover:text-white"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 text-4xl">
            🏆
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
            Create New Tournament
          </h1>
          <p className="text-gray-400">
            Fill in the details to launch your tournament
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl">
              <div className="space-y-5">
                <Input
                  label="Tournament Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Championship 2024"
                  icon="🏆"
                  error={errors.title}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Select Game <span className="text-gold">*</span>
                  </label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm transition-all hover:border-white/20 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    required
                  >
                    <option value="" className="bg-dark-card">Choose your game</option>
                    <option value="Force of Rune" className="bg-dark-card">🎮 Force of Rune</option>
                    <option value="League of Legends" className="bg-dark-card">⚔️ League of Legends</option>
                    <option value="Dota 2" className="bg-dark-card">🛡️ Dota 2</option>
                    <option value="Counter-Strike 2" className="bg-dark-card">🔫 Counter-Strike 2</option>
                    <option value="Valorant" className="bg-dark-card">🎯 Valorant</option>
                    <option value="Apex Legends" className="bg-dark-card">🏃 Apex Legends</option>
                    <option value="Fortnite" className="bg-dark-card">🏗️ Fortnite</option>
                    <option value="Rocket League" className="bg-dark-card">🚗 Rocket League</option>
                    <option value="Overwatch 2" className="bg-dark-card">🦸 Overwatch 2</option>
                    <option value="Call of Duty: Warzone" className="bg-dark-card">☠️ Call of Duty: Warzone</option>
                    <option value="Other" className="bg-dark-card">🎲 Other</option>
                  </select>
                  {errors.game && (
                    <p className="mt-2 text-xs text-red-400">{errors.game}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tournament Type */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Tournament Format
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tournamentType: "regular" })
                  }
                  className={`group relative rounded-xl border-2 p-6 text-left transition-all ${
                    formData.tournamentType === "regular"
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="mb-4 text-4xl">🏆</div>
                  <h4 className="mb-2 text-lg font-bold text-white">Regular</h4>
                  <p className="text-sm text-gray-400">
                    Individual players compete
                  </p>
                  {formData.tournamentType === "regular" && (
                    <div className="absolute right-4 top-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                        ✓
                      </div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tournamentType: "clan_battle" })
                  }
                  className={`group relative rounded-xl border-2 p-6 text-left transition-all ${
                    formData.tournamentType === "clan_battle"
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="mb-4 text-4xl">⚔️</div>
                  <h4 className="mb-2 text-lg font-bold text-white">Clan Battle</h4>
                  <p className="text-sm text-gray-400">
                    Clan vs clan competition
                  </p>
                  {formData.tournamentType === "clan_battle" && (
                    <div className="absolute right-4 top-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {/* Clan Battle Mode Selection */}
              {formData.tournamentType === "clan_battle" && (
                <>
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Battle Mode
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          clanBattleMode: "auto_division",
                        })
                      }
                      className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                        formData.clanBattleMode === "auto_division"
                          ? "border-gold bg-gold/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="mb-3 text-3xl">🎯</div>
                      <h5 className="mb-1 font-bold text-white">Auto-Division</h5>
                      <p className="text-xs text-gray-400">
                        System balances teams
                      </p>
                      {formData.clanBattleMode === "auto_division" && (
                        <div className="absolute right-3 top-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
                            ✓
                          </div>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          clanBattleMode: "clan_selection",
                        })
                      }
                      className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                        formData.clanBattleMode === "clan_selection"
                          ? "border-gold bg-gold/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="mb-3 text-3xl">👥</div>
                      <h5 className="mb-1 font-bold text-white">Clan Selection</h5>
                      <p className="text-xs text-gray-400">
                        Choose specific clans
                      </p>
                      {formData.clanBattleMode === "clan_selection" && (
                        <div className="absolute right-3 top-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
                            ✓
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Clan Selection Fields */}
                  {formData.clanBattleMode === "clan_selection" && (
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          First Clan <span className="text-gold">*</span>
                        </label>
                        <select
                          name="clan1_id"
                          value={formData.clan1_id}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all hover:border-white/20 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                          required
                        >
                          <option value="" className="bg-dark-card">Select first clan</option>
                          {clanOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-dark-card">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.clan1_id && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {errors.clan1_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          Second Clan <span className="text-gold">*</span>
                        </label>
                        <select
                          name="clan2_id"
                          value={formData.clan2_id}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all hover:border-white/20 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                          required
                        >
                          <option value="" className="bg-dark-card">Select second clan</option>
                          {clanOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-dark-card">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.clan2_id && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {errors.clan2_id}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Schedule & Participants */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Schedule & Requirements
              </h3>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Input
                    label={
                      formData.tournamentType === "clan_battle"
                        ? "Players per Clan"
                        : "Maximum Players"
                    }
                    name="maxPlayers"
                    type="number"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    placeholder={
                      formData.tournamentType === "clan_battle"
                        ? "8-30"
                        : "12-100"
                    }
                    icon="👥"
                    error={errors.maxPlayers}
                    required
                    min={
                      formData.tournamentType === "regular"
                        ? 12
                        : formData.tournamentType === "clan_battle"
                          ? 8
                          : 2
                    }
                    max={
                      formData.tournamentType === "regular"
                        ? 100
                        : formData.tournamentType === "clan_battle"
                          ? 30
                          : 1000
                    }
                  />
                  {formData.maxPlayers && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      {formData.tournamentType === "clan_battle"
                        ? `Total: ${formData.maxPlayers * 2} players`
                        : `${formData.maxPlayers} total players`}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Minimum Rank <span className="text-gold">*</span>
                  </label>
                  <select
                    name="minRank"
                    value={formData.minRank}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm transition-all hover:border-white/20 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    required
                  >
                    <option value="" className="bg-dark-card">Select minimum rank</option>
                    <option value="Silver" className="bg-dark-card">🥈 Silver</option>
                    <option value="Gold" className="bg-dark-card">🥇 Gold</option>
                    <option value="Platinum" className="bg-dark-card">💠 Platinum</option>
                    <option value="Diamond" className="bg-dark-card">💎 Diamond</option>
                    <option value="Master" className="bg-dark-card">👑 Master</option>
                  </select>
                  {errors.minRank && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.minRank}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Prize Configuration
              </h3>

              <div className="mb-5 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, prizePoolType: "fixed" })
                  }
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    formData.prizePoolType === "fixed"
                      ? "border-gold bg-gold/10 text-white"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  💰 Fixed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, prizePoolType: "entry-based" })
                  }
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    formData.prizePoolType === "entry-based"
                      ? "border-gold bg-gold/10 text-white"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  📊 Entry-Based
                </button>
              </div>

              <Input
                label={
                  formData.prizePoolType === "fixed"
                    ? `Prize Pool (${PRIMARY_CURRENCY === "USD" ? "USD" : "Diamonds"})`
                    : `Max Prize Pool (${PRIMARY_CURRENCY === "USD" ? "USD" : "Diamonds"})`
                }
                name="prizePool"
                type="number"
                value={formData.prizePool}
                onChange={handleInputChange}
                placeholder="e.g., 1000"
                icon={PRIMARY_CURRENCY === "USD" ? "💵" : "💎"}
                error={errors.prizePool}
                required
              />
              {formData.prizePoolType === "entry-based" && formData.maxPlayers && formData.prizePool && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Example: 50 players ={" "}
                  {Math.floor((50 / parseInt(formData.maxPlayers)) * parseInt(formData.prizePool)).toLocaleString()}{" "}
                  {PRIMARY_CURRENCY === "USD" ? "$" : "💎"}
                </p>
              )}

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div>
                <label className="mb-3 block text-sm font-semibold text-white">
                  Prize Distribution <span className="text-gold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="1st (%)"
                    name="prizeSplitFirst"
                    type="number"
                    value={formData.prizeSplitFirst}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    icon="🥇"
                  />
                  <Input
                    label="2nd (%)"
                    name="prizeSplitSecond"
                    type="number"
                    value={formData.prizeSplitSecond}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    icon="🥈"
                  />
                  <Input
                    label="3rd (%)"
                    name="prizeSplitThird"
                    type="number"
                    value={formData.prizeSplitThird}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    icon="🥉"
                  />
                </div>
                {errors.prizeSplit && (
                  <p className="mt-2 text-xs text-red-400">{errors.prizeSplit}</p>
                )}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5">
                  <span className="text-sm text-gray-400">Total Distribution</span>
                  <span className={`text-lg font-bold ${
                    (formData.prizeSplitFirst + formData.prizeSplitSecond + formData.prizeSplitThird) === 100
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                    {formData.prizeSplitFirst + formData.prizeSplitSecond + formData.prizeSplitThird}%
                  </span>
                </div>
              </div>
            </div>

            {/* Entry Fee */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Entry Fee
              </h3>

              {/* Ticket Toggle */}
              <div className="mb-5 rounded-xl border border-purple-400/20 bg-purple-500/10 p-4">
                <label className="flex cursor-pointer items-center">
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
                    className="h-5 w-5 rounded border-purple-400/30 text-purple-500 transition-all focus:ring-2 focus:ring-purple-400/50"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎫</span>
                      <span className="font-semibold text-white">Ticket Payments</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Fixed entry fees: $0.10, $1.00, $10.00
                    </p>
                  </div>
                </label>
              </div>

              {/* Entry Fee Options */}
              {formData.acceptsTickets ? (
                <div className="grid grid-cols-3 gap-3">
                  {entryPriceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, entryFee: option.value })
                      }
                      className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                        formData.entryFee === option.value
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-400/20 hover:border-purple-400/40"
                      }`}
                    >
                      <div className="mb-2 text-2xl">🎫</div>
                      <p className="text-sm font-bold text-white">{option.label}</p>
                      <p className="mt-1 text-xs text-gray-400">{option.diamonds_equivalent} 💎</p>
                      {formData.entryFee === option.value && (
                        <div className="absolute -right-1 -top-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                            ✓
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <Input
                    label={`Entry Fee (${PRIMARY_CURRENCY === "USD" ? "USD" : "Diamonds"})`}
                    name="entryFee"
                    type="number"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    placeholder="0 for free entry"
                    icon={PRIMARY_CURRENCY === "USD" ? "💵" : "💎"}
                    min="0"
                    max="10000"
                    error={errors.entryFee}
                    required
                  />
                  <p className={`mt-2 text-xs ${formData.entryFee > 0 ? "text-green-400" : "text-gray-500"}`}>
                    {formData.entryFee > 0
                      ? `✓ Paid entry: ${formData.entryFee} ${PRIMARY_CURRENCY === "USD" ? "$" : "💎"}`
                      : "💡 Free entry tournament"}
                  </p>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Tournament Rules
              </h3>
              <Textarea
                label="Rules & Regulations"
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                placeholder="Enter tournament rules, requirements, and any special conditions..."
                rows={6}
                error={errors.rules}
                required
              />
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2">
                <div className="text-xs">
                  {formData.rules.length >= 20 ? (
                    <span className="text-green-400">✓ Rules are valid</span>
                  ) : (
                    <span className="text-gray-500">Minimum 20 characters</span>
                  )}
                </div>
                <div className={`text-xs font-mono ${
                  formData.rules.length >= 20 ? "text-green-400" : "text-gray-500"
                }`}>
                  {formData.rules.length} / 20
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-red-400">Error Creating Tournament</p>
                    <p className="mt-1 text-sm text-red-300">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="sticky bottom-0 z-10 -mx-3 -mb-6 border-t border-white/5 bg-dark-primary/95 p-4 backdrop-blur-xl sm:relative sm:mx-0 sm:mb-0 sm:rounded-2xl sm:border sm:bg-gradient-to-b sm:from-white/5 sm:to-transparent sm:p-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/host/dashboard")}
                  disabled={loading}
                  className="flex-1 rounded-xl border-2 border-white/10 bg-transparent px-6 py-3.5 font-semibold text-white transition-all hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl border-2 border-gold bg-gradient-to-r from-gold to-yellow-600 px-6 py-3.5 font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-xl hover:shadow-gold/30 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      <span>Creating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🏆</span>
                      <span>Create Tournament</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
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
