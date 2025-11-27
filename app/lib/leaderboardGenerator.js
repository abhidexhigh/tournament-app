// Leaderboard Generator Utilities

/**
 * Generate random leaderboard for completed tournaments
 * @param {Object} tournament - Tournament data
 * @param {Array} participants - Array of participant IDs
 * @param {string} tournamentType - Type of tournament ('regular' or 'clan_battle')
 * @param {string} winningTeam - For clan battle, which team won ('clan1' or 'clan2')
 * @returns {Array} Generated leaderboard entries
 */
export const generateRandomLeaderboard = (
  tournament,
  participants,
  tournamentType = "regular",
  winningTeam = null,
) => {
  if (!participants || participants.length === 0) {
    return [];
  }

  // For clan battle, filter participants by winning team
  let filteredParticipants = participants;
  if (tournamentType === "clan_battle" && winningTeam) {
    // This would need to be implemented based on how team membership is tracked
    // For now, we'll use all participants and simulate team filtering
    filteredParticipants = participants.slice(
      0,
      Math.ceil(participants.length / 2),
    );
  }

  // Generate random scores and stats for each participant
  const leaderboard = filteredParticipants.map((participant, index) => {
    const baseScore = Math.floor(Math.random() * 1000) + 500;
    const kills = Math.floor(Math.random() * 20) + 5;
    const deaths = Math.floor(Math.random() * 10) + 1;
    const kdRatio = (kills / deaths).toFixed(2);

    // Generate performance rating
    const performanceRatings = ["excellent", "good", "average", "poor"];
    const performance =
      performanceRatings[Math.floor(Math.random() * performanceRatings.length)];

    return {
      playerId: participant.id || participant,
      position: index + 1,
      score: baseScore + (filteredParticipants.length - index) * 100, // Higher positions get better scores
      kills: kills,
      deaths: deaths,
      kdRatio: kdRatio,
      performance: performance,
      team: tournamentType === "clan_battle" ? winningTeam : null,
    };
  });

  // Sort by score (highest first)
  return leaderboard
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
};

/**
 * Get performance badge color class
 * @param {string} performance - Performance rating
 * @returns {string} CSS class for badge color
 */
export const getPerformanceBadgeColor = (performance) => {
  switch (performance) {
    case "excellent":
      return "bg-green-500/20 text-green-300 border border-green-500/30";
    case "good":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "average":
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
    case "poor":
      return "bg-red-500/20 text-red-300 border border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
  }
};

/**
 * Get performance emoji
 * @param {string} performance - Performance rating
 * @returns {string} Emoji for performance
 */
export const getPerformanceEmoji = (performance) => {
  switch (performance) {
    case "excellent":
      return "🔥";
    case "good":
      return "⭐";
    case "average":
      return "👍";
    case "poor":
      return "😔";
    default:
      return "❓";
  }
};

/**
 * Format score for display
 * @param {number} score - Score value
 * @returns {string} Formatted score
 */
export const formatScore = (score) => {
  return score.toLocaleString("en-US");
};

/**
 * Get ordinal suffix for position
 * @param {number} position - Position number
 * @returns {string} Ordinal suffix (st, nd, rd, th)
 */
export const getPositionSuffix = (position) => {
  const j = position % 10;
  const k = position % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

/**
 * Generate clan battle leaderboard with team information
 * @param {Object} tournament - Tournament data
 * @param {Array} participants - Array of participant IDs
 * @param {string} winningTeam - Winning team ('clan1' or 'clan2')
 * @returns {Array} Generated leaderboard for winning team only
 */
export const generateClanBattleLeaderboard = (
  tournament,
  participants,
  winningTeam,
) => {
  if (!participants || participants.length === 0) {
    return [];
  }

  // For clan battle, we need to determine which participants belong to the winning team
  // This is a simplified version - in reality, you'd need to check clan membership
  const teamSize = Math.ceil(participants.length / 2);
  const winningTeamParticipants = participants.slice(0, teamSize); // Simplified: first half as winning team

  return generateRandomLeaderboard(
    tournament,
    winningTeamParticipants,
    "clan_battle",
    winningTeam,
  );
};

/**
 * Generate regular tournament leaderboard
 * @param {Object} tournament - Tournament data
 * @param {Array} participants - Array of participant IDs
 * @returns {Array} Generated leaderboard for all participants
 */
export const generateRegularLeaderboard = (tournament, participants) => {
  return generateRandomLeaderboard(tournament, participants, "regular");
};
