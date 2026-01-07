"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * React hook for managing CSRF tokens
 * @returns {object} { token, loading, error, refreshToken }
 */
export function useCSRF() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include", // Include cookies
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
      } else {
        throw new Error("Invalid token response");
      }
    } catch (err) {
      console.error("CSRF token fetch error:", err);
      setError(err.message);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch token on mount
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Refresh token function
  const refreshToken = useCallback(() => {
    return fetchToken();
  }, [fetchToken]);

  return {
    token,
    loading,
    error,
    refreshToken,
  };
}

