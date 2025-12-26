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
import DatePicker from "../../components/DatePicker";
import TimePicker from "../../components/TimePicker";

function CreateTournamentContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    game: "Force of Rune", // Game selection - locked to Force of Rune
    tournamentType: "regular", // "regular" or "clan_battle"
    acceptsTickets: false, // Whether tournament accepts ticket payments
    clanBattleMode: "auto_division", // "auto_division" or "clan_selection"
    clanPrizeMode: "individual", // "individual" or "winner_clan" (clan battles only)
    clan1_id: "", // First clan ID for clan selection mode
    clan2_id: "", // Second clan ID for clan selection mode
    date: "",
    time: "",
    maxPlayers: "",
    minRank: "", // Minimum rank required
    prizePoolType: "fixed", // "fixed" or "entry-based"
    prizePool: "",
    prizeSplitFirst: 10,
    prizeSplitSecond: 7,
    prizeSplitThird: 5,
    additionalPrizePositions: 12, // Number of additional positions (4th to n+3)
    entryFee: 0, // Entry fee for players
    rules: "",
  });

  const [clanOptions, setClanOptions] = useState([]);
  const entryPriceOptions = useMemo(() => getEntryPriceOptions(), []);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const router = useRouter();

  // Generate future date (3 days from now)
  const getFutureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  };

  // Dev presets for quick form filling
  const devPresets = {
    regularFixed: {
      title: "🎮 Force of Rune Championship - Season 5",
      game: "Force of Rune",
      tournamentType: "regular",
      acceptsTickets: false,
      clanBattleMode: "auto_division",
      clanPrizeMode: "individual",
      clan1_id: "",
      clan2_id: "",
      date: getFutureDate(),
      time: "18:00",
      maxPlayers: "30",
      minRank: "Gold",
      prizePoolType: "fixed",
      prizePool: "1000",
      prizeSplitFirst: 15,
      prizeSplitSecond: 10,
      prizeSplitThird: 7,
      additionalPrizePositions: 12,
      entryFee: 5,
      rules:
        "1. All players must be online 15 minutes before start.\n2. No cheating or exploits allowed.\n3. Disconnections will be handled by admins.\n4. Finals will be best of 3.\n5. All decisions by admins are final.",
    },
    regularEntry: {
      title: "⚔️ Weekly Warrior Battle Royale",
      game: "Force of Rune",
      tournamentType: "regular",
      acceptsTickets: false,
      clanBattleMode: "auto_division",
      clanPrizeMode: "individual",
      clan1_id: "",
      clan2_id: "",
      date: getFutureDate(),
      time: "20:00",
      maxPlayers: "50",
      minRank: "Silver",
      prizePoolType: "entry-based",
      prizePool: "2500",
      prizeSplitFirst: 20,
      prizeSplitSecond: 12,
      prizeSplitThird: 8,
      additionalPrizePositions: 17,
      entryFee: 10,
      rules:
        "1. Entry fee contributes to prize pool.\n2. Minimum 20 players to start.\n3. Battle Royale format - last player standing wins.\n4. No teaming allowed.\n5. Stream sniping is prohibited.",
    },
    clanAutoIndividual: {
      title: "⚔️ Clan Wars - Auto Division Championship",
      game: "Force of Rune",
      tournamentType: "clan_battle",
      acceptsTickets: false,
      clanBattleMode: "auto_division",
      clanPrizeMode: "individual",
      clan1_id: "",
      clan2_id: "",
      date: getFutureDate(),
      time: "19:00",
      maxPlayers: "20",
      minRank: "Platinum",
      prizePoolType: "fixed",
      prizePool: "1500",
      prizeSplitFirst: 12,
      prizeSplitSecond: 8,
      prizeSplitThird: 5,
      additionalPrizePositions: 15,
      entryFee: 8,
      rules:
        "1. Teams auto-divided by system.\n2. Top performers get individual prizes.\n3. All clan members must participate.\n4. Voice chat required.\n5. Fair play policy enforced.",
    },
    clanAutoWinner: {
      title: "🏆 Ultimate Clan Showdown - Winner Takes All",
      game: "Force of Rune",
      tournamentType: "clan_battle",
      acceptsTickets: false,
      clanBattleMode: "auto_division",
      clanPrizeMode: "winner_clan",
      clan1_id: "",
      clan2_id: "",
      date: getFutureDate(),
      time: "21:00",
      maxPlayers: "25",
      minRank: "Gold",
      prizePoolType: "fixed",
      prizePool: "2000",
      prizeSplitFirst: 10,
      prizeSplitSecond: 7,
      prizeSplitThird: 5,
      additionalPrizePositions: 10,
      entryFee: 15,
      rules:
        "1. Winner clan splits entire prize equally!\n2. Teams auto-divided.\n3. Best of 5 matches.\n4. All members share the glory.\n5. Teamwork is key!",
    },
    clanSelectionIndividual: {
      title: "🔥 Dragons vs Phoenix - Epic Rivalry",
      game: "Force of Rune",
      tournamentType: "clan_battle",
      acceptsTickets: false,
      clanBattleMode: "clan_selection",
      clanPrizeMode: "individual",
      clan1_id: clanOptions[0]?.value || "",
      clan2_id: clanOptions[1]?.value || "",
      date: getFutureDate(),
      time: "17:00",
      maxPlayers: "15",
      minRank: "Diamond",
      prizePoolType: "fixed",
      prizePool: "3000",
      prizeSplitFirst: 18,
      prizeSplitSecond: 12,
      prizeSplitThird: 8,
      additionalPrizePositions: 9,
      entryFee: 20,
      rules:
        "1. Only Dragons and Phoenix clan members can join.\n2. Top performers get individual prizes.\n3. Must be active clan member for 30+ days.\n4. Clan leaders must approve participation.\n5. Best of 7 grand finals.",
    },
    clanSelectionWinner: {
      title: "👑 Kings vs Queens - Winner Takes All",
      game: "Force of Rune",
      tournamentType: "clan_battle",
      acceptsTickets: false,
      clanBattleMode: "clan_selection",
      clanPrizeMode: "winner_clan",
      clan1_id: clanOptions[0]?.value || "",
      clan2_id: clanOptions[1]?.value || "",
      date: getFutureDate(),
      time: "22:00",
      maxPlayers: "30",
      minRank: "Master",
      prizePoolType: "entry-based",
      prizePool: "5000",
      prizeSplitFirst: 10,
      prizeSplitSecond: 7,
      prizeSplitThird: 5,
      additionalPrizePositions: 20,
      entryFee: 25,
      rules:
        "1. Winner clan takes ALL the prize!\n2. Selected clans only.\n3. Prize split equally among winners.\n4. Entry fees grow the pool.\n5. The ultimate clan battle!",
    },
  };

  const fillPreset = (presetKey) => {
    const preset = devPresets[presetKey];
    if (preset) {
      // Update clan IDs if available
      if (presetKey.includes("Selection") && clanOptions.length >= 2) {
        preset.clan1_id = clanOptions[0]?.value || "";
        preset.clan2_id = clanOptions[1]?.value || "";
      }
      setFormData(preset);
      setErrors({});
    }
  };

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

    const topThreeSplit =
      (parseInt(formData.prizeSplitFirst) || 0) +
      (parseInt(formData.prizeSplitSecond) || 0) +
      (parseInt(formData.prizeSplitThird) || 0);

    if (topThreeSplit >= 100) {
      newErrors.prizeSplit = "Top 3 prize split must be less than 100%";
    }

    const additionalPositions =
      parseInt(formData.additionalPrizePositions) || 0;
    const maxAllowedPositions = (maxPlayers || 0) - 3; // 1st, 2nd, 3rd are already taken

    if (additionalPositions < 0) {
      newErrors.additionalPrizePositions =
        "Additional positions cannot be negative";
    } else if (maxPlayers > 0 && additionalPositions > maxAllowedPositions) {
      newErrors.additionalPrizePositions = `Cannot exceed ${maxAllowedPositions} winners (${maxPlayers} max players minus top 3)`;
    } else if (additionalPositions > 0) {
      const remainingPercent = 100 - topThreeSplit;
      const perPositionPercent = remainingPercent / additionalPositions;
      if (perPositionPercent < 0.1) {
        newErrors.additionalPrizePositions =
          "Too many positions - each would get less than 0.1%";
      }
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
        // For clan battles, total max_players is per-clan value × 2
        max_players:
          formData.tournamentType === "clan_battle"
            ? parseInt(formData.maxPlayers) * 2
            : parseInt(formData.maxPlayers),
        // Store per-clan limit for clan battles (used for validation)
        max_players_per_clan:
          formData.tournamentType === "clan_battle"
            ? parseInt(formData.maxPlayers)
            : null,
        // Prize mode for clan battles (individual ranking or winner clan takes all)
        clan_prize_mode:
          formData.tournamentType === "clan_battle"
            ? formData.clanPrizeMode
            : null,
        min_rank: formData.minRank,
        prize_pool_type: formData.prizePoolType,
        prize_pool:
          parseInt(formData.prizePool) * CONVERSION_RATE.USD_TO_DIAMOND, // Convert using currency config
        prize_pool_usd: parseInt(formData.prizePool), // Store USD amount
        prize_split_first: parseInt(formData.prizeSplitFirst),
        prize_split_second: parseInt(formData.prizeSplitSecond),
        prize_split_third: parseInt(formData.prizeSplitThird),
        additional_prize_positions:
          parseInt(formData.additionalPrizePositions) || 0,
        entry_fee:
          parseFloat(formData.entryFee) * CONVERSION_RATE.USD_TO_DIAMOND, // Convert using currency config
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
    <div className="from-dark-primary via-dark-primary to-dark-secondary min-h-screen bg-gradient-to-b px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-3xl">
        {/* Header with Back Button */}
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/host/dashboard")}
            className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-all hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="from-gold/20 to-gold/5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-2xl">
              🏆
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Create Tournament
              </h1>
              <p className="text-sm text-gray-400">Fill in the details below</p>
            </div>
          </div>
        </div>

        {/* Dev Panel */}
        {showDevPanel && (
          <div className="mb-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🧪</span>
                <span className="text-sm font-semibold text-purple-300">
                  Dev Quick Fill
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDevPanel(false)}
                className="text-sm text-gray-500 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => fillPreset("regularFixed")}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-left text-sm transition-all hover:bg-blue-500/20"
              >
                <div className="font-medium text-blue-300">Regular</div>
                <div className="text-xs text-gray-400">Fixed Prize</div>
              </button>
              <button
                type="button"
                onClick={() => fillPreset("regularEntry")}
                className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-left text-sm transition-all hover:bg-green-500/20"
              >
                <div className="font-medium text-green-300">Regular</div>
                <div className="text-xs text-gray-400">Entry Based</div>
              </button>
              <button
                type="button"
                onClick={() => fillPreset("clanAutoIndividual")}
                className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-left text-sm transition-all hover:bg-orange-500/20"
              >
                <div className="font-medium text-orange-300">Clan Auto</div>
                <div className="text-xs text-gray-400">Individual</div>
              </button>
              <button
                type="button"
                onClick={() => fillPreset("clanAutoWinner")}
                className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-left text-sm transition-all hover:bg-yellow-500/20"
              >
                <div className="font-medium text-yellow-300">Clan Auto</div>
                <div className="text-xs text-gray-400">Winner Clan</div>
              </button>
              <button
                type="button"
                onClick={() => fillPreset("clanSelectionIndividual")}
                className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-left text-sm transition-all hover:bg-pink-500/20"
              >
                <div className="font-medium text-pink-300">Clan Select</div>
                <div className="text-xs text-gray-400">Individual</div>
              </button>
              <button
                type="button"
                onClick={() => fillPreset("clanSelectionWinner")}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-sm transition-all hover:bg-red-500/20"
              >
                <div className="font-medium text-red-300">Clan Select</div>
                <div className="text-xs text-gray-400">Winner Clan</div>
              </button>
            </div>
          </div>
        )}

        {/* Hidden Dev Toggle Button - Click to show panel */}
        {!showDevPanel && (
          <button
            type="button"
            onClick={() => setShowDevPanel(true)}
            className="mb-2 flex items-center gap-1 rounded bg-purple-500/10 px-2 py-1 text-xs text-purple-400 opacity-30 transition-opacity hover:opacity-100"
          >
            🧪 Dev
          </button>
        )}

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
                  Game <span className="text-gold">*</span>
                </label>
                <div className="border-gold-dark/30 bg-dark-gray-card flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-white opacity-80">
                  <span>🎮</span>
                  <span className="font-medium">Force of Rune</span>
                  <span className="ml-auto text-sm text-gray-500">Locked</span>
                </div>
                <input type="hidden" name="game" value="Force of Rune" />
              </div>
            </div>
          </div>

          {/* Tournament Type */}
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-400 uppercase">
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
                    <h4 className="text-sm font-bold text-white">FOR Chess</h4>
                    <p className="text-sm text-gray-400">Individual players</p>
                  </div>
                </div>
                {formData.tournamentType === "regular" && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gold flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-black">
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
                className={`group relative rounded-lg border-2 p-3 text-left transition-all ${
                  formData.tournamentType === "clan_battle"
                    ? "border-gold bg-gold/10"
                    : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Clan Battle
                    </h4>
                    <p className="text-sm text-gray-400">Clan vs clan</p>
                  </div>
                </div>
                {formData.tournamentType === "clan_battle" && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gold flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-black">
                      ✓
                    </div>
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
                      setFormData({
                        ...formData,
                        clanBattleMode: "auto_division",
                      })
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
                        <h5 className="text-sm font-bold text-white">
                          Auto-Division
                        </h5>
                        <p className="text-[10px] text-gray-400">
                          System balances
                        </p>
                      </div>
                    </div>
                    {formData.clanBattleMode === "auto_division" && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-gold flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-black">
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
                    className={`relative rounded-lg border-2 p-2.5 text-left transition-all ${
                      formData.clanBattleMode === "clan_selection"
                        ? "border-gold bg-gold/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👥</span>
                      <div>
                        <h5 className="text-sm font-bold text-white">
                          Clan Selection
                        </h5>
                        <p className="text-[10px] text-gray-400">
                          Choose clans
                        </p>
                      </div>
                    </div>
                    {formData.clanBattleMode === "clan_selection" && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-gold flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-black">
                          ✓
                        </div>
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
                        className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-full rounded-lg border px-4 py-3 text-white transition-all hover:border-white/20 focus:ring-2 focus:outline-none"
                        required
                      >
                        <option value="" className="bg-dark-card">
                          Select clan
                        </option>
                        {clanOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-dark-card"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.clan1_id && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.clan1_id}
                        </p>
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
                        className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-full rounded-lg border px-4 py-3 text-white transition-all hover:border-white/20 focus:ring-2 focus:outline-none"
                        required
                      >
                        <option value="" className="bg-dark-card">
                          Select clan
                        </option>
                        {clanOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-dark-card"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.clan2_id && (
                        <p className="mt-1 text-sm text-red-400">
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
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Schedule & Requirements
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Date <span className="text-gold">*</span>
                </label>
                <DatePicker
                  selectedDate={
                    formData.date ? new Date(formData.date + "T00:00:00") : null
                  }
                  onDateChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      setFormData((prev) => ({
                        ...prev,
                        date: `${year}-${month}-${day}`,
                      }));
                    } else {
                      setFormData((prev) => ({ ...prev, date: "" }));
                    }
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  }}
                  placeholder="Select date"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-400">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Time <span className="text-gold">*</span>
                </label>
                <TimePicker
                  selectedTime={formData.time}
                  onTimeChange={(time) => {
                    setFormData((prev) => ({ ...prev, time }));
                    if (errors.time) {
                      setErrors((prev) => ({ ...prev, time: "" }));
                    }
                  }}
                  placeholder="Select time"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-400">{errors.time}</p>
                )}
              </div>
              <div>
                <Input
                  label={
                    formData.tournamentType === "clan_battle"
                      ? "Per Clan"
                      : "Max Players"
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
                {formData.maxPlayers &&
                  formData.tournamentType === "clan_battle" && (
                    <p className="mt-1 text-[10px] text-gray-500">
                      Total: {formData.maxPlayers * 2}
                    </p>
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
                  className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-full rounded-lg border px-4 py-3 text-white transition-all hover:border-white/20 focus:ring-2 focus:outline-none"
                  required
                >
                  <option value="" className="bg-dark-card">
                    Select
                  </option>
                  <option value="Silver" className="bg-dark-card">
                    🥈 Silver
                  </option>
                  <option value="Gold" className="bg-dark-card">
                    🥇 Gold
                  </option>
                  <option value="Platinum" className="bg-dark-card">
                    💠 Platinum
                  </option>
                  <option value="Diamond" className="bg-dark-card">
                    💎 Diamond
                  </option>
                  <option value="Master" className="bg-dark-card">
                    👑 Master
                  </option>
                </select>
                {errors.minRank && (
                  <p className="mt-1 text-sm text-red-400">{errors.minRank}</p>
                )}
              </div>
            </div>
          </div>

          {/* Prize Pool */}
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Prize Configuration
            </h3>

            {/* Prize Pool Type Toggle */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, prizePoolType: "fixed" })
                }
                className={`rounded-lg border p-3 text-left transition-all ${
                  formData.prizePoolType === "fixed"
                    ? "border-gold bg-gold/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span className="text-sm font-semibold text-white">
                    Fixed Prize
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Set a guaranteed prize pool amount
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, prizePoolType: "entry-based" })
                }
                className={`rounded-lg border p-3 text-left transition-all ${
                  formData.prizePoolType === "entry-based"
                    ? "border-gold bg-gold/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span className="text-sm font-semibold text-white">
                    Entry Based
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Prize pool grows with each entry fee
                </p>
              </button>
            </div>

            {/* Prize Pool Input */}
            <Input
              label={
                formData.prizePoolType === "fixed"
                  ? "Prize Pool (USD)"
                  : "Max Prize (USD)"
              }
              name="prizePool"
              type="number"
              value={formData.prizePool}
              onChange={handleInputChange}
              placeholder="1000"
              icon="💰"
              error={errors.prizePool}
              required
            />

            {/* Clan Prize Mode Toggle - Only for Clan Battles */}
            {formData.tournamentType === "clan_battle" && (
              <div className="mt-4">
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Prize Distribution Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        clanPrizeMode: "individual",
                      }))
                    }
                    className={`rounded-lg border p-3 text-left transition-all ${
                      formData.clanPrizeMode === "individual"
                        ? "border-gold bg-gold/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🏆</span>
                      <span className="text-sm font-semibold text-white">
                        Individual Ranking
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      Prize split by position (1st, 2nd, 3rd...)
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        clanPrizeMode: "winner_clan",
                      }))
                    }
                    className={`rounded-lg border p-3 text-left transition-all ${
                      formData.clanPrizeMode === "winner_clan"
                        ? "border-gold bg-gold/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span className="text-sm font-semibold text-white">
                        Winning Clan
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      Prize split equally among winning clan
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Prize Split Section - Show for Regular OR Individual Clan Mode */}
            {(formData.tournamentType === "regular" ||
              formData.clanPrizeMode === "individual") && (
              <div className="mt-4">
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Prize Distribution
                </label>

                {/* Top 3 - Simple Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* 1st Place */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span>🥇</span>
                      <span className="text-sm text-gray-400">1st Place</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="prizeSplitFirst"
                        value={formData.prizeSplitFirst}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        max="99"
                        className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-full rounded-lg border px-3 py-2.5 pr-8 text-center font-semibold text-white transition-all focus:ring-2 focus:outline-none"
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="text-gold mt-1 text-center text-sm font-medium">
                      $
                      {Math.floor(
                        ((parseInt(formData.prizePool) || 0) *
                          (parseInt(formData.prizeSplitFirst) || 0)) /
                          100,
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* 2nd Place */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span>🥈</span>
                      <span className="text-sm text-gray-400">2nd Place</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="prizeSplitSecond"
                        value={formData.prizeSplitSecond}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        max="99"
                        className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-full rounded-lg border px-3 py-2.5 pr-8 text-center font-semibold text-white transition-all focus:ring-2 focus:outline-none"
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="text-gold mt-1 text-center text-sm font-medium">
                      $
                      {Math.floor(
                        ((parseInt(formData.prizePool) || 0) *
                          (parseInt(formData.prizeSplitSecond) || 0)) /
                          100,
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* 3rd Place */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span>🥉</span>
                      <span className="text-sm text-gray-400">3rd Place</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="prizeSplitThird"
                        value={formData.prizeSplitThird}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        max="99"
                        className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-full rounded-lg border px-3 py-2.5 pr-8 text-center font-semibold text-white transition-all focus:ring-2 focus:outline-none"
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="text-gold mt-1 text-center text-sm font-medium">
                      $
                      {Math.floor(
                        ((parseInt(formData.prizePool) || 0) *
                          (parseInt(formData.prizeSplitThird) || 0)) /
                          100,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {errors.prizeSplit && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.prizeSplit}
                  </p>
                )}

                {/* Remaining Prize Pool */}
                {(() => {
                  const first = parseInt(formData.prizeSplitFirst) || 0;
                  const second = parseInt(formData.prizeSplitSecond) || 0;
                  const third = parseInt(formData.prizeSplitThird) || 0;
                  const remaining = 100 - first - second - third;
                  const additionalPos =
                    parseInt(formData.additionalPrizePositions) || 0;
                  const perPosition =
                    additionalPos > 0 ? remaining / additionalPos : 0;
                  const prizePool = parseInt(formData.prizePool) || 0;
                  const maxPlayers = parseInt(formData.maxPlayers) || 0;
                  const maxAllowedWinners = Math.max(0, maxPlayers - 3);
                  const remainingAmount = Math.floor(
                    (prizePool * remaining) / 100,
                  );
                  const perPositionAmount = Math.floor(
                    (prizePool * perPosition) / 100,
                  );

                  return (
                    <div className="mt-5 rounded-lg bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="block text-sm font-medium text-gray-300">
                          Remaining Prize Pool
                        </span>
                        <div className="text-right">
                          <span className="text-gold text-lg font-bold">
                            ${remainingAmount.toLocaleString()}
                          </span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({remaining}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">
                          Split among
                        </span>
                        <input
                          type="number"
                          name="additionalPrizePositions"
                          value={formData.additionalPrizePositions}
                          onChange={handleInputChange}
                          onWheel={(e) => e.target.blur()}
                          min="0"
                          max={maxAllowedWinners}
                          className="border-gold-dark/30 bg-dark-gray-card focus:border-gold focus:ring-gold/20 w-16 rounded-lg border px-2 py-1.5 text-center font-semibold text-white transition-all focus:ring-1 focus:outline-none"
                        />
                        <span className="text-sm text-gray-300">
                          winners
                          {maxPlayers > 0 && (
                            <span className="text-gray-500">
                              {" "}
                              (max {maxAllowedWinners})
                            </span>
                          )}
                        </span>
                        {additionalPos > 0 && (
                          <span className="text-sm text-gray-500">
                            (4th - {3 + additionalPos}th place)
                          </span>
                        )}
                      </div>

                      {additionalPos > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Each gets:</span>
                          <span className="text-gold font-semibold">
                            ${perPositionAmount.toLocaleString()}
                          </span>
                          <span className="text-gray-500">
                            ({perPosition.toFixed(1)}%)
                          </span>
                        </div>
                      )}

                      {errors.additionalPrizePositions && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.additionalPrizePositions}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Winner Clan Prize Display - Only for Clan Battles with winner_clan mode */}
            {formData.tournamentType === "clan_battle" &&
              formData.clanPrizeMode === "winner_clan" && (
                <div className="mt-4 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        Winner Takes All
                      </h4>
                      <p className="text-sm text-gray-400">
                        100% prize pool split equally among winning clan members
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Each winner gets:</span>
                    <span className="text-gold text-lg font-bold">
                      $
                      {Math.floor(
                        (parseInt(formData.prizePool) || 0) /
                          (parseInt(formData.maxPlayers) || 1),
                      ).toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      (${(parseInt(formData.prizePool) || 0).toLocaleString()} ÷{" "}
                      {parseInt(formData.maxPlayers) || 0} players)
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* Entry Fee */}
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                Entry Fee
              </h3>
              {/* <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-purple-400/20 bg-purple-500/10 px-2.5 py-1.5">
                  <input
                    type="checkbox"
                    checked={formData.acceptsTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, acceptsTickets: e.target.checked, entryFee: 0 })
                    }
                    className="h-3.5 w-3.5 rounded border-purple-400/30 text-purple-500"
                  />
                  <span className="text-sm font-medium text-white">🎫 Ticket Mode</span>
                </label> */}
            </div>

            {formData.acceptsTickets ? (
              <div className="grid grid-cols-3 gap-2">
                {entryPriceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, entryFee: option.value })
                    }
                    className={`relative rounded-lg border-2 p-2.5 text-center transition-all ${
                      formData.entryFee === option.value
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-purple-400/20 hover:border-purple-400/40"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
                      🎫 {option.label}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {option.diamonds_equivalent} 💎
                    </p>
                    {formData.entryFee === option.value && (
                      <div className="absolute -top-1 -right-1">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[8px] font-bold text-white">
                          ✓
                        </div>
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
                <span
                  className={`mb-2.5 text-sm ${formData.entryFee > 0 ? "text-green-400" : "text-gray-500"}`}
                >
                  {formData.entryFee > 0
                    ? `✓ ${formData.entryFee} ${PRIMARY_CURRENCY === "USD" ? "$" : "💎"}`
                    : "Free entry"}
                </span>
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                Tournament Rules
              </h3>
              <span
                className={`text-sm ${formData.rules.length >= 20 ? "text-green-400" : "text-gray-500"}`}
              >
                {formData.rules.length >= 20
                  ? "✓ Valid"
                  : `${formData.rules.length}/20`}
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
          <div className="bg-dark-primary/95 sticky bottom-0 z-10 -mx-3 -mb-4 border-t border-white/5 p-3 backdrop-blur-xl sm:relative sm:mx-0 sm:mb-0 sm:rounded-xl sm:border sm:bg-gradient-to-b sm:from-white/5 sm:to-transparent sm:p-4">
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
                className="border-gold from-gold shadow-gold/20 hover:shadow-gold/30 flex-[2] rounded-lg border bg-gradient-to-r to-yellow-600 px-4 py-2.5 text-sm font-semibold text-black shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
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
