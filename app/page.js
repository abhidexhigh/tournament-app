"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { tournamentsApi } from "./lib/api";
import { useTranslations } from "./contexts/LocaleContext";
import { getClanById } from "./lib/dataLoader";
import TournamentCard from "./components/TournamentCard";
import MobileTournamentCard from "./components/MobileTournamentCard";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import TournamentCardSkeleton from "./components/skeletons/TournamentCardSkeleton";
import MobileTournamentCardSkeleton from "./components/skeletons/MobileTournamentCardSkeleton";
import { LuTriangleAlert } from "react-icons/lu";

// Constants for sorting tournaments by automated level
const LEVEL_ORDER = {
  master: 1,
  diamond: 2,
  platinum: 3,
  gold: 4,
};

/**
 * Filter tournament by status based on active tab
 * @param {Object} tournament - Tournament object
 * @param {string} activeTab - Current active filter tab
 * @returns {boolean}
 */
const matchesStatus = (tournament, activeTab) => {
  if (activeTab === "all") {
    // Show all statuses including cancelled
    return ["upcoming", "ongoing", "completed", "cancelled"].includes(
      tournament.status
    );
  }
  return tournament.status === activeTab;
};

/**
 * Filter tournament by display type
 * @param {Object} tournament - Tournament object
 * @param {string} displayTypeTab - Current display type tab
 * @returns {boolean}
 */
const matchesDisplayType = (tournament, displayTypeTab) => {
  const typeMapping = {
    tournaments: "tournament",
    events: "event",
  };
  return tournament.display_type === typeMapping[displayTypeTab];
};

/**
 * Filter tournament by search query
 * @param {Object} tournament - Tournament object
 * @param {string} searchQuery - Search query string
 * @returns {boolean}
 */
const matchesSearch = (tournament, searchQuery) => {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();
  const searchableFields = [
    tournament.title,
    tournament.game,
    tournament.tournament_type,
  ];

  return searchableFields.some(
    (field) => field && field.toLowerCase().includes(query)
  );
};

/**
 * Filter tournament by selected date
 * @param {Object} tournament - Tournament object
 * @param {Date|null} selectedDate - Selected date filter
 * @returns {boolean}
 */
const matchesDate = (tournament, selectedDate) => {
  if (!selectedDate || !tournament.date) return true;

  // Format selected date to match tournament date format (YYYY-MM-DD)
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const selectedDateStr = `${year}-${month}-${day}`;

  return tournament.date === selectedDateStr;
};

/**
 * Sort tournaments by automated level
 * @param {Object} a - First tournament
 * @param {Object} b - Second tournament
 * @returns {number}
 */
const sortByAutomatedLevel = (a, b) => {
  const levelA = (a.automated_level || "").toLowerCase();
  const levelB = (b.automated_level || "").toLowerCase();

  const orderA = LEVEL_ORDER[levelA] ?? 999;
  const orderB = LEVEL_ORDER[levelB] ?? 999;

  return orderA - orderB;
};

/**
 * Extract unique clan IDs from tournaments that require clan data
 * @param {Array} tournaments - List of tournaments
 * @returns {Set} Set of unique clan IDs
 */
const extractClanIds = (tournaments) => {
  const clanIds = new Set();

  tournaments.forEach((tournament) => {
    const isClanBattle = tournament.tournament_type === "clan_battle";
    const isClanSelection = tournament.clan_battle_mode === "clan_selection";

    if (isClanBattle && isClanSelection) {
      if (tournament.clan1_id) clanIds.add(tournament.clan1_id);
      if (tournament.clan2_id) clanIds.add(tournament.clan2_id);
    }
  });

  return clanIds;
};

/**
 * Load clan data for given clan IDs
 * @param {Set} clanIds - Set of clan IDs to load
 * @returns {Promise<Object>} Map of clan ID to clan data
 */
const loadClanData = async (clanIds) => {
  if (clanIds.size === 0) return {};

  const clanPromises = Array.from(clanIds).map(async (clanId) => {
    try {
      const clan = await getClanById(clanId);
      return [clanId, clan];
    } catch (err) {
      console.warn(`Failed to load clan ${clanId}:`, err);
      return [clanId, null];
    }
  });

  const clanResults = await Promise.all(clanPromises);
  return Object.fromEntries(clanResults.filter(([, clan]) => clan !== null));
};

export default function Home() {
  // State management
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [displayTypeTab, setDisplayTypeTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [clanData, setClanData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hooks
  const t = useTranslations("common");

  /**
   * Load tournaments and associated clan data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tournamentsData = await tournamentsApi.getAll();
      setTournaments(tournamentsData);

      // Load clan data for clan battle tournaments
      const clanIds = extractClanIds(tournamentsData);
      const clanMap = await loadClanData(clanIds);
      setClanData(clanMap);
    } catch (err) {
      console.error("Failed to load tournaments:", err);
      setError("Failed to load tournaments. Please try again later.");
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Memoized filtered and sorted tournaments
   */
  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((tournament) => {
        return (
          matchesStatus(tournament, activeTab) &&
          matchesDisplayType(tournament, displayTypeTab) &&
          matchesSearch(tournament, searchQuery) &&
          matchesDate(tournament, selectedDate)
        );
      })
      .sort(sortByAutomatedLevel);
  }, [tournaments, activeTab, displayTypeTab, searchQuery, selectedDate]);

  /**
   * Animation key for tournament list transitions
   */
  const animationKey = useMemo(() => {
    const dateKey = selectedDate?.toISOString() ?? "no-date";
    return `${activeTab}-${displayTypeTab}-${searchQuery}-${dateKey}`;
  }, [activeTab, displayTypeTab, searchQuery, selectedDate]);

  // Render loading state - fewer skeletons on mobile for faster initial paint
  const renderLoadingState = () => (
    <>
      {/* Desktop Skeletons */}
      <div className="hidden space-y-8 sm:block">
        {[1, 2, 3].map((i) => (
          <TournamentCardSkeleton key={i} />
        ))}
      </div>
      {/* Mobile Skeletons - reduced count for faster initial render */}
      <div className="space-y-3 sm:hidden">
        {[1, 2, 3].map((i) => (
          <MobileTournamentCardSkeleton key={i} />
        ))}
      </div>
    </>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="my-8 flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
        <LuTriangleAlert className="text-2xl text-red-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">
        {t("somethingWentWrong")}
      </h3>
      <p className="mb-6 text-gray-400">{error}</p>
      <button
        onClick={loadData}
        className="rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
      >
        {t("tryAgain")}
      </button>
    </div>
  );

  // Render tournament list
  const renderTournamentList = () => (
    <>
      {/* Desktop View */}
      <div
        className="animate-fadeIn hidden space-y-8 sm:block"
        key={`desktop-${animationKey}`}
      >
        {filteredTournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {/* Mobile View */}
      <div
        className="animate-fadeIn space-y-3 sm:hidden"
        key={`mobile-${animationKey}`}
      >
        {filteredTournaments.map((tournament) => (
          <MobileTournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {/* Empty State */}
      {filteredTournaments.length === 0 && (
        <EmptyState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen">
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto mt-4">
          {/* Filter Bar */}
          <FilterBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            displayTypeTab={displayTypeTab}
            setDisplayTypeTab={setDisplayTypeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          {/* Content States */}
          {error && renderErrorState()}
          {loading && !error && renderLoadingState()}
          {!loading && !error && renderTournamentList()}
        </div>
      </div>
    </div>
  );
}
