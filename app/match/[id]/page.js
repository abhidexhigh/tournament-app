"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "../../components/Button";
import Tabs from "../../components/Tabs";
import { matchesApi, usersApi } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

// Import match components
import MatchHeader from "../../components/match/MatchHeader";
import LeaderboardTab from "../../components/match/LeaderboardTab";
import MatchDetailsTab from "../../components/match/MatchDetailsTab";
import MatchStatsTab from "../../components/match/MatchStatsTab";

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user } = useUser();

  // State
  const [match, setMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load match data
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        const matchData = await matchesApi.getById(params.id);
        setMatch(matchData);

        if (matchData && matchData.leaderboard) {
          // Load participant information from leaderboard
          const participantsList = await Promise.all(
            matchData.leaderboard.map(async (entry) => {
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
      } catch (error) {
        console.error("Failed to load match:", error);
        setMatch(null);
      } finally {
        setInitialLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  // Show loading state
  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-pulse text-6xl">🎯</div>
          <p className="text-gray-400">Loading match details...</p>
        </div>
      </div>
    );
  }

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
        {/* Back Button */}
        <Link href="/player/dashboard" className="mb-4 inline-block sm:mb-6">
          <Button variant="ghost" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>

        {/* Match Header */}
        <MatchHeader
          match={match}
          user={user}
          playerPerformance={playerPerformance}
        />

        {/* Tabbed Content */}
        <Tabs tabs={tabs} defaultTab="leaderboard" variant="divided" />
      </div>
    </div>
  );
}

