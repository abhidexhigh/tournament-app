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
    <div className="min-h-screen bg-gradient-to-b from-dark-primary via-dark-primary to-dark-secondary px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-3xl">
        {/* Header with Back Button */}
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/host/dashboard")}
            className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-all hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 text-2xl">
              🏆
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Create Tournament</h1>
              <p className="text-xs text-gray-400">Fill in the details below</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Select Game <span className="text-gold">*</span>
                  </label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gold-dark/30 bg-dark-gray-card px-4 py-3 text-white transition-all hover:border-white/20 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                    required
                  >
                    <option value="" className="bg-dark-card">Choose game</option>
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
                    <p className="mt-1 text-xs text-red-400">{errors.game}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tournament Type */}
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Tournament Format
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tournamentType: "regular" })
                  }
                  className={`group relative rounded-lg border-2 p-3 text-left transition-all ${
                    formData.tournamentType === "regular"
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Regular</h4>
                      <p className="text-xs text-gray-400">Individual players</p>
                    </div>
                  </div>
                  {formData.tournamentType === "regular" && (
                    <div className="absolute right-2 top-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-black">✓</div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tournamentType: "clan_battle" })
                  }
                  className={`group relative rounded-lg border-2 p-3 text-left transition-all ${
                    formData.tournamentType === "clan_battle"
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚔️</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Clan Battle</h4>
                      <p className="text-xs text-gray-400">Clan vs clan</p>
                    </div>
                  </div>
                  {formData.tournamentType === "clan_battle" && (
                    <div className="absolute right-2 top-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-black">✓</div>
                    </div>
                  )}
                </button>
              </div>

              {/* Clan Battle Mode Selection */}
              {formData.tournamentType === "clan_battle" && (
                <>
                  <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, clanBattleMode: "auto_division" })
                      }
                      className={`relative rounded-lg border-2 p-2.5 text-left transition-all ${
                        formData.clanBattleMode === "auto_division"
                          ? "border-gold bg-gold/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <div>
                          <h5 className="text-xs font-bold text-white">Auto-Division</h5>
                          <p className="text-[10px] text-gray-400">System balances</p>
                        </div>
                      </div>
                      {formData.clanBattleMode === "auto_division" && (
                        <div className="absolute right-2 top-2">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-black">✓</div>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, clanBattleMode: "clan_selection" })
                      }
                      className={`relative rounded-lg border-2 p-2.5 text-left transition-all ${
                        formData.clanBattleMode === "clan_selection"
                          ? "border-gold bg-gold/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        <div>
                          <h5 className="text-xs font-bold text-white">Clan Selection</h5>
                          <p className="text-[10px] text-gray-400">Choose clans</p>
                        </div>
                      </div>
                      {formData.clanBattleMode === "clan_selection" && (
                        <div className="absolute right-2 top-2">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-black">✓</div>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Clan Selection Fields */}
                  {formData.clanBattleMode === "clan_selection" && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                          First Clan <span className="text-gold">*</span>
                        </label>
                        <select
                          name="clan1_id"
                          value={formData.clan1_id}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gold-dark/30 bg-dark-gray-card px-4 py-3 text-white transition-all hover:border-white/20 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                          required
                        >
                          <option value="" className="bg-dark-card">Select clan</option>
                          {clanOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-dark-card">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.clan1_id && (
                          <p className="mt-1 text-xs text-red-400">{errors.clan1_id}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                          Second Clan <span className="text-gold">*</span>
                        </label>
                        <select
                          name="clan2_id"
                          value={formData.clan2_id}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gold-dark/30 bg-dark-gray-card px-4 py-3 text-white transition-all hover:border-white/20 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                          required
                        >
                          <option value="" className="bg-dark-card">Select clan</option>
                          {clanOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-dark-card">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.clan2_id && (
                          <p className="mt-1 text-xs text-red-400">{errors.clan2_id}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Schedule & Participants */}
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Schedule & Requirements
              </h3>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  icon="📅"
                  error={errors.date}
                  required
                />
                <Input
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  icon="⏰"
                  error={errors.time}
                  required
                />
                <div>
                  <Input
                    label={formData.tournamentType === "clan_battle" ? "Per Clan" : "Max Players"}
                    name="maxPlayers"
                    type="number"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    placeholder={formData.tournamentType === "clan_battle" ? "8-30" : "12-100"}
                    icon="👥"
                    error={errors.maxPlayers}
                    required
                    min={formData.tournamentType === "regular" ? 12 : formData.tournamentType === "clan_battle" ? 8 : 2}
                    max={formData.tournamentType === "regular" ? 100 : formData.tournamentType === "clan_battle" ? 30 : 1000}
                  />
                  {formData.maxPlayers && formData.tournamentType === "clan_battle" && (
                    <p className="mt-1 text-[10px] text-gray-500">Total: {formData.maxPlayers * 2}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Min Rank <span className="text-gold">*</span>
                  </label>
                  <select
                    name="minRank"
                    value={formData.minRank}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gold-dark/30 bg-dark-gray-card px-4 py-3 text-white transition-all hover:border-white/20 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                    required
                  >
                    <option value="" className="bg-dark-card">Select</option>
                    <option value="Silver" className="bg-dark-card">🥈 Silver</option>
                    <option value="Gold" className="bg-dark-card">🥇 Gold</option>
                    <option value="Platinum" className="bg-dark-card">💠 Platinum</option>
                    <option value="Diamond" className="bg-dark-card">💎 Diamond</option>
                    <option value="Master" className="bg-dark-card">👑 Master</option>
                  </select>
                  {errors.minRank && (
                    <p className="mt-1 text-xs text-red-400">{errors.minRank}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Prize Configuration</h3>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, prizePoolType: "fixed" })}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                      formData.prizePoolType === "fixed"
                        ? "border-gold bg-gold/10 text-white"
                        : "border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    💰 Fixed
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, prizePoolType: "entry-based" })}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                      formData.prizePoolType === "entry-based"
                        ? "border-gold bg-gold/10 text-white"
                        : "border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    📊 Entry
                  </button>
                </div>
              </div>

              {/* Prize Type Description */}
              <div className="mb-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                {formData.prizePoolType === "fixed" ? (
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gold">💰 Fixed Prize:</span> The prize pool amount is guaranteed regardless of how many players join. Host funds the entire prize.
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-green-400">📊 Entry-Based:</span> Prize pool grows based on entry fees collected. More participants = bigger prizes! Max prize is reached when tournament is full.
                  </p>
                )}
              </div>

              {/* Prize Pool Input */}
              <div className="mb-3 sm:hidden">
                <Input
                  label={formData.prizePoolType === "fixed" ? "Prize Pool" : "Max Prize"}
                  name="prizePool"
                  type="number"
                  value={formData.prizePool}
                  onChange={handleInputChange}
                  placeholder="1000"
                  icon={PRIMARY_CURRENCY === "USD" ? "💵" : "💎"}
                  error={errors.prizePool}
                  required
                />
              </div>
              
              {/* Prize Distribution - 3 columns on mobile, 4 on desktop */}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                <div className="hidden sm:block">
                  <Input
                    label={formData.prizePoolType === "fixed" ? "Prize Pool" : "Max Prize"}
                    name="prizePool"
                    type="number"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    placeholder="1000"
                    icon={PRIMARY_CURRENCY === "USD" ? "💵" : "💎"}
                    error={errors.prizePool}
                    required
                  />
                </div>
                <Input
                  label="1st %"
                  name="prizeSplitFirst"
                  type="number"
                  value={formData.prizeSplitFirst}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  icon="🥇"
                />
                <Input
                  label="2nd %"
                  name="prizeSplitSecond"
                  type="number"
                  value={formData.prizeSplitSecond}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  icon="🥈"
                />
                <Input
                  label="3rd %"
                  name="prizeSplitThird"
                  type="number"
                  value={formData.prizeSplitThird}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  icon="🥉"
                />
              </div>
              
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs">
                {errors.prizeSplit ? (
                  <span className="text-red-400">{errors.prizeSplit}</span>
                ) : (
                  <span className="text-gray-500">
                    {formData.prizePoolType === "entry-based" && formData.maxPlayers && formData.prizePool
                      ? `50 players = ${Math.floor((50 / parseInt(formData.maxPlayers)) * parseInt(formData.prizePool)).toLocaleString()} ${PRIMARY_CURRENCY === "USD" ? "$" : "💎"}`
                      : "Prize distribution"}
                  </span>
                )}
                <span className={`font-bold ${(formData.prizeSplitFirst + formData.prizeSplitSecond + formData.prizeSplitThird) === 100 ? "text-green-400" : "text-red-400"}`}>
                  Total: {formData.prizeSplitFirst + formData.prizeSplitSecond + formData.prizeSplitThird}%
                </span>
              </div>
            </div>

            {/* Entry Fee */}
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Entry Fee</h3>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-purple-400/20 bg-purple-500/10 px-2.5 py-1.5">
                  <input
                    type="checkbox"
                    checked={formData.acceptsTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, acceptsTickets: e.target.checked, entryFee: 0 })
                    }
                    className="h-3.5 w-3.5 rounded border-purple-400/30 text-purple-500"
                  />
                  <span className="text-xs font-medium text-white">🎫 Ticket Mode</span>
                </label>
              </div>

              {formData.acceptsTickets ? (
                <div className="grid grid-cols-3 gap-2">
                  {entryPriceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, entryFee: option.value })}
                      className={`relative rounded-lg border-2 p-2.5 text-center transition-all ${
                        formData.entryFee === option.value
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-400/20 hover:border-purple-400/40"
                      }`}
                    >
                      <p className="text-sm font-bold text-white">🎫 {option.label}</p>
                      <p className="text-[10px] text-gray-400">{option.diamonds_equivalent} 💎</p>
                      {formData.entryFee === option.value && (
                        <div className="absolute -right-1 -top-1">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[8px] font-bold text-white">✓</div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      label={`Entry Fee (${PRIMARY_CURRENCY === "USD" ? "USD" : "💎"})`}
                      name="entryFee"
                      type="number"
                      value={formData.entryFee}
                      onChange={handleInputChange}
                      placeholder="0 = free"
                      icon={PRIMARY_CURRENCY === "USD" ? "💵" : "💎"}
                      min="0"
                      max="10000"
                      error={errors.entryFee}
                      required
                    />
                  </div>
                  <span className={`mb-2.5 text-xs ${formData.entryFee > 0 ? "text-green-400" : "text-gray-500"}`}>
                    {formData.entryFee > 0 ? `✓ ${formData.entryFee} ${PRIMARY_CURRENCY === "USD" ? "$" : "💎"}` : "Free entry"}
                  </span>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tournament Rules</h3>
                <span className={`text-xs ${formData.rules.length >= 20 ? "text-green-400" : "text-gray-500"}`}>
                  {formData.rules.length >= 20 ? "✓ Valid" : `${formData.rules.length}/20`}
                </span>
              </div>
              <Textarea
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                placeholder="Enter tournament rules, requirements, and any special conditions..."
                rows={3}
                error={errors.rules}
                required
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <p className="text-sm text-red-400">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="sticky bottom-0 z-10 -mx-3 -mb-4 border-t border-white/5 bg-dark-primary/95 p-3 backdrop-blur-xl sm:relative sm:mx-0 sm:mb-0 sm:rounded-xl sm:border sm:bg-gradient-to-b sm:from-white/5 sm:to-transparent sm:p-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/host/dashboard")}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] rounded-lg border border-gold bg-gradient-to-r from-gold to-yellow-600 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-xl hover:shadow-gold/30 disabled:opacity-50"
                >
                  {loading ? "⏳ Creating..." : "🏆 Create Tournament"}
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
