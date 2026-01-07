/**
 * CSRF token validation middleware for API routes
 */

import { validateCSRFToken } from "./csrf";
import { getServerSession } from "next-auth";
import { authOptions } from "./authConfig";

/**
 * Validate CSRF token from request
 * @param {Request} request - Next.js request object
 * @param {object} body - Optional pre-parsed body (to avoid reading request twice)
 * @returns {object} { valid: boolean, error?: string, body?: object }
 */
export async function validateCSRFRequest(request, body = null) {
  try {
    // Get CSRF token from header first
    const csrfTokenHeader = request.headers.get("x-csrf-token");
    let csrfToken = csrfTokenHeader;

    // If not in header, try to get from body
    if (!csrfToken) {
      let parsedBody = body;
      
      // If body not provided, try to parse it
      if (!parsedBody) {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          try {
            parsedBody = await request.clone().json();
          } catch (e) {
            // Body might not be JSON or already consumed
          }
        }
      }

      if (parsedBody) {
        csrfToken = parsedBody.csrfToken || parsedBody._csrf;
      }
    }

    if (!csrfToken) {
      console.error("[CSRF] No token found in header or body");
      return {
        valid: false,
        error: "CSRF token is required",
      };
    }

    // Get user session if available
    let userId = null;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id || null;
    } catch (e) {
      // Session check failed, continue without userId
      console.warn("[CSRF] Session check failed:", e);
    }

    // Validate token
    const isValid = validateCSRFToken(csrfToken, userId);

    if (!isValid) {
      console.error("[CSRF] Token validation failed:", {
        token: csrfToken.substring(0, 20) + "...",
        userId,
        hasToken: !!csrfToken,
      });
      return {
        valid: false,
        error: "Invalid or expired CSRF token",
      };
    }

    console.log("[CSRF] Token validated successfully");

    return {
      valid: true,
    };
  } catch (error) {
    console.error("CSRF validation error:", error);
    return {
      valid: false,
      error: "CSRF validation failed",
    };
  }
}

/**
 * Wrapper for API route handlers to add CSRF protection
 * @param {Function} handler - API route handler function
 * @param {object} options - Options { requireAuth: boolean, skipMethods: string[] }
 * @returns {Function} Wrapped handler
 */
export function withCSRFProtection(handler, options = {}) {
  const { requireAuth = false, skipMethods = ["GET", "HEAD", "OPTIONS"] } =
    options;

  return async (request, context) => {
    const method = request.method;

    // Skip CSRF check for safe methods
    if (skipMethods.includes(method)) {
      return handler(request, context);
    }

    // Validate CSRF token
    const validation = await validateCSRFRequest(request);

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error || "CSRF token validation failed",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // If auth is required, check session
    if (requireAuth) {
      try {
        const session = await getServerSession(authOptions);
        if (!session) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Authentication required",
            }),
            {
              status: 401,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      } catch (e) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Authentication check failed",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // Call original handler
    return handler(request, context);
  };
}

