import { headers } from "next/headers";

/**
 * Get the CSP nonce from request headers (server-side only)
 * This nonce is generated per-request in middleware.js
 * Use this to add nonce to inline scripts and styles for CSP compliance
 */
export async function getNonce() {
  const headersList = await headers();
  return headersList.get("x-nonce") || "";
}
