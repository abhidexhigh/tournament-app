// Prize pool calculation utilities

/**
 * Calculate the actual prize pool for a tournament
 * @param {Object} tournament - Tournament object
 * @returns {number} - Actual prize pool amount
 */
export const calculateActualPrizePool = (tournament) => {
  if (!tournament) return 0;

  // Fixed prize pool - always returns the set amount
  if (tournament.prize_pool_type === "fixed") {
    return tournament.prize_pool;
  }

  // Entry-based prize pool - scales with participants
  if (tournament.prize_pool_type === "entry-based") {
    const participantCount = tournament.participants?.length || 0;
    const maxPlayers = tournament.max_players;

    if (maxPlayers === 0) return 0;

    // Calculate proportional prize pool
    const actualPrizePool = Math.floor(
      (participantCount / maxPlayers) * tournament.prize_pool
    );

    return actualPrizePool;
  }

  // Default to prize pool value if type is not specified (backward compatibility)
  return tournament.prize_pool || tournament.prizePool;
};

/**
 * Calculate individual prize amounts based on prize split
 * @param {Object} tournament - Tournament object
 * @returns {Object} - Prize amounts for 1st, 2nd, 3rd place
 */
export const calculatePrizes = (tournament) => {
  const actualPrizePool = calculateActualPrizePool(tournament);

  // Handle both old and new data structures
  const prizeSplit =
    tournament.prize_split_first !== undefined
      ? {
          first: tournament.prize_split_first,
          second: tournament.prize_split_second,
          third: tournament.prize_split_third,
        }
      : tournament.prizeSplit;

  return {
    first: Math.floor((actualPrizePool * prizeSplit.first) / 100),
    second: Math.floor((actualPrizePool * prizeSplit.second) / 100),
    third: Math.floor((actualPrizePool * prizeSplit.third) / 100),
  };
};

/**
 * Get prize pool display text
 * @param {Object} tournament - Tournament object
 * @returns {string} - Display text for prize pool
 */
export const getPrizePoolDisplay = (tournament) => {
  if (!tournament) return "0";

  const actualPrizePool = calculateActualPrizePool(tournament);

  if (tournament.prize_pool_type === "entry-based") {
    const participantCount = tournament.participants?.length || 0;
    const maxPrizePool = tournament.prize_pool;

    return `${actualPrizePool.toLocaleString()} / ${maxPrizePool.toLocaleString()}`;
  }

  return actualPrizePool.toLocaleString();
};
