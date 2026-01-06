"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { tournamentsApi } from "../../lib/api";
import { selectTournamentIcon } from "../../lib/iconSelector";
import { useUser } from "../../contexts/UserContext";
import { getClanOptions, initializeClans } from "../../lib/clans";
import { getEntryPriceOptions } from "../../lib/ticketConfig";
import { CONVERSION_RATE, PRIMARY_CURRENCY } from "../../lib/currencyConfig";
import DatePicker from "../../components/DatePicker";
import TimePicker from "../../components/TimePicker";
import SuccessModal from "../../components/SuccessModal";
import {
  LuGamepad2,
  LuCalendarDays,
  LuTrophy,
  LuCheck,
  LuClock,
  LuTriangleAlert,
  LuSwords,
} from "react-icons/lu";
import { FaTrophy, FaUsers } from "react-icons/fa6";
import {
  TbTarget,
  TbUsersGroup,
  TbMedal,
  TbMoneybag,
  TbDiamond,
} from "react-icons/tb";
import { HiCheckCircle } from "react-icons/hi2";
import { GiCrown, GiSilverBullet } from "react-icons/gi";
import { MdDiamond } from "react-icons/md";
import { FaMedal } from "react-icons/fa6";

// Step definitions
const STEPS = [
  { id: 1, title: "Basics", subtitle: "Name & Format", icon: LuGamepad2 },
  { id: 2, title: "Schedule", subtitle: "When & Who", icon: LuCalendarDays },
  { id: 3, title: "Prizes", subtitle: "Rewards", icon: TbMoneybag },
  { id: 4, title: "Review", subtitle: "Confirm", icon: LuCheck },
];

function CreateTournamentContent() {
  const { user } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTournamentTitle, setCreatedTournamentTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    game: "Force of Rune",
    tournamentType: "regular",
    acceptsTickets: false,
    clanBattleMode: "auto_division",
    clanPrizeMode: "individual",
    clan1_id: "",
    clan2_id: "",
    date: "",
    time: "",
    maxPlayers: "100",
    minRank: "",
    prizePoolType: "fixed",
    prizePool: "",
    prizeSplitFirst: 10,
    prizeSplitSecond: 7,
    prizeSplitThird: 5,
    additionalPrizePositions: 12,
    entryFee: 0,
    rules: "",
  });

  const clanPlayerOptions = [12, 18, 24, 30];
  const [clanOptions, setClanOptions] = useState([]);
  const entryPriceOptions = useMemo(() => getEntryPriceOptions(), []);

  // Generate future date (3 days from now)
  const getFutureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  };

  // Dev presets
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
      maxPlayers: "100",
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
    clanBattle: {
      title: "⚔️ Clan Wars Championship",
      game: "Force of Rune",
      tournamentType: "clan_battle",
      acceptsTickets: false,
      clanBattleMode: "auto_division",
      clanPrizeMode: "individual",
      clan1_id: "",
      clan2_id: "",
      date: getFutureDate(),
      time: "19:00",
      maxPlayers: "18",
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
  };

  const fillPreset = (presetKey) => {
    const preset = devPresets[presetKey];
    if (preset) {
      if (presetKey.includes("Selection") && clanOptions.length >= 2) {
        preset.clan1_id = clanOptions[0]?.value || "";
        preset.clan2_id = clanOptions[1]?.value || "";
      }
      setFormData(preset);
      setErrors({});
    }
  };

  useEffect(() => {
    initializeClans();
    setClanOptions(getClanOptions());
  }, []);

  // Validation
  const validateField = (name, value, data = formData) => {
    const currentData = { ...data, [name]: value };

    switch (name) {
      case "title":
        if (!value.trim()) return "Tournament title is required";
        return "";
      case "date":
        if (!value) return "Tournament date is required";
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return "Date cannot be in the past";
        return "";
      case "time":
        if (!value) return "Tournament time is required";
        return "";
      case "maxPlayers":
        const maxPlayers = parseInt(value);
        if (currentData.tournamentType === "regular") {
          if (!value || maxPlayers < 10) return "Minimum 10 players required";
          if (maxPlayers > 100) return "Maximum 100 players allowed";
        } else if (currentData.tournamentType === "clan_battle") {
          if (!value || !clanPlayerOptions.includes(maxPlayers)) {
            return "Please select a valid player count";
          }
        }
        return "";
      case "minRank":
        if (!value) return "Minimum rank is required";
        return "";
      case "clan1_id":
        if (
          currentData.tournamentType === "clan_battle" &&
          currentData.clanBattleMode === "clan_selection"
        ) {
          if (!value) return "First clan is required";
        }
        return "";
      case "clan2_id":
        if (
          currentData.tournamentType === "clan_battle" &&
          currentData.clanBattleMode === "clan_selection"
        ) {
          if (!value) return "Second clan is required";
          if (currentData.clan1_id && value === currentData.clan1_id) {
            return "Clans must be different";
          }
        }
        return "";
      case "prizePool":
        const prizePool = parseInt(value);
        if (!value || prizePool < 1) return "Minimum prize pool is $1";
        if (prizePool > 10000) return "Maximum prize pool is $10,000";
        return "";
      case "prizeSplitFirst":
      case "prizeSplitSecond":
      case "prizeSplitThird":
        const first =
          parseInt(
            name === "prizeSplitFirst" ? value : currentData.prizeSplitFirst,
          ) || 0;
        const second =
          parseInt(
            name === "prizeSplitSecond" ? value : currentData.prizeSplitSecond,
          ) || 0;
        const third =
          parseInt(
            name === "prizeSplitThird" ? value : currentData.prizeSplitThird,
          ) || 0;
        if (first + second + third >= 100)
          return "Top 3 split must be less than 100%";
        return "";
      case "additionalPrizePositions":
        const positions = parseInt(value) || 0;
        const players = parseInt(currentData.maxPlayers) || 0;
        const maxAllowed = Math.max(0, players - 3);
        if (positions < 0) return "Cannot be negative";
        if (players > 0 && positions > maxAllowed)
          return `Max ${maxAllowed} winners allowed`;
        const topThree =
          (parseInt(currentData.prizeSplitFirst) || 0) +
          (parseInt(currentData.prizeSplitSecond) || 0) +
          (parseInt(currentData.prizeSplitThird) || 0);
        if (positions > 0) {
          const perPos = (100 - topThree) / positions;
          if (perPos < 0.1) return "Too many positions";
        }
        return "";
      case "entryFee":
        const fee = parseFloat(value);
        if (fee < 0) return "Entry fee cannot be negative";
        if (fee > 10000) return "Maximum entry fee is $10,000";
        return "";
      case "rules":
        if (!value.trim()) return "Tournament rules are required";
        if (value.length < 20)
          return `${20 - value.length} more characters needed`;
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (
      name === "prizeSplitFirst" ||
      name === "prizeSplitSecond" ||
      name === "prizeSplitThird"
    ) {
      setErrors((prev) => ({ ...prev, prizeSplit: error }));
    }
    if (name === "clan1_id") {
      const clan2Error = validateField("clan2_id", formData.clan2_id, {
        ...formData,
        [name]: value,
      });
      setErrors((prev) => ({ ...prev, clan2_id: clan2Error }));
    }
    if (name === "maxPlayers") {
      const posError = validateField(
        "additionalPrizePositions",
        formData.additionalPrizePositions,
        { ...formData, [name]: value },
      );
      setErrors((prev) => ({ ...prev, additionalPrizePositions: posError }));
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};

    if (step === 1) {
      ["title"].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) stepErrors[field] = error;
      });
      if (
        formData.tournamentType === "clan_battle" &&
        formData.clanBattleMode === "clan_selection"
      ) {
        ["clan1_id", "clan2_id"].forEach((field) => {
          const error = validateField(field, formData[field]);
          if (error) stepErrors[field] = error;
        });
      }
    }

    if (step === 2) {
      ["date", "time", "minRank"].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) stepErrors[field] = error;
      });
      const error = validateField("maxPlayers", formData.maxPlayers);
      if (error) stepErrors.maxPlayers = error;
    }

    if (step === 3) {
      const prizeError = validateField("prizePool", formData.prizePool);
      if (prizeError) stepErrors.prizePool = prizeError;
      const rulesError = validateField("rules", formData.rules);
      if (rulesError) stepErrors.rules = rulesError;

      if (
        formData.tournamentType === "regular" ||
        formData.clanPrizeMode === "individual"
      ) {
        [
          "prizeSplitFirst",
          "prizeSplitSecond",
          "prizeSplitThird",
          "additionalPrizePositions",
        ].forEach((field) => {
          const error = validateField(field, formData[field]);
          if (error) stepErrors[field] = error;
        });
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only allow submission from step 4 (Review)
    if (currentStep !== 4) {
      return;
    }

    // Validate all steps before submitting
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      // If validation fails, go to the first step with errors
      if (!validateStep(1)) setCurrentStep(1);
      else if (!validateStep(2)) setCurrentStep(2);
      else if (!validateStep(3)) setCurrentStep(3);
      return;
    }

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
        max_players:
          formData.tournamentType === "clan_battle"
            ? parseInt(formData.maxPlayers) * 2
            : parseInt(formData.maxPlayers),
        max_players_per_clan:
          formData.tournamentType === "clan_battle"
            ? parseInt(formData.maxPlayers)
            : null,
        clan_prize_mode:
          formData.tournamentType === "clan_battle"
            ? formData.clanPrizeMode
            : null,
        min_rank: formData.minRank,
        prize_pool_type: formData.prizePoolType,
        prize_pool:
          parseInt(formData.prizePool) * CONVERSION_RATE.USD_TO_DIAMOND,
        prize_pool_usd: parseInt(formData.prizePool),
        prize_split_first: parseInt(formData.prizeSplitFirst),
        prize_split_second: parseInt(formData.prizeSplitSecond),
        prize_split_third: parseInt(formData.prizeSplitThird),
        additional_prize_positions:
          parseInt(formData.additionalPrizePositions) || 0,
        entry_fee:
          parseFloat(formData.entryFee) * CONVERSION_RATE.USD_TO_DIAMOND,
        entry_fee_usd: parseFloat(formData.entryFee),
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
        setCreatedTournamentTitle(formData.title);
        setShowSuccessModal(true);
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

  // Calculate prize amounts
  const prizePool = parseInt(formData.prizePool) || 0;
  const firstPrize = Math.floor((prizePool * formData.prizeSplitFirst) / 100);
  const secondPrize = Math.floor((prizePool * formData.prizeSplitSecond) / 100);
  const thirdPrize = Math.floor((prizePool * formData.prizeSplitThird) / 100);
  const remainingPercent =
    100 -
    formData.prizeSplitFirst -
    formData.prizeSplitSecond -
    formData.prizeSplitThird;
  const remainingPrize = Math.floor((prizePool * remainingPercent) / 100);

  // Rank options with icons
  const rankOptions = [
    { value: "Silver", icon: GiSilverBullet, label: "Silver" },
    { value: "Gold", icon: FaTrophy, label: "Gold" },
    { value: "Platinum", icon: TbDiamond, label: "Platinum" },
    { value: "Diamond", icon: MdDiamond, label: "Diamond" },
    { value: "Master", icon: GiCrown, label: "Master" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000a1] to-[#0a0a0f36]">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push("/host/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <span>←</span>
            <span>Dashboard</span>
          </button>
          <h1 className="text-lg font-semibold text-white">
            Create Tournament
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Dev Toggle */}
        {!showDevPanel && (
          <button
            onClick={() => setShowDevPanel(true)}
            className="mb-4 text-xs text-purple-400/40 hover:text-purple-400"
          >
            <LuGamepad2 className="mr-1 inline h-3 w-3" />
            Dev
          </button>
        )}

        {/* Dev Panel */}
        {showDevPanel && (
          <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-purple-300">
                Quick Fill
              </span>
              <button
                onClick={() => setShowDevPanel(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fillPreset("regularFixed")}
                className="flex-1 rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-300 transition-colors hover:bg-purple-500/30"
              >
                Regular Tournament
              </button>
              <button
                onClick={() => fillPreset("clanBattle")}
                className="flex-1 rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-300 transition-colors hover:bg-purple-500/30"
              >
                Clan Battle
              </button>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() =>
                    currentStep > step.id && setCurrentStep(step.id)
                  }
                  disabled={currentStep < step.id}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg transition-all duration-300 ${
                      currentStep === step.id
                        ? "from-gold to-gold-dark shadow-gold/20 bg-gradient-to-r text-black shadow-lg"
                        : currentStep > step.id
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <HiCheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep === step.id
                        ? "text-gold"
                        : currentStep > step.id
                          ? "text-green-400"
                          : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 w-8 transition-colors duration-300 sm:w-16 ${
                      currentStep > step.id ? "bg-green-500/50" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-6 backdrop-blur">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">
                    Tournament Basics
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Give your tournament a name and choose the format
                  </p>
                </div>

                {/* Tournament Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Tournament Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Friday Night Showdown"
                    className={`w-full rounded-xl border ${
                      errors.title ? "border-red-500" : "border-white/10"
                    } focus:border-gold bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 transition-colors focus:outline-none`}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Tournament Format */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-300">
                    Tournament Format <span className="text-gold">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          tournamentType: "regular",
                          maxPlayers: "100",
                        })
                      }
                      className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                        formData.tournamentType === "regular"
                          ? "border-gold bg-gold/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        <FaTrophy className="text-gold h-8 w-8" />
                      </div>
                      <div className="font-semibold text-white">FOR Chess</div>
                      <div className="mt-1 text-xs text-gray-400">
                        Individual competition
                      </div>
                      {formData.tournamentType === "regular" && (
                        <div className="bg-gold absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full">
                          <HiCheckCircle className="h-3 w-3 text-black" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          tournamentType: "clan_battle",
                          maxPlayers: "12",
                        })
                      }
                      className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                        formData.tournamentType === "clan_battle"
                          ? "border-gold bg-gold/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        <LuSwords className="text-gold h-8 w-8" />
                      </div>
                      <div className="font-semibold text-white">
                        Clan Battle
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Team vs Team
                      </div>
                      {formData.tournamentType === "clan_battle" && (
                        <div className="bg-gold absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full">
                          <HiCheckCircle className="h-3 w-3 text-black" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Clan Battle Options */}
                {formData.tournamentType === "clan_battle" && (
                  <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Team Assignment
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              clanBattleMode: "auto_division",
                            })
                          }
                          className={`rounded-xl border p-3 text-center text-sm transition-all ${
                            formData.clanBattleMode === "auto_division"
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <TbTarget className="mr-1.5 inline h-4 w-4" />
                          Auto Balance
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              clanBattleMode: "clan_selection",
                            })
                          }
                          className={`rounded-xl border p-3 text-center text-sm transition-all ${
                            formData.clanBattleMode === "clan_selection"
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <TbUsersGroup className="mr-1.5 inline h-4 w-4" />
                          Select Clans
                        </button>
                      </div>
                    </div>

                    {formData.clanBattleMode === "clan_selection" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-400">
                            Team A
                          </label>
                          <select
                            name="clan1_id"
                            value={formData.clan1_id}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border ${errors.clan1_id ? "border-red-500" : "border-white/10"} bg-white/5 px-3 py-2.5 text-sm text-white`}
                          >
                            <option value="">Select clan</option>
                            {clanOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {errors.clan1_id && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.clan1_id}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-400">
                            Team B
                          </label>
                          <select
                            name="clan2_id"
                            value={formData.clan2_id}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border ${errors.clan2_id ? "border-red-500" : "border-white/10"} bg-white/5 px-3 py-2.5 text-sm text-white`}
                          >
                            <option value="">Select clan</option>
                            {clanOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {errors.clan2_id && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.clan2_id}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Prize Distribution
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              clanPrizeMode: "individual",
                            })
                          }
                          className={`rounded-xl border p-3 text-center text-sm transition-all ${
                            formData.clanPrizeMode === "individual"
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <TbMedal className="mr-1.5 inline h-4 w-4" />
                          Individual Ranking
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              clanPrizeMode: "winner_clan",
                            })
                          }
                          className={`rounded-xl border p-3 text-center text-sm transition-all ${
                            formData.clanPrizeMode === "winner_clan"
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <FaTrophy className="mr-1.5 inline h-4 w-4" />
                          Winner Clan Takes All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Schedule & Players */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">
                    Schedule & Players
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Set when it starts and who can join
                  </p>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Date <span className="text-gold">*</span>
                    </label>
                    <DatePicker
                      selectedDate={
                        formData.date
                          ? new Date(formData.date + "T00:00:00")
                          : null
                      }
                      onDateChange={(date) => {
                        if (date) {
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const d = String(date.getDate()).padStart(2, "0");
                          setFormData((prev) => ({
                            ...prev,
                            date: `${y}-${m}-${d}`,
                          }));
                          setErrors((prev) => ({ ...prev, date: "" }));
                        }
                      }}
                      placeholder="Pick a date"
                    />
                    {errors.date && (
                      <p className="mt-1.5 text-sm text-red-400">
                        {errors.date}
                      </p>
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
                        setErrors((prev) => ({ ...prev, time: "" }));
                      }}
                      placeholder="Pick a time"
                    />
                    {errors.time && (
                      <p className="mt-1.5 text-sm text-red-400">
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                {/* Max Players */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {formData.tournamentType === "clan_battle"
                      ? "Players Per Team"
                      : "Max Players"}{" "}
                    <span className="text-gold">*</span>
                  </label>
                  {formData.tournamentType === "clan_battle" ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const idx = clanPlayerOptions.indexOf(
                            parseInt(formData.maxPlayers),
                          );
                          if (idx > 0)
                            setFormData({
                              ...formData,
                              maxPlayers: String(clanPlayerOptions[idx - 1]),
                            });
                        }}
                        disabled={
                          parseInt(formData.maxPlayers) === clanPlayerOptions[0]
                        }
                        className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 text-2xl font-bold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        −
                      </button>
                      <div className="border-gold/30 bg-gold/10 flex flex-1 items-center justify-center rounded-xl border py-4">
                        <span className="text-gold text-3xl font-bold">
                          {formData.maxPlayers}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">
                          per team
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = clanPlayerOptions.indexOf(
                            parseInt(formData.maxPlayers),
                          );
                          if (idx < clanPlayerOptions.length - 1)
                            setFormData({
                              ...formData,
                              maxPlayers: String(clanPlayerOptions[idx + 1]),
                            });
                        }}
                        disabled={
                          parseInt(formData.maxPlayers) ===
                          clanPlayerOptions[clanPlayerOptions.length - 1]
                        }
                        className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 text-2xl font-bold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="maxPlayers"
                      value={formData.maxPlayers}
                      onChange={handleInputChange}
                      min={10}
                      max={100}
                      className={`w-full rounded-xl border ${errors.maxPlayers ? "border-red-500" : "border-white/10"} focus:border-gold bg-white/5 px-4 py-3.5 text-white focus:outline-none`}
                    />
                  )}
                  {formData.tournamentType === "clan_battle" && (
                    <p className="mt-2 text-center text-sm text-gray-500">
                      Total players:{" "}
                      <span className="text-gold font-medium">
                        {parseInt(formData.maxPlayers) * 2}
                      </span>
                    </p>
                  )}
                  {errors.maxPlayers && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.maxPlayers}
                    </p>
                  )}
                </div>

                {/* Min Rank */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Minimum Rank <span className="text-gold">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {rankOptions.map((rank) => (
                      <button
                        key={rank.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, minRank: rank.value });
                          setErrors((prev) => ({ ...prev, minRank: "" }));
                        }}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          formData.minRank === rank.value
                            ? "border-gold bg-gold/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-center">
                          <rank.icon className="text-gold h-5 w-5" />
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400">
                          {rank.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.minRank && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.minRank}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Prizes & Rules */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">
                    Prizes & Entry
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Set up the prize pool and entry fee
                  </p>
                </div>

                {/* Prize Pool */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Prize Pool (USD) <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-lg text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      name="prizePool"
                      value={formData.prizePool}
                      onChange={handleInputChange}
                      placeholder="500"
                      className={`w-full rounded-xl border ${errors.prizePool ? "border-red-500" : "border-white/10"} focus:border-gold bg-white/5 py-3.5 pr-4 pl-10 text-white focus:outline-none`}
                    />
                  </div>
                  {errors.prizePool && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.prizePool}
                    </p>
                  )}
                </div>

                {/* Prize Distribution Preview - Only for individual prize mode */}
                {prizePool > 0 &&
                  (formData.tournamentType === "regular" ||
                    formData.clanPrizeMode === "individual") && (
                    <div className="from-gold/5 to-gold-dark/5 rounded-xl border border-white/10 bg-gradient-to-br p-4">
                      <div className="mb-3 text-sm text-gray-400">
                        Prize Distribution
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <FaMedal className="text-gold h-5 w-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                name="prizeSplitFirst"
                                value={formData.prizeSplitFirst}
                                onChange={handleInputChange}
                                min="0"
                                max="99"
                                className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-sm text-white"
                              />
                              <span className="text-sm text-gray-400">%</span>
                            </div>
                          </div>
                          <span className="text-gold font-semibold">
                            ${firstPrize}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaMedal className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                name="prizeSplitSecond"
                                value={formData.prizeSplitSecond}
                                onChange={handleInputChange}
                                min="0"
                                max="99"
                                className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-sm text-white"
                              />
                              <span className="text-sm text-gray-400">%</span>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-300">
                            ${secondPrize}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaMedal className="h-5 w-5 text-orange-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                name="prizeSplitThird"
                                value={formData.prizeSplitThird}
                                onChange={handleInputChange}
                                min="0"
                                max="99"
                                className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-sm text-white"
                              />
                              <span className="text-sm text-gray-400">%</span>
                            </div>
                          </div>
                          <span className="text-gold-dark font-semibold">
                            ${thirdPrize}
                          </span>
                        </div>
                      </div>
                      {errors.prizeSplit && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.prizeSplit}
                        </p>
                      )}

                      {/* Additional Prize Positions */}
                      {remainingPercent > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                              Remaining{" "}
                              <span className="text-gold">
                                ${remainingPrize}
                              </span>{" "}
                              ({remainingPercent}%)
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Split among
                              </span>
                              <input
                                type="number"
                                name="additionalPrizePositions"
                                value={formData.additionalPrizePositions}
                                onChange={handleInputChange}
                                min="0"
                                max={Math.max(
                                  0,
                                  parseInt(formData.maxPlayers) - 3,
                                )}
                                className="w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-sm text-white"
                              />
                              <span className="text-xs text-gray-500">
                                players
                              </span>
                            </div>
                          </div>
                          {formData.additionalPrizePositions > 0 && (
                            <p className="mt-2 text-xs text-gray-500">
                              4th-
                              {3 + parseInt(formData.additionalPrizePositions)}
                              th place: $
                              {Math.floor(
                                remainingPrize /
                                  formData.additionalPrizePositions,
                              )}{" "}
                              each
                            </p>
                          )}
                          {errors.additionalPrizePositions && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.additionalPrizePositions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* Winner Clan Prize Info */}
                {formData.tournamentType === "clan_battle" &&
                  formData.clanPrizeMode === "winner_clan" &&
                  prizePool > 0 && (
                    <div className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                          <FaTrophy className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            Winner Takes All
                          </h4>
                          <p className="text-sm text-gray-400">
                            Prize split equally among winning clan members
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <span className="text-gray-400">
                          Each winner gets:{" "}
                        </span>
                        <span className="text-lg font-bold text-green-400">
                          $
                          {Math.floor(
                            prizePool / parseInt(formData.maxPlayers),
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Entry Fee */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Entry Fee (USD)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 5, 10, 25, 50].map((fee) => (
                      <button
                        key={fee}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, entryFee: fee })
                        }
                        className={`rounded-xl border py-3 text-center transition-all ${
                          formData.entryFee === fee
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {fee === 0 ? "Free" : `$${fee}`}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      name="entryFee"
                      value={formData.entryFee}
                      onChange={handleInputChange}
                      placeholder="Custom amount"
                      min={0}
                      className="focus:border-gold w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Rules <span className="text-gold">*</span>
                    </label>
                    <span
                      className={`text-xs ${formData.rules.length >= 20 ? "text-green-400" : "text-gray-500"}`}
                    >
                      {formData.rules.length >= 20 ? (
                        <span className="flex items-center gap-1">
                          <HiCheckCircle className="h-3 w-3" />
                          Good
                        </span>
                      ) : (
                        `${formData.rules.length}/20`
                      )}
                    </span>
                  </div>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="1. Be online 15 minutes before start&#10;2. No cheating or exploits&#10;3. Respect all players"
                    className={`w-full resize-none rounded-xl border ${errors.rules ? "border-red-500" : "border-white/10"} focus:border-gold bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none`}
                  />
                  {errors.rules && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.rules}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">
                    Review & Create
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Make sure everything looks good
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Tournament Info Card */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="from-gold/20 to-gold-dark/20 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
                        {formData.tournamentType === "regular" ? (
                          <FaTrophy className="text-gold h-6 w-6" />
                        ) : (
                          <LuSwords className="text-gold h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {formData.title || "Untitled Tournament"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formData.tournamentType === "regular"
                            ? "FOR Chess"
                            : "Clan Battle"}{" "}
                          • {formData.game}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-gray-500">Date & Time</div>
                      <div className="mt-1 font-medium text-white">
                        {formData.date
                          ? new Date(formData.date).toLocaleDateString()
                          : "—"}{" "}
                        at {formData.time || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-gray-500">Players</div>
                      <div className="mt-1 font-medium text-white">
                        {formData.tournamentType === "clan_battle"
                          ? `${formData.maxPlayers} per team (${parseInt(formData.maxPlayers) * 2} total)`
                          : `${formData.maxPlayers} max`}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-gray-500">Min Rank</div>
                      <div className="mt-1 flex items-center gap-1.5 font-medium text-white">
                        {(() => {
                          const rank = rankOptions.find(
                            (r) => r.value === formData.minRank,
                          );
                          const RankIcon = rank?.icon;
                          return RankIcon ? (
                            <>
                              <RankIcon className="text-gold h-4 w-4" />
                              {formData.minRank}
                            </>
                          ) : (
                            "—"
                          );
                        })()}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-gray-500">Entry Fee</div>
                      <div className="mt-1 font-medium text-white">
                        {formData.entryFee > 0
                          ? `$${formData.entryFee}`
                          : "Free"}
                      </div>
                    </div>
                  </div>

                  {/* Clan Battle Specific Details */}
                  {formData.tournamentType === "clan_battle" && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 text-sm font-semibold text-gray-300">
                        Clan Battle Settings
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">
                            Team Assignment
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white">
                            {formData.clanBattleMode === "auto_division" ? (
                              <>
                                <TbTarget className="text-gold h-4 w-4" />
                                Auto Division
                              </>
                            ) : (
                              <>
                                <TbUsersGroup className="text-gold h-4 w-4" />
                                Clan Selection
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Prize Distribution
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white">
                            {formData.clanPrizeMode === "individual" ? (
                              <>
                                <TbMedal className="text-gold h-4 w-4" />
                                Individual Ranking
                              </>
                            ) : (
                              <>
                                <FaTrophy className="text-gold h-4 w-4" />
                                Winner Clan Takes All
                              </>
                            )}
                          </div>
                        </div>
                        {formData.clanBattleMode === "clan_selection" && (
                          <>
                            <div>
                              <div className="text-xs text-gray-500">
                                Team A
                              </div>
                              <div className="mt-1 text-sm font-medium text-white">
                                {clanOptions.find(
                                  (c) => c.value === formData.clan1_id,
                                )?.label || "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">
                                Team B
                              </div>
                              <div className="mt-1 text-sm font-medium text-white">
                                {clanOptions.find(
                                  (c) => c.value === formData.clan2_id,
                                )?.label || "—"}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prize Pool Details */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-300">
                        Prize Pool Details
                      </div>
                      <div className="text-xs text-gray-500">
                        {formData.prizePoolType === "fixed"
                          ? "Fixed Prize"
                          : "Entry-Based"}
                      </div>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <TbMoneybag className="text-gold h-5 w-5" />
                      <div>
                        <div className="text-xs text-gray-500">
                          Total Prize Pool
                        </div>
                        <div className="text-gold text-lg font-bold">
                          ${formData.prizePool || 0} USD
                        </div>
                      </div>
                    </div>

                    {/* Prize Distribution */}
                    {(formData.tournamentType === "regular" ||
                      formData.clanPrizeMode === "individual") && (
                      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                        <div className="text-xs font-medium text-gray-400">
                          Prize Distribution
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                            <div className="flex items-center gap-1.5">
                              <FaMedal className="text-gold h-4 w-4" />
                              <span className="text-xs text-gray-500">
                                1st Place
                              </span>
                            </div>
                            <div className="text-gold mt-1 text-sm font-semibold">
                              ${firstPrize}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({formData.prizeSplitFirst}%)
                            </div>
                          </div>
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                            <div className="flex items-center gap-1.5">
                              <FaMedal className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                2nd Place
                              </span>
                            </div>
                            <div className="mt-1 text-sm font-semibold text-gray-300">
                              ${secondPrize}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({formData.prizeSplitSecond}%)
                            </div>
                          </div>
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                            <div className="flex items-center gap-1.5">
                              <FaMedal className="h-4 w-4 text-orange-400" />
                              <span className="text-xs text-gray-500">
                                3rd Place
                              </span>
                            </div>
                            <div className="mt-1 text-sm font-semibold text-orange-400">
                              ${thirdPrize}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({formData.prizeSplitThird}%)
                            </div>
                          </div>
                        </div>
                        {formData.additionalPrizePositions > 0 && (
                          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Additional Winners (4th -{" "}
                                {3 +
                                  parseInt(formData.additionalPrizePositions)}
                                th)
                              </div>
                              <div className="text-sm font-medium text-white">
                                {formData.additionalPrizePositions} positions
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              ${remainingPrize} split equally ($
                              {Math.floor(
                                remainingPrize /
                                  formData.additionalPrizePositions,
                              )}{" "}
                              each)
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Winner Clan Prize Info */}
                    {formData.tournamentType === "clan_battle" &&
                      formData.clanPrizeMode === "winner_clan" && (
                        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                          <div className="flex items-center gap-2">
                            <FaTrophy className="h-5 w-5 text-green-400" />
                            <div className="text-sm font-semibold text-white">
                              Winner Clan Takes All
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-300">
                            Prize pool split equally among winning clan members
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-gray-400">
                              Each winner gets:{" "}
                            </span>
                            <span className="text-gold font-bold">
                              $
                              {Math.floor(
                                prizePool / parseInt(formData.maxPlayers),
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Rules Preview */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-400">
                        Tournament Rules
                      </div>
                      <div className="text-xs text-gray-500">
                        {formData.rules.length} characters
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap text-gray-300">
                      {formData.rules || "No rules specified"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="flex items-center gap-2 text-sm text-red-400">
                  <LuTriangleAlert className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 rounded-xl border border-white/10 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  ← Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="from-gold to-gold-dark shadow-gold/20 hover:shadow-gold/30 flex-[2] rounded-xl bg-gradient-to-r py-3.5 text-sm font-semibold text-black shadow-lg transition-all"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="from-gold to-gold-dark shadow-gold/20 hover:shadow-gold/30 flex flex-[2] items-center justify-center rounded-xl bg-gradient-to-r py-3.5 text-sm font-semibold text-black shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LuClock className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaTrophy className="h-4 w-4" />
                      Create Tournament
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/host/dashboard");
        }}
        title="Tournament Created!"
        message={`Your tournament "${createdTournamentTitle}" is now live. Players can discover and join it.`}
        emoji="🏆"
        buttonText="Go to Dashboard"
        autoClose={true}
        autoCloseDelay={4000}
      />
    </div>
  );
}

export default function CreateTournamentPage() {
  return (
    <ProtectedRoute requiredRole="host">
      <CreateTournamentContent />
    </ProtectedRoute>
  );
}
