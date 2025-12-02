// 💰💎 Currency Configuration Controller
// This file controls which currency (USD or Diamond) is used as primary throughout the app

/**
 * CURRENCY CONTROLLER
 *
 * Change the PRIMARY_CURRENCY value to switch between USD and Diamond display
 * Options: 'USD' or 'DIAMOND'
 *
 * IMPORTANT: When SINGLE_CURRENCY_MODE is true, the app uses ONLY the primary currency.
 * - All balances, prizes, and fees use only PRIMARY_CURRENCY
 * - Secondary currency is completely hidden
 * - Users can only join tournaments with PRIMARY_CURRENCY
 */
export const PRIMARY_CURRENCY = "DIAMOND"; // 'USD' or 'DIAMOND'

/**
 * SINGLE CURRENCY MODE
 *
 * true  = Use ONLY primary currency (recommended for simplicity)
 * false = Support both USD and Diamond (dual currency system)
 *
 * When true:
 * - Only PRIMARY_CURRENCY is used and displayed
 * - Users have only one balance (PRIMARY_CURRENCY)
 * - Tournaments use only PRIMARY_CURRENCY
 * - No currency conversion or dual display
 */
export const SINGLE_CURRENCY_MODE = true;

/**
 * Currency Configuration
 */
export const CURRENCY_CONFIG = {
  USD: {
    symbol: "$",
    emoji: "$",
    name: "USD",
    displayName: "USD",
    decimals: 2,
  },
  DIAMOND: {
    symbol: "💎",
    emoji: "💎",
    name: "Diamond",
    displayName: "Diamonds",
    decimals: 0,
  },
};

/**
 * Conversion Rate Configuration
 * 1 USD = X Diamonds
 */
export const CONVERSION_RATE = {
  USD_TO_DIAMOND: 1, // 1 USD = 1 Diamond
  DIAMOND_TO_USD: 1, // 1 Diamond = 1 USD
};

/**
 * Display Settings (only applies when SINGLE_CURRENCY_MODE = false)
 */
export const DISPLAY_SETTINGS = {
  // Whether to show secondary currency in parentheses
  showSecondaryCurrency: true,

  // Where to show both currencies (even if primary is set)
  // Set to true for prize pools, entry fees, etc.
  // NOTE: These settings are IGNORED when SINGLE_CURRENCY_MODE = true
  showBothCurrencies: {
    prizePool: true, // Prize pools show both
    entryFee: false, // Entry fees show only primary
    walletBalance: false, // Wallet shows only primary
    transactions: false, // Transactions show only primary
    winnings: true, // Winnings show both
  },
};

/**
 * Get the primary currency configuration
 * @returns {Object} Primary currency config
 */
export const getPrimaryCurrency = () => {
  return CURRENCY_CONFIG[PRIMARY_CURRENCY];
};

/**
 * Get the secondary currency configuration
 * @returns {Object} Secondary currency config
 */
export const getSecondaryCurrency = () => {
  return CURRENCY_CONFIG[PRIMARY_CURRENCY === "USD" ? "DIAMOND" : "USD"];
};

/**
 * Convert USD to Diamonds
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in Diamonds
 */
export const usdToDiamonds = (usdAmount) => {
  return Math.round(usdAmount * CONVERSION_RATE.USD_TO_DIAMOND);
};

/**
 * Convert Diamonds to USD
 * @param {number} diamonds - Amount in Diamonds
 * @returns {number} Amount in USD
 */
export const diamondsToUsd = (diamonds) => {
  return diamonds * CONVERSION_RATE.DIAMOND_TO_USD;
};

/**
 * Get amount in primary currency
 * @param {number} usdAmount - Amount in USD (base currency)
 * @returns {number} Amount in primary currency
 */
export const getAmountInPrimaryCurrency = (usdAmount) => {
  if (PRIMARY_CURRENCY === "USD") {
    return usdAmount;
  } else {
    return usdToDiamonds(usdAmount);
  }
};

/**
 * Get amount in secondary currency
 * @param {number} usdAmount - Amount in USD (base currency)
 * @returns {number} Amount in secondary currency
 */
export const getAmountInSecondaryCurrency = (usdAmount) => {
  if (PRIMARY_CURRENCY === "USD") {
    return usdToDiamonds(usdAmount);
  } else {
    return usdAmount;
  }
};

/**
 * Check if a specific feature should show both currencies
 * @param {string} feature - Feature name (e.g., 'prizePool', 'entryFee')
 * @returns {boolean} Whether to show both currencies
 */
export const shouldShowBothCurrencies = (feature) => {
  // In single currency mode, NEVER show both currencies
  if (SINGLE_CURRENCY_MODE) return false;

  if (!DISPLAY_SETTINGS.showSecondaryCurrency) return false;
  return DISPLAY_SETTINGS.showBothCurrencies[feature] || false;
};

/**
 * Check if app is in single currency mode
 * @returns {boolean} Whether app uses only one currency
 */
export const isSingleCurrencyMode = () => {
  return SINGLE_CURRENCY_MODE;
};

/**
 * Get user's balance in primary currency
 * @param {Object} user - User object with balance/diamonds
 * @returns {number} Balance in primary currency
 */
export const getUserBalance = (user) => {
  if (!user) return 0;

  if (SINGLE_CURRENCY_MODE) {
    // In single currency mode, use the appropriate field
    if (PRIMARY_CURRENCY === "USD") {
      return user.balance || user.usd_balance || 0;
    } else {
      return user.diamonds || user.diamond_balance || 0;
    }
  } else {
    // In dual currency mode, return both
    return {
      usd: user.balance || user.usd_balance || 0,
      diamonds: user.diamonds || user.diamond_balance || 0,
    };
  }
};

/**
 * Get balance field name for database operations
 * @returns {string} Database field name for primary currency
 */
export const getBalanceFieldName = () => {
  if (PRIMARY_CURRENCY === "USD") {
    return "balance"; // or 'usd_balance'
  } else {
    return "diamonds"; // or 'diamond_balance'
  }
};

const currencyConfig = {
  PRIMARY_CURRENCY,
  SINGLE_CURRENCY_MODE,
  CURRENCY_CONFIG,
  CONVERSION_RATE,
  DISPLAY_SETTINGS,
  getPrimaryCurrency,
  getSecondaryCurrency,
  usdToDiamonds,
  diamondsToUsd,
  getAmountInPrimaryCurrency,
  getAmountInSecondaryCurrency,
  shouldShowBothCurrencies,
  isSingleCurrencyMode,
  getUserBalance,
  getBalanceFieldName,
};

export default currencyConfig;
