"use client";

import { useCSRF } from "../hooks/useCSRF";

/**
 * Hidden CSRF token input component
 * Automatically fetches and includes CSRF token in forms
 */
export default function CSRFToken() {
  const { token, loading, error } = useCSRF();

  if (loading) {
    // Return a placeholder to maintain form structure
    return <input type="hidden" name="_csrf" value="" disabled />;
  }

  if (error || !token) {
    console.error("CSRF token error:", error);
    // Still render hidden input to prevent form submission issues
    return <input type="hidden" name="_csrf" value="" disabled />;
  }

  return <input type="hidden" name="_csrf" value={token} />;
}

