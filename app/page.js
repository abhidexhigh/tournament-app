"use client";

import { useState, useEffect } from "react";
import { tournamentsApi } from "./lib/api";
import { useUser } from "./contexts/UserContext";
import { useTranslations } from "./contexts/LocaleContext";
import { getClanById } from "./lib/dataLoader";
import TournamentCard from "./components/TournamentCard";
import MobileTournamentCard from "./components/MobileTournamentCard";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import TournamentCardSkeleton from "./components/skeletons/TournamentCardSkeleton";
import MobileTournamentCardSkeleton from "./components/skeletons/MobileTournamentCardSkeleton";
import { LuTriangleAlert } from "react-icons/lu";

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [displayTypeTab, setDisplayTypeTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [clanData, setClanData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: userLoading } = useUser();
  const t = useTranslations("common");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tournamentsData = await tournamentsApi.getAll();

      // Debug: Log automated tournaments
      const automatedTournaments = tournamentsData.filter(
        (t) => t.is_automated,
      );

      setTournaments(tournamentsData);

      // Load clan data for clan battle tournaments
      const clanIds = new Set();
      tournamentsData.forEach((tournament) => {
        if (
          tournament.tournament_type === "clan_battle" &&
          tournament.clan_battle_mode === "clan_selection"
        ) {
          if (tournament.clan1_id) clanIds.add(tournament.clan1_id);
          if (tournament.clan2_id) clanIds.add(tournament.clan2_id);
        }
      });

      // Load all unique clan IDs
      if (clanIds.size > 0) {
        const clanPromises = Array.from(clanIds).map(async (clanId) => {
          const clan = await getClanById(clanId);
          return [clanId, clan];
        });

        const clanResults = await Promise.all(clanPromises);
        const clanMap = Object.fromEntries(clanResults);
        setClanData(clanMap);
      }
    } catch (error) {
      console.error("Failed to load tournaments:", error);
      setError("Failed to load tournaments. Please try again later.");
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTournaments = tournaments
    .filter((t) => {
      // Only show active tournaments (upcoming or ongoing)
      const isActive = t.status === "upcoming" || t.status === "ongoing";

      // Apply filters
      const statusMatch = activeTab === "all" || t.status === activeTab;
      const displayTypeMatch =
        (displayTypeTab === "tournaments" && t.display_type === "tournament") ||
        (displayTypeTab === "events" && t.display_type === "event");

      // Search filter - check title, game, and tournament type
      const searchMatch =
        searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.game && t.game.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tournament_type &&
          t.tournament_type.toLowerCase().includes(searchQuery.toLowerCase()));

      return isActive && statusMatch && displayTypeMatch && searchMatch;
    })
    .sort((a, b) => {
      // Define the order: Master, Diamond, Platinum, Gold
      const levelOrder = {
        master: 1,
        diamond: 2,
        platinum: 3,
        gold: 4,
      };

      const levelA = (a.automated_level || "").toLowerCase();
      const levelB = (b.automated_level || "").toLowerCase();

      const orderA = levelOrder[levelA] || 999;
      const orderB = levelOrder[levelB] || 999;

      return orderA - orderB;
    });

  return (
    <div className="min-h-screen">
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-main mx-auto mt-4">
          {/* Filter Bar Component */}
          <FilterBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            displayTypeTab={displayTypeTab}
            setDisplayTypeTab={setDisplayTypeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Error State */}
          {error && (
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
          )}

          {/* Loading State */}
          {loading && !error && (
            <>
              {/* Desktop Skeletons */}
              <div className="hidden space-y-8 sm:block">
                {[1, 2, 3].map((i) => (
                  <TournamentCardSkeleton key={i} />
                ))}
              </div>
              {/* Mobile Skeletons */}
              <div className="space-y-3 sm:hidden">
                {[1, 2, 3].map((i) => (
                  <MobileTournamentCardSkeleton key={i} />
                ))}
              </div>
            </>
          )}

          {/* Tournament List */}
          {!loading && !error && (
            <>
              {/* Tournament List - Desktop */}
              <div
                className="animate-fadeIn hidden space-y-8 sm:block"
                key={`desktop-${activeTab}-${displayTypeTab}-${searchQuery}`}
              >
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>

              {/* Tournament List - Mobile */}
              <div
                className="animate-fadeIn space-y-3 sm:hidden"
                key={`mobile-${activeTab}-${displayTypeTab}-${searchQuery}`}
              >
                {filteredTournaments.map((tournament) => (
                  <MobileTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                  />
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
          )}
        </div>
      </div>
    </div>
  );
}
