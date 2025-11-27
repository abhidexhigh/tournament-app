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
      (participantCount / maxPlayers) * tournament.prize_pool,
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

/**
 * Get prize pool display with both USD and diamonds
 * @param {Object} tournament - Tournament object
 * @returns {Object} - Display object with USD and diamond amounts
 */
export const getPrizePoolDisplayDual = (tournament) => {
  if (!tournament) return { usd: "0", diamonds: "0" };

  const actualPrizePool = calculateActualPrizePool(tournament);
  // 1 USD = 1 Diamond
  const usdAmount = tournament.prize_pool_usd || actualPrizePool;
  const diamondAmount = actualPrizePool;

  if (tournament.prize_pool_type === "entry-based") {
    const participantCount = tournament.participants?.length || 0;
    const maxPrizePool = tournament.prize_pool;
    const maxUsdAmount = tournament.prize_pool_usd || maxPrizePool;

    return {
      usd: `${usdAmount.toLocaleString()} / ${maxUsdAmount.toLocaleString()}`,
      diamonds: `${diamondAmount.toLocaleString()} / ${maxPrizePool.toLocaleString()}`,
    };
  }

  return {
    usd: usdAmount.toLocaleString(),
    diamonds: diamondAmount.toLocaleString(),
  };
};

/**
 * Get entry fee display with both USD and diamonds
 * @param {Object} tournament - Tournament object
 * @returns {Object} - Display object with USD and diamond amounts
 */
export const getEntryFeeDisplayDual = (tournament) => {
  if (!tournament) return { usd: "0", diamonds: "0" };

  const entryFee = tournament.entry_fee || 0;
  // 1 USD = 1 Diamond
  const usdAmount = tournament.entry_fee_usd || entryFee;
  const diamondAmount = entryFee;

  return {
    usd: usdAmount.toLocaleString(),
    diamonds: diamondAmount.toLocaleString(),
  };
};
