// Clan Battle Prize Distribution Utilities
import {
  formatCurrency,
  formatPrizePool,
  getPrimaryCurrencyInfo,
} from './currencyFormatter';
import {
  usdToDiamonds as convertUsdToDiamonds,
  diamondsToUsd as convertDiamondsToUsd,
} from './currencyConfig';

/**
 * Calculate prize distribution for clan battle tournaments
 * @param {number} totalPrize - Total prize pool amount
 * @param {number} teamSize - Number of players in the winning team
 * @returns {Object} Prize distribution breakdown
 */
export const calculateClanBattlePrizeDistribution = (totalPrize, teamSize) => {
  // Validate inputs
  if (!totalPrize || totalPrize <= 0) {
    console.warn("Invalid totalPrize:", totalPrize);
    return {
      topPerformers: [],
      remainingMembers: {
        count: 0,
        individualPrize: 0,
        totalPrize: 0,
      },
      totalPrize: 0,
    };
  }

  if (!teamSize || teamSize <= 0) {
    console.warn("Invalid teamSize:", teamSize);
    return {
      topPerformers: [],
      remainingMembers: {
        count: 0,
        individualPrize: 0,
        totalPrize: 0,
      },
      totalPrize: 0,
    };
  }

  if (teamSize < 3) {
    // If team has less than 3 players, distribute equally
    return {
      topPerformers: [],
      remainingMembers: {
        count: teamSize,
        individualPrize: totalPrize / teamSize,
        totalPrize: totalPrize,
      },
      totalPrize: totalPrize,
    };
  }

  // Top 3 performers get 9%, 6%, 5% respectively
  const top3Percentages = [0.09, 0.06, 0.05]; // 9%, 6%, 5%
  const top3Prizes = top3Percentages.map(
    (percentage) => totalPrize * percentage,
  );

  // Remaining 80% distributed equally among other members
  const remainingMembersCount = teamSize - 3;
  const remainingPrize = totalPrize * 0.8; // 80%
  const individualRemainingPrize =
    remainingMembersCount > 0 ? remainingPrize / remainingMembersCount : 0;

  return {
    topPerformers: [
      {
        position: 1,
        percentage: 9,
        prize: top3Prizes[0],
        description: "1st Place Performer",
      },
      {
        position: 2,
        percentage: 6,
        prize: top3Prizes[1],
        description: "2nd Place Performer",
      },
      {
        position: 3,
        percentage: 5,
        prize: top3Prizes[2],
        description: "3rd Place Performer",
      },
    ],
    remainingMembers: {
      count: remainingMembersCount,
      individualPrize: individualRemainingPrize,
      totalPrize: remainingPrize,
      description: "Team Members",
    },
    totalPrize: totalPrize,
    distribution: {
      top3Total: top3Prizes.reduce((sum, prize) => sum + prize, 0),
      remainingTotal: remainingPrize,
      top3Percentage: 20,
      remainingPercentage: 80,
    },
  };
};

/**
 * Format prize amount for display (uses currency controller)
 * @param {number} amount - Prize amount in USD
 * @param {boolean} usePrimary - Use primary currency (default: true)
 * @returns {string} Formatted prize amount
 */
export const formatPrizeAmount = (amount, usePrimary = true) => {
  // Handle undefined, null, or non-numeric values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return formatCurrency(0, usePrimary ? 'primary' : 'USD', true);
  }

  return formatPrizePool(amount);
};

/**
 * Convert USD to diamonds (uses currency controller)
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in diamonds
 */
export const usdToDiamonds = (usdAmount) => {
  return convertUsdToDiamonds(usdAmount);
};

/**
 * Convert diamonds to USD (uses currency controller)
 * @param {number} diamonds - Amount in diamonds
 * @returns {number} Amount in USD
 */
export const diamondsToUsd = (diamonds) => {
  return convertDiamondsToUsd(diamonds);
};

/**
 * Format prize amount with diamond equivalent (uses currency controller)
 * @param {number} usdAmount - Prize amount in USD
 * @returns {string} Formatted prize amount with both currencies
 */
export const formatPrizeWithDiamonds = (usdAmount) => {
  if (usdAmount === undefined || usdAmount === null || isNaN(usdAmount)) {
    return formatCurrency(0, 'primary', true);
  }

  return formatPrizePool(usdAmount, true); // Force dual display
};

/**
 * Get clan battle prize distribution display text
 * @param {Object} distribution - Prize distribution object
 * @returns {string} Formatted display text
 */
export const getClanBattlePrizeDisplay = (distribution) => {
  const { topPerformers, remainingMembers, totalPrize } = distribution;

  let display = `🏆 **Clan Battle Prize Distribution**\n\n`;
  display += `💰 **Total Prize Pool:** ${formatPrizeAmount(totalPrize)}\n\n`;

  display += `🥇 **Top Performers:**\n`;
  topPerformers.forEach((performer) => {
    display += `• ${performer.position}${getOrdinalSuffix(
      performer.position,
    )} Place: ${formatPrizeAmount(performer.prize)} (${
      performer.percentage
    }%)\n`;
  });

  display += `\n👥 **Team Members:**\n`;
  display += `• ${remainingMembers.count} members: ${formatPrizeAmount(
    remainingMembers.individualPrize,
  )} each (80% total)\n`;

  return display;
};

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number
 * @returns {string} Ordinal suffix
 */
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

/**
 * Calculate prize distribution for different team sizes
 * @param {number} totalPrize - Total prize pool
 * @returns {Object} Prize distribution for different team sizes
 */
export const getClanBattlePrizeExamples = (totalPrize) => {
  const teamSizes = [10, 20, 30]; // Common clan battle team sizes
  const examples = {};

  teamSizes.forEach((size) => {
    examples[size] = calculateClanBattlePrizeDistribution(totalPrize, size);
  });

  return examples;
};
