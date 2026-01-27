"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./Button";
import Tabs from "./Tabs";
import { usersApi } from "../lib/api";
import { useUser } from "../contexts/UserContext";

// Import match components
import MatchHeader from "./match/MatchHeader";
import LeaderboardTab from "./match/LeaderboardTab";
import MatchDetailsTab from "./match/MatchDetailsTab";
import MatchStatsTab from "./match/MatchStatsTab";

/**
 * Client component for match details page
 * Receives server-fetched match data as initialMatch
 */
export default function MatchDetailsContent({ initialMatch }) {
  const { user } = useUser();

  // State - initialize with server data
  const [match] = useState(initialMatch);
  const [participants, setParticipants] = useState([]);

  // Load participant information
  useEffect(() => {
    const loadParticipants = async () => {
      if (match && match.leaderboard) {
        const participantsList = await Promise.all(
          match.leaderboard.map(async (entry) => {
            try {
              const userData = await usersApi.getById(entry.playerId);
              return {
                ...entry,
                user: userData,
              };
            } catch {
              return {
                ...entry,
                user: null,
              };
            }
          })
        );
        setParticipants(participantsList);
      }
    };

    loadParticipants();
  }, [match]);

  // Show not found state
  if (!match) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎯</div>
          <p className="text-gray-400">Match not found</p>
          <Link href="/player/dashboard" className="mt-4 inline-block">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get player's performance in this match
  const playerPerformance = user
    ? match.leaderboard?.find((entry) => entry.playerId === user.id)
    : null;

  // Define tab content
  const tabs = [
    {
      id: "leaderboard",
      label: "Leaderboard",
      badge: match.leaderboard?.length || null,
      content: (
        <LeaderboardTab
          leaderboard={match.leaderboard || []}
          participants={participants}
          currentPlayerId={user?.id}
        />
      ),
    },
    {
      id: "details",
      label: "Match Details",
      content: <MatchDetailsTab match={match} />,
    },
    {
      id: "stats",
      label: "Your Stats",
      content: (
        <MatchStatsTab
          match={match}
          playerPerformance={playerPerformance}
          user={user}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-8 lg:px-8">
      <div className="max-w-main mx-auto">
        <Link href="/player/dashboard" className="mb-4 inline-block sm:mb-6">
          <Button variant="ghost" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>

        <MatchHeader
          match={match}
          user={user}
          playerPerformance={playerPerformance}
        />

        <Tabs tabs={tabs} defaultTab="leaderboard" variant="divided" />
      </div>
    </div>
  );
}
