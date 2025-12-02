// 💰 Currency Formatting Utilities
// Provides consistent currency formatting based on currencyConfig settings

import {
  getPrimaryCurrency,
  getSecondaryCurrency,
  getAmountInPrimaryCurrency,
  getAmountInSecondaryCurrency,
  shouldShowBothCurrencies,
  PRIMARY_CURRENCY,
  SINGLE_CURRENCY_MODE,
  isSingleCurrencyMode,
} from './currencyConfig';

/**
 * Format a number with localization
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number
 */
const formatNumber = (amount, decimals = 0) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format amount in a specific currency
 * @param {number} amount - Amount to format
 * @param {string} currencyType - 'primary' or 'secondary' or 'USD' or 'DIAMOND'
 * @param {boolean} includeSymbol - Whether to include currency symbol/emoji
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyType = 'primary', includeSymbol = true) => {
  let currency;
  
  if (currencyType === 'primary') {
    currency = getPrimaryCurrency();
  } else if (currencyType === 'secondary') {
    currency = getSecondaryCurrency();
  } else if (currencyType === 'USD') {
    currency = { symbol: '$', decimals: 2 };
  } else if (currencyType === 'DIAMOND') {
    currency = { symbol: '💎', decimals: 0 };
  }
  
  const formattedAmount = formatNumber(amount, currency.decimals);
  
  if (!includeSymbol) return formattedAmount;
  
  // For USD, symbol goes before the number
  if (currencyType === 'USD' || (currencyType === 'primary' && PRIMARY_CURRENCY === 'USD')) {
    return `${currency.symbol}${formattedAmount}`;
  }
  
  // For Diamond, emoji goes after the number
  return `${formattedAmount} ${currency.symbol}`;
};

/**
 * Format amount with both currencies (primary + secondary in parentheses)
 * @param {number} usdBaseAmount - Base amount in USD
 * @param {string} feature - Feature name for display settings check
 * @returns {string} Formatted dual currency string
 */
export const formatDualCurrency = (usdBaseAmount, feature = '') => {
  const primaryAmount = getAmountInPrimaryCurrency(usdBaseAmount);
  const primaryFormatted = formatCurrency(primaryAmount, 'primary', true);
  
  // In single currency mode, ALWAYS show only primary currency
  if (SINGLE_CURRENCY_MODE) {
    return primaryFormatted;
  }
  
  // In dual currency mode, check if this feature should show both
  if (feature && shouldShowBothCurrencies(feature)) {
    const secondaryAmount = getAmountInSecondaryCurrency(usdBaseAmount);
    const secondaryFormatted = formatCurrency(secondaryAmount, 'secondary', true);
    return `${primaryFormatted} (${secondaryFormatted})`;
  }
  
  return primaryFormatted;
};

/**
 * Format prize pool amount
 * @param {number} usdAmount - Prize pool amount in USD
 * @param {boolean} forceDual - Force showing both currencies (ignored in single currency mode)
 * @returns {string} Formatted prize pool string
 */
export const formatPrizePool = (usdAmount, forceDual = false) => {
  // In single currency mode, always show only primary
  if (SINGLE_CURRENCY_MODE) {
    return formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
  }
  
  // In dual currency mode, check settings
  if (forceDual || shouldShowBothCurrencies('prizePool')) {
    return formatDualCurrency(usdAmount, 'prizePool');
  }
  return formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
};

/**
 * Format entry fee amount
 * @param {number} usdAmount - Entry fee amount in USD
 * @param {boolean} forceDual - Force showing both currencies (ignored in single currency mode)
 * @returns {string} Formatted entry fee string
 */
export const formatEntryFee = (usdAmount, forceDual = false) => {
  // In single currency mode, always show only primary
  if (SINGLE_CURRENCY_MODE) {
    return formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
  }
  
  // In dual currency mode, check settings
  if (forceDual || shouldShowBothCurrencies('entryFee')) {
    return formatDualCurrency(usdAmount, 'entryFee');
  }
  return formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
};

/**
 * Format wallet balance amount
 * @param {number} usdAmount - Wallet balance in USD
 * @returns {string} Formatted wallet balance string
 */
export const formatWalletBalance = (usdAmount) => {
  // In single currency mode, always show only primary
  if (SINGLE_CURRENCY_MODE) {
    return formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
  }
  
  // In dual currency mode, check settings
  if (shouldShowBothCurrencies('walletBalance')) {
    return formatDualCurrency(usdAmount, 'walletBalance');
  }
  return formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
};

/**
 * Format transaction amount
 * @param {number} amount - Transaction amount
 * @param {boolean} showSign - Whether to show +/- sign
 * @returns {string} Formatted transaction string
 */
export const formatTransaction = (amount, showSign = true) => {
  const prefix = showSign && amount > 0 ? '+' : '';
  const absAmount = Math.abs(amount);
  
  // In single currency mode, always show only primary
  if (SINGLE_CURRENCY_MODE) {
    const formatted = formatCurrency(getAmountInPrimaryCurrency(absAmount), 'primary', true);
    return `${prefix}${formatted}`;
  }
  
  // In dual currency mode, check settings
  if (shouldShowBothCurrencies('transactions')) {
    return `${prefix}${formatDualCurrency(absAmount, 'transactions')}`;
  }
  
  const formatted = formatCurrency(getAmountInPrimaryCurrency(absAmount), 'primary', true);
  return `${prefix}${formatted}`;
};

/**
 * Format winnings amount
 * @param {number} usdAmount - Winnings amount in USD
 * @param {boolean} showSign - Whether to show + sign
 * @returns {string} Formatted winnings string
 */
export const formatWinnings = (usdAmount, showSign = true) => {
  const prefix = showSign ? '+' : '';
  const formatted = formatCurrency(getAmountInPrimaryCurrency(usdAmount), 'primary', true);
  
  // In single currency mode, always show only primary
  if (SINGLE_CURRENCY_MODE) {
    return `${prefix}${formatted}`;
  }
  
  // In dual currency mode, check settings
  if (shouldShowBothCurrencies('winnings')) {
    const secondaryFormatted = formatCurrency(getAmountInSecondaryCurrency(usdAmount), 'secondary', true);
    return `${prefix}${formatted} (${secondaryFormatted})`;
  }
  
  return `${prefix}${formatted}`;
};

/**
 * Get currency display object (for components that need separate values)
 * @param {number} usdBaseAmount - Base amount in USD
 * @returns {Object} Object with primary and secondary currency values
 */
export const getCurrencyDisplayObject = (usdBaseAmount) => {
  return {
    primary: {
      amount: getAmountInPrimaryCurrency(usdBaseAmount),
      formatted: formatCurrency(getAmountInPrimaryCurrency(usdBaseAmount), 'primary', true),
      currency: getPrimaryCurrency(),
    },
    secondary: {
      amount: getAmountInSecondaryCurrency(usdBaseAmount),
      formatted: formatCurrency(getAmountInSecondaryCurrency(usdBaseAmount), 'secondary', true),
      currency: getSecondaryCurrency(),
    },
  };
};

/**
 * Format prize pool for display with entry-based scaling
 * @param {Object} tournament - Tournament object
 * @returns {string} Formatted prize pool display
 */
export const getPrizePoolDisplay = (tournament) => {
  if (!tournament) return formatCurrency(0, 'primary', true);
  
  const calculateActualPrizePool = (t) => {
    if (t.prize_pool_type === 'fixed') {
      return t.prize_pool;
    }
    
    if (t.prize_pool_type === 'entry-based') {
      const participantCount = t.participants?.length || 0;
      const maxPlayers = t.max_players;
      if (maxPlayers === 0) return 0;
      return Math.floor((participantCount / maxPlayers) * t.prize_pool);
    }
    
    return t.prize_pool || t.prizePool;
  };
  
  const actualPrizePool = calculateActualPrizePool(tournament);
  
  if (tournament.prize_pool_type === 'entry-based') {
    const maxPrizePool = tournament.prize_pool;
    const actualFormatted = formatCurrency(getAmountInPrimaryCurrency(actualPrizePool), 'primary', true);
    const maxFormatted = formatCurrency(getAmountInPrimaryCurrency(maxPrizePool), 'primary', true);
    return `${actualFormatted} / ${maxFormatted}`;
  }
  
  return formatPrizePool(actualPrizePool);
};

/**
 * Get primary currency info for display
 * @returns {Object} Primary currency information
 */
export const getPrimaryCurrencyInfo = () => {
  const currency = getPrimaryCurrency();
  return {
    symbol: currency.symbol,
    emoji: currency.emoji,
    name: currency.name,
    displayName: currency.displayName,
  };
};

/**
 * Get secondary currency info for display
 * @returns {Object} Secondary currency information
 */
export const getSecondaryCurrencyInfo = () => {
  const currency = getSecondaryCurrency();
  return {
    symbol: currency.symbol,
    emoji: currency.emoji,
    name: currency.name,
    displayName: currency.displayName,
  };
};

export default {
  formatCurrency,
  formatDualCurrency,
  formatPrizePool,
  formatEntryFee,
  formatWalletBalance,
  formatTransaction,
  formatWinnings,
  getCurrencyDisplayObject,
  getPrizePoolDisplay,
  getPrimaryCurrencyInfo,
  getSecondaryCurrencyInfo,
};

