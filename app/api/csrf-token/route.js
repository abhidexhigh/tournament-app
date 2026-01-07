// API route: /api/csrf-token
import { NextResponse } from "next/server";
import { generateCSRFToken } from "../../lib/csrf";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authConfig";

/**
 * GET /api/csrf-token
 * Generate a new CSRF token for the current user
 */
export async function GET(request) {
  try {
    // Get user session if available
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Generate CSRF token
    const token = generateCSRFToken(userId);

    // Return token in response
    return NextResponse.json(
      {
        success: true,
        token,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      },
    );
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate CSRF token" },
      { status: 500 },
    );
  }
}

