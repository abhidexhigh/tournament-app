/**
 * Date utility functions to handle timezone-safe date formatting
 *
 * JavaScript's `new Date("YYYY-MM-DD")` parses date-only strings as midnight UTC,
 * which can shift the date when displayed in local time. These utilities avoid that issue.
 */

/**
 * Parse a date string (YYYY-MM-DD or ISO format) as a local Date object
 * This avoids timezone issues when displaying dates
 * @param {string} dateStr - Date string in YYYY-MM-DD format (may include time after T)
 * @returns {Date} Local Date object
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;

  // If it's an ISO string with T, extract just the date part
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;

  const [year, month, day] = datePart.split("-").map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month - 1, day);
};

/**
 * Format a date string (YYYY-MM-DD) for display
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @param {string} locale - Locale string (default: "en-US")
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, options = {}, locale = "en-US") => {
  if (!dateStr) return "";

  const date = parseLocalDate(dateStr);
  if (!date) return "";

  const defaultOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
};

/**
 * Format a date string with weekday
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} locale - Locale string (default: "en-US")
 * @returns {string} Formatted date string with short weekday
 */
export const formatDateWithWeekday = (dateStr, locale = "en-US") => {
  return formatDate(
    dateStr,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
    locale,
  );
};

/**
 * Format a date string with long weekday and month
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} locale - Locale string (default: "en-US")
 * @returns {string} Formatted date string with long weekday
 */
export const formatDateLong = (dateStr, locale = "en-US") => {
  return formatDate(
    dateStr,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
    locale,
  );
};

/**
 * Convert a Date object to YYYY-MM-DD string using local date values
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const toDateString = (date) => {
  if (!date || !(date instanceof Date)) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Convert a Date object to YYYY-MM-DD string using UTC date values
 * Use this for dates that come from database (stored as midnight UTC)
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const toDateStringUTC = (date) => {
  if (!date || !(date instanceof Date)) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Locale mapping for common locales
 */
export const LOCALE_MAP = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  zh: "zh-CN",
  vi: "vi-VN",
  ru: "ru-RU",
  es: "es-ES",
};

/**
 * Get the proper locale string from a short locale code
 * @param {string} shortLocale - Short locale code (e.g., "en", "ko")
 * @returns {string} Full locale string (e.g., "en-US", "ko-KR")
 */
export const getFullLocale = (shortLocale) => {
  return LOCALE_MAP[shortLocale] || "en-US";
};
