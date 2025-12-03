"use client";

import { useState, useEffect } from "react";
import { CompDisplay } from "../comp";
import { PRIMARY_CURRENCY, getPrimaryCurrency } from "../../lib/currencyConfig";

export default function LeaderboardTab({
  leaderboard,
  participants,
  currentPlayerId,
}) {
  const [refs, setRefs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load refs data from compsNew.json
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const response = await fetch("/compsNew.json");
        const data = await response.json();
        setRefs(data.refs);
      } catch (error) {
        console.error("Failed to load comps refs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRefs();
  }, []);

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gold-dark/20 bg-dark-card shadow-lg">
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-dark-secondary shadow-inner">
            <span className="text-6xl">📊</span>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gold-light-text">
            No Leaderboard Data
          </h3>
          <p className="text-sm text-gray-500">
            Leaderboard will be available once the match is completed.
          </p>
        </div>
      </div>
    );
  }

  // Sort leaderboard by position
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => a.position - b.position
  );

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gold-dark/20 bg-dark-card shadow-lg">
        <div className="flex items-center justify-center px-6 py-16">
          <div className="text-center">
            <div className="mb-4 animate-pulse text-5xl">⏳</div>
            <p className="text-sm text-gray-500">Loading compositions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sortedLeaderboard.map((entry) => {
        const isCurrentPlayer = entry.playerId === currentPlayerId;
        return (
          <CompDisplay
            key={entry.playerId}
            playerData={entry}
            refs={refs}
            position={entry.position}
            showPosition={true}
            isHighlighted={isCurrentPlayer}
          />
        );
      })}

      {/* Summary Footer */}
      <div className="rounded-lg border border-gold-dark/20 bg-dark-card px-4 py-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Players:</span>
              <span className="font-bold text-gold-light-text">
                {leaderboard.length}
              </span>
            </div>
            <div className="h-4 w-px bg-gold-dark/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Winner:</span>
              <span className="font-bold text-gold">
                {sortedLeaderboard[0]?.username || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5">
            <span className="text-xs text-gray-500">Total Prize:</span>
            <span className="text-base font-bold text-gold">
              {PRIMARY_CURRENCY === "USD" ? "$" : ""}{leaderboard
                .reduce((sum, entry) => sum + (entry.prizeAmount || 0), 0)
                .toLocaleString()}{PRIMARY_CURRENCY === "DIAMOND" ? " 💎" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
