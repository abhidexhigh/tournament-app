/**
 * CSRF (Cross-Site Request Forgery) token utilities
 */

import { randomBytes, createHash } from "crypto";

// In-memory token store (in production, use Redis or database)
// Format: { token: { userId, expiresAt, used } }
const tokenStore = new Map();

// Token expiration time (15 minutes)
const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

// Clean up expired tokens every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [token, data] of tokenStore.entries()) {
      if (data.expiresAt < now) {
        tokenStore.delete(token);
      }
    }
  },
  5 * 60 * 1000,
);

/**
 * Generate a secure CSRF token
 * @param {string} userId - Optional user ID to associate with token
 * @returns {string} CSRF token
 */
export function generateCSRFToken(userId = null) {
  // Generate random token
  const randomToken = randomBytes(32).toString("hex");

  // Create hash for additional security
  const hash = createHash("sha256")
    .update(randomToken + Date.now() + (userId || ""))
    .digest("hex");

  const token = `${randomToken}.${hash.substring(0, 16)}`;

  // Store token with expiration
  tokenStore.set(token, {
    userId,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    used: false,
    createdAt: Date.now(),
  });

  return token;
}

/**
 * Validate a CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} userId - Optional user ID to verify against
 * @returns {boolean} True if token is valid
 */
export function validateCSRFToken(token, userId = null) {
  if (!token || typeof token !== "string") {
    console.error("[CSRF] Invalid token type:", typeof token);
    return false;
  }

  const tokenData = tokenStore.get(token);

  if (!tokenData) {
    console.error("[CSRF] Token not found in store. Token count:", tokenStore.size);
    return false;
  }

  // Check if token has expired
  if (tokenData.expiresAt < Date.now()) {
    console.error("[CSRF] Token expired:", {
      expiresAt: new Date(tokenData.expiresAt).toISOString(),
      now: new Date().toISOString(),
    });
    tokenStore.delete(token);
    return false;
  }

  // Check if token has already been used (optional - can allow reuse for same request)
  // For now, we'll allow reuse within the same session

  // If userId is provided, verify it matches
  if (userId && tokenData.userId && tokenData.userId !== userId) {
    console.error("[CSRF] User ID mismatch:", {
      tokenUserId: tokenData.userId,
      requestUserId: userId,
    });
    return false;
  }

  return true;
}

/**
 * Mark a CSRF token as used (optional - for one-time use tokens)
 * @param {string} token - CSRF token to mark as used
 */
export function markTokenAsUsed(token) {
  const tokenData = tokenStore.get(token);
  if (tokenData) {
    tokenData.used = true;
  }
}

/**
 * Get token data (for debugging)
 * @param {string} token - CSRF token
 * @returns {object|null} Token data or null
 */
export function getTokenData(token) {
  return tokenStore.get(token) || null;
}

/**
 * Clear expired tokens manually
 */
export function clearExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Get token count (for monitoring)
 * @returns {number} Number of active tokens
 */
export function getTokenCount() {
  clearExpiredTokens();
  return tokenStore.size;
}
