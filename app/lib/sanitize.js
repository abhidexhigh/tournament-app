/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitizes a string by removing/escaping potentially dangerous HTML/script tags
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string safe for display
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") {
    return String(input || "");
  }

  return input
    .replace(/[<>]/g, (match) => {
      // Escape < and > characters
      return match === "<" ? "&lt;" : "&gt;";
    })
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "") // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "") // Remove embed tags
    .trim();
}

/**
 * Sanitizes text input for database storage (stricter)
 * Removes all HTML tags and dangerous patterns
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string safe for database storage
 */
export function sanitizeForDatabase(input) {
  if (typeof input !== "string") {
    return String(input || "");
  }

  return input
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:text\/html/gi, "") // Remove data URIs with HTML
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/expression\(/gi, "") // Remove CSS expressions
    .trim();
}

/**
 * Validates and sanitizes a string with length limits
 * @param {string} input - The input string
 * @param {number} maxLength - Maximum allowed length
 * @param {boolean} allowHtml - Whether to allow HTML (default: false)
 * @returns {string} - Sanitized string
 */
export function sanitizeWithLength(input, maxLength = 1000, allowHtml = false) {
  if (typeof input !== "string") {
    return String(input || "");
  }

  let sanitized = allowHtml ? sanitizeInput(input) : sanitizeForDatabase(input);

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates email format and sanitizes
 * @param {string} email - Email address to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (typeof email !== "string") {
    return null;
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Additional sanitization
  return sanitized
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

/**
 * Sanitizes URL input
 * @param {string} url - URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (typeof url !== "string") {
    return null;
  }

  const sanitized = url.trim();

  // Only allow http, https protocols
  if (!/^https?:\/\//i.test(sanitized)) {
    return null;
  }

  // Remove dangerous patterns but preserve the URL structure
  // Don't remove HTML tags from URLs as they might be part of query params
  // Just remove dangerous protocols
  let cleaned = sanitized
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/vbscript:/gi, "");

  // Remove event handlers that might be in query params
  cleaned = cleaned.replace(/on\w+\s*=/gi, "");

  return cleaned;
}

/**
 * Common XSS attack patterns for testing
 */
export const XSS_TEST_PATTERNS = {
  scriptTag: "<script>alert('XSS')</script>",
  scriptTagEncoded: "&lt;script&gt;alert('XSS')&lt;/script&gt;",
  imgTag: "<img src=x onerror=alert('XSS')>",
  iframeTag: "<iframe src='javascript:alert(\"XSS\")'></iframe>",
  eventHandler: "<div onclick='alert(\"XSS\")'>Click me</div>",
  javascriptProtocol: "javascript:alert('XSS')",
  dataUri: "data:text/html,<script>alert('XSS')</script>",
  svgTag: "<svg onload=alert('XSS')>",
  bodyTag: "<body onload=alert('XSS')>",
  inputTag: "<input onfocus=alert('XSS') autofocus>",
  linkTag: "<link rel=stylesheet href='javascript:alert(\"XSS\")'>",
  styleTag: "<style>@import'javascript:alert(\"XSS\")';</style>",
  metaTag:
    "<meta http-equiv='refresh' content='0;url=javascript:alert(\"XSS\")'>",
  embedTag: "<embed src='javascript:alert(\"XSS\")'>",
  objectTag: "<object data='javascript:alert(\"XSS\")'></object>",
  formTag:
    "<form><button formaction='javascript:alert(\"XSS\")'>Submit</button></form>",
  baseTag: "<base href='javascript:alert(\"XSS\")'>",
  htmlEntities: "&#60;script&#62;alert('XSS')&#60;/script&#62;",
  unicode: "\u003cscript\u003ealert('XSS')\u003c/script\u003e",
  mixedCase: "<ScRiPt>alert('XSS')</ScRiPt>",
  nested: "<<script>alert('XSS')</script>",
  noQuotes: "<script>alert(String.fromCharCode(88,83,83))</script>",
  encoded: "%3Cscript%3Ealert('XSS')%3C/script%3E",
};
