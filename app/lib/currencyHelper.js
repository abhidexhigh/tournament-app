// 💰 Currency Helper - Balance and Payment Utilities for Single/Dual Currency Mode

import {
  PRIMARY_CURRENCY,
  SINGLE_CURRENCY_MODE,
  getUserBalance,
  getBalanceFieldName,
  getAmountInPrimaryCurrency,
  getPrimaryCurrency,
} from './currencyConfig';

/**
 * Check if user has sufficient balance to pay an amount
 * @param {Object} user - User object
 * @param {number} amountInUSD - Amount to check (in USD base)
 * @param {string} paymentMethod - Payment method ('diamonds', 'usd', or 'tickets')
 * @returns {boolean} Whether user has sufficient balance
 */
export const hasSufficientBalance = (user, amountInUSD, paymentMethod = null) => {
  if (!user) return false;
  
  // In single currency mode, ignore paymentMethod and use primary currency
  if (SINGLE_CURRENCY_MODE) {
    const userBalance = getUserBalance(user);
    const requiredAmount = getAmountInPrimaryCurrency(amountInUSD);
    return userBalance >= requiredAmount;
  }
  
  // In dual currency mode, check specific payment method
  if (paymentMethod === 'tickets') {
    // Handle tickets separately (not part of currency system)
    return true; // Ticket balance check handled elsewhere
  }
  
  if (paymentMethod === 'usd') {
    return (user.balance || 0) >= amountInUSD;
  }
  
  if (paymentMethod === 'diamonds') {
    const diamondsNeeded = getAmountInPrimaryCurrency(amountInUSD);
    return (user.diamonds || 0) >= diamondsNeeded;
  }
  
  return false;
};

/**
 * Get payment method for tournament joining
 * In single currency mode, returns the primary currency
 * In dual currency mode, returns user's choice
 * @returns {string} Payment method ('diamonds' or 'usd')
 */
export const getDefaultPaymentMethod = () => {
  if (SINGLE_CURRENCY_MODE) {
    return PRIMARY_CURRENCY === 'USD' ? 'usd' : 'diamonds';
  }
  
  // In dual currency mode, return default (can be user preference)
  return 'diamonds'; // Default to diamonds in dual mode
};

/**
 * Get user's displayable balance
 * @param {Object} user - User object
 * @returns {Object} Balance object with formatted display
 */
export const getUserBalanceDisplay = (user) => {
  if (!user) {
    return {
      amount: 0,
      formatted: '0',
      currency: getPrimaryCurrency(),
    };
  }
  
  if (SINGLE_CURRENCY_MODE) {
    const balance = getUserBalance(user);
    const currency = getPrimaryCurrency();
    
    return {
      amount: balance,
      formatted: balance.toLocaleString(),
      currency,
      currencySymbol: currency.symbol,
      currencyEmoji: currency.emoji,
    };
  }
  
  // In dual currency mode, return both
  return {
    usd: {
      amount: user.balance || 0,
      formatted: (user.balance || 0).toLocaleString(),
    },
    diamonds: {
      amount: user.diamonds || 0,
      formatted: (user.diamonds || 0).toLocaleString(),
    },
  };
};

/**
 * Get required payment amount in primary currency
 * @param {number} amountInUSD - Base amount in USD
 * @returns {number} Amount in primary currency
 */
export const getRequiredPaymentAmount = (amountInUSD) => {
  return getAmountInPrimaryCurrency(amountInUSD);
};

/**
 * Validate payment for tournament entry
 * @param {Object} user - User object
 * @param {Object} tournament - Tournament object
 * @param {string} paymentMethod - Payment method (ignored in single currency mode)
 * @returns {Object} Validation result
 */
export const validateTournamentPayment = (user, tournament, paymentMethod = null) => {
  if (!user) {
    return {
      valid: false,
      error: 'User not authenticated',
    };
  }
  
  if (!tournament) {
    return {
      valid: false,
      error: 'Tournament not found',
    };
  }
  
  const entryFee = tournament.entry_fee || 0;
  
  // Free tournament
  if (entryFee === 0) {
    return {
      valid: true,
      paymentMethod: 'free',
      amount: 0,
    };
  }
  
  // In single currency mode, use primary currency
  if (SINGLE_CURRENCY_MODE) {
    const effectivePaymentMethod = getDefaultPaymentMethod();
    const userBalance = getUserBalance(user);
    const requiredAmount = getRequiredPaymentAmount(entryFee);
    const currency = getPrimaryCurrency();
    
    if (userBalance < requiredAmount) {
      return {
        valid: false,
        error: `Insufficient ${currency.displayName}. You have ${userBalance.toLocaleString()} ${currency.symbol}, need ${requiredAmount.toLocaleString()} ${currency.symbol}`,
        paymentMethod: effectivePaymentMethod,
        userBalance,
        requiredAmount,
      };
    }
    
    return {
      valid: true,
      paymentMethod: effectivePaymentMethod,
      amount: requiredAmount,
      userBalance,
    };
  }
  
  // In dual currency mode, validate based on selected payment method
  const effectivePaymentMethod = paymentMethod || getDefaultPaymentMethod();
  
  if (effectivePaymentMethod === 'usd') {
    const userBalance = user.balance || 0;
    if (userBalance < entryFee) {
      return {
        valid: false,
        error: `Insufficient USD. You have $${userBalance.toFixed(2)}, need $${entryFee.toFixed(2)}`,
        paymentMethod: 'usd',
        userBalance,
        requiredAmount: entryFee,
      };
    }
  } else if (effectivePaymentMethod === 'diamonds') {
    const requiredDiamonds = getRequiredPaymentAmount(entryFee);
    const userDiamonds = user.diamonds || 0;
    if (userDiamonds < requiredDiamonds) {
      return {
        valid: false,
        error: `Insufficient Diamonds. You have ${userDiamonds.toLocaleString()} 💎, need ${requiredDiamonds.toLocaleString()} 💎`,
        paymentMethod: 'diamonds',
        userBalance: userDiamonds,
        requiredAmount: requiredDiamonds,
      };
    }
  }
  
  return {
    valid: true,
    paymentMethod: effectivePaymentMethod,
    amount: effectivePaymentMethod === 'usd' ? entryFee : getRequiredPaymentAmount(entryFee),
    userBalance: effectivePaymentMethod === 'usd' ? (user.balance || 0) : (user.diamonds || 0),
  };
};

/**
 * Get balance field name for API calls
 * @returns {string} Field name for database
 */
export const getBalanceField = () => {
  return getBalanceFieldName();
};

/**
 * Check if user can join tournament
 * @param {Object} user - User object
 * @param {Object} tournament - Tournament object
 * @returns {Object} Can join result with reason
 */
export const canJoinTournament = (user, tournament) => {
  if (!user) {
    return { canJoin: false, reason: 'Please log in to join' };
  }
  
  if (!tournament) {
    return { canJoin: false, reason: 'Tournament not found' };
  }
  
  // Check if tournament is full
  const currentParticipants = tournament.participants?.length || 0;
  const maxPlayers = tournament.max_players || 0;
  
  if (currentParticipants >= maxPlayers) {
    return { canJoin: false, reason: 'Tournament is full' };
  }
  
  // Check if already joined
  const alreadyJoined = tournament.participants?.some(p => p.id === user.id || p.user_id === user.id);
  if (alreadyJoined) {
    return { canJoin: false, reason: 'Already joined' };
  }
  
  // Validate payment
  const paymentValidation = validateTournamentPayment(user, tournament);
  
  if (!paymentValidation.valid) {
    return { 
      canJoin: false, 
      reason: paymentValidation.error,
      insufficientBalance: true,
    };
  }
  
  return { 
    canJoin: true, 
    paymentMethod: paymentValidation.paymentMethod,
    amount: paymentValidation.amount,
  };
};

export default {
  hasSufficientBalance,
  getDefaultPaymentMethod,
  getUserBalanceDisplay,
  getRequiredPaymentAmount,
  validateTournamentPayment,
  getBalanceField,
  canJoinTournament,
};

