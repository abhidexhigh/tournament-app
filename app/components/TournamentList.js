"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "../contexts/LocaleContext";
import TournamentCard from "./TournamentCard";
import MobileTournamentCard from "./MobileTournamentCard";
import FilterBar from "./FilterBar";
import EmptyState from "./EmptyState";

// Constants for sorting tournaments by automated level
const LEVEL_ORDER = {
  master: 1,
  diamond: 2,
  platinum: 3,
  gold: 4,
};

/**
 * Filter tournament by status based on active tab
 */
const matchesStatus = (tournament, activeTab) => {
  if (activeTab === "all") {
    return ["upcoming", "ongoing", "completed", "cancelled"].includes(
      tournament.status
    );
  }
  return tournament.status === activeTab;
};

/**
 * Filter tournament by display type
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
 */
const matchesDate = (tournament, selectedDate) => {
  if (!selectedDate || !tournament.date) return true;

  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const selectedDateStr = `${year}-${month}-${day}`;

  return tournament.date === selectedDateStr;
};

/**
 * Sort tournaments by automated level
 */
const sortByAutomatedLevel = (a, b) => {
  const levelA = (a.automated_level || "").toLowerCase();
  const levelB = (b.automated_level || "").toLowerCase();

  const orderA = LEVEL_ORDER[levelA] ?? 999;
  const orderB = LEVEL_ORDER[levelB] ?? 999;

  return orderA - orderB;
};

/**
 * Client component for interactive tournament list with filtering
 * Receives server-fetched tournaments as props for instant display
 */
export default function TournamentList({ initialTournaments = [] }) {
  // State for filters
  const [activeTab, setActiveTab] = useState("upcoming");
  const [displayTypeTab, setDisplayTypeTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const t = useTranslations("common");

  /**
   * Memoized filtered and sorted tournaments
   */
  const filteredTournaments = useMemo(() => {
    return initialTournaments
      .filter((tournament) => {
        return (
          matchesStatus(tournament, activeTab) &&
          matchesDisplayType(tournament, displayTypeTab) &&
          matchesSearch(tournament, searchQuery) &&
          matchesDate(tournament, selectedDate)
        );
      })
      .sort(sortByAutomatedLevel);
  }, [initialTournaments, activeTab, displayTypeTab, searchQuery, selectedDate]);

  /**
   * Animation key for tournament list transitions
   */
  const animationKey = useMemo(() => {
    const dateKey = selectedDate?.toISOString() ?? "no-date";
    return `${activeTab}-${displayTypeTab}-${searchQuery}-${dateKey}`;
  }, [activeTab, displayTypeTab, searchQuery, selectedDate]);

  return (
    <>
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
}
