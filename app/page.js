"use client";

import { useState, useEffect } from "react";
import { tournamentsApi } from "./lib/api";
import { useUser } from "./contexts/UserContext";
import { getClanById } from "./lib/dataLoader";
import TournamentCard from "./components/TournamentCard";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [displayTypeTab, setDisplayTypeTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [clanData, setClanData] = useState({});
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentsData = await tournamentsApi.getAll();

        // Debug: Log automated tournaments
        const automatedTournaments = tournamentsData.filter(
          (t) => t.is_automated,
        );
        if (automatedTournaments.length > 0) {
          console.log(
            "Automated tournaments found:",
            automatedTournaments.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              is_automated: t.is_automated,
              expires_at: t.expires_at,
            })),
          );
        }

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
        const clanPromises = Array.from(clanIds).map(async (clanId) => {
          const clan = await getClanById(clanId);
          return [clanId, clan];
        });

        const clanResults = await Promise.all(clanPromises);
        const clanMap = Object.fromEntries(clanResults);
        setClanData(clanMap);
      } catch (error) {
        console.error("Failed to load tournaments:", error);
        // Show empty state if API fails
        setTournaments([]);
      }
    };

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
        <div className="max-w-main mx-auto mt-8">
          {/* Filter Bar Component */}
          <FilterBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            displayTypeTab={displayTypeTab}
            setDisplayTypeTab={setDisplayTypeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Tournament List */}
          <div className="space-y-8">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>

          {/* Empty State */}
          {filteredTournaments.length === 0 && (
            <EmptyState
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
