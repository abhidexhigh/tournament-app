import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authConfig";
import { pool } from "../../lib/database";
import {
  runScheduler,
  runManualScheduler,
  getAllLevels,
} from "../../lib/automatedTournaments";

/**
 * GET /api/automated-tournaments
 * Get all automated tournaments
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const status = searchParams.get("status");

    let query = "SELECT * FROM tournaments WHERE is_automated = true";
    const params = [];
    let paramIndex = 1;

    if (level) {
      query += ` AND automated_level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      tournaments: result.rows,
    });
  } catch (error) {
    console.error("Error fetching automated tournaments:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/automated-tournaments
 * Manually trigger the scheduler (admin only)
 * Creates tournaments for NEXT scheduled time for all levels
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is game owner
    if (!session || session.user.type !== "game_owner") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Game owner access required." },
        { status: 403 },
      );
    }

    // Use runManualScheduler to create tournaments for next scheduled times
    const results = await runManualScheduler(pool);

    return NextResponse.json({
      success: true,
      message: "Tournaments created for next scheduled times",
      results,
    });
  } catch (error) {
    console.error("Error running manual scheduler:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
