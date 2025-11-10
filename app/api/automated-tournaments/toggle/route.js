import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authConfig";
import { pool } from "../../../lib/database";

/**
 * POST /api/automated-tournaments/toggle
 * Start or stop automated tournaments for a specific level (admin only)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is game owner
    if (!session || session.user.type !== "game_owner") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Game owner access required." },
        { status: 403 }
      );
    }

    const { level, action } = await request.json();

    if (!level || !action) {
      return NextResponse.json(
        { success: false, error: "Level and action are required" },
        { status: 400 }
      );
    }

    if (action === "stop") {
      // Cancel all active tournaments for this level
      await pool.query(
        `UPDATE tournaments 
         SET status = 'cancelled'
         WHERE is_automated = true 
         AND automated_level = $1
         AND status IN ('upcoming', 'ongoing')`,
        [level]
      );

      return NextResponse.json({
        success: true,
        message: `Stopped all ${level} tournaments`,
      });
    } else if (action === "start") {
      // The scheduler will create new tournaments
      return NextResponse.json({
        success: true,
        message: `${level} tournaments will be created by the scheduler`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'start' or 'stop'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error toggling automated tournaments:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
