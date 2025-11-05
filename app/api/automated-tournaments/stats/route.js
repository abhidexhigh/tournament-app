import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { pool } from "../../../lib/database";

/**
 * GET /api/automated-tournaments/stats
 * Get statistics for automated tournaments (admin only)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is game owner
    if (!session || session.user.type !== "game_owner") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Game owner access required." },
        { status: 403 }
      );
    }

    // Get overall stats
    const overallStats = await pool.query(`
      SELECT 
        COUNT(*) as total_tournaments,
        COUNT(DISTINCT automated_level) as active_levels,
        SUM(ARRAY_LENGTH(participants, 1)) as total_participants,
        SUM(prize_pool_usd) as total_prize_pool
      FROM tournaments 
      WHERE is_automated = true
    `);

    // Get stats by level
    const levelStats = await pool.query(`
      SELECT 
        automated_level,
        COUNT(*) as tournament_count,
        SUM(ARRAY_LENGTH(participants, 1)) as total_participants,
        AVG(ARRAY_LENGTH(participants, 1)) as avg_participants,
        SUM(prize_pool_usd) as total_prize_pool
      FROM tournaments 
      WHERE is_automated = true
      GROUP BY automated_level
      ORDER BY automated_level
    `);

    // Get stats by status
    const statusStats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tournaments 
      WHERE is_automated = true
      GROUP BY status
    `);

    // Get recent tournaments
    const recentTournaments = await pool.query(`
      SELECT 
        id, title, automated_level, status, 
        date, time, expires_at,
        ARRAY_LENGTH(participants, 1) as participant_count,
        max_players, prize_pool_usd
      FROM tournaments 
      WHERE is_automated = true
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get active tournaments
    const activeTournaments = await pool.query(`
      SELECT 
        id, title, automated_level, status, 
        date, time, expires_at,
        ARRAY_LENGTH(participants, 1) as participant_count,
        max_players, prize_pool_usd
      FROM tournaments 
      WHERE is_automated = true
      AND status IN ('upcoming', 'ongoing')
      ORDER BY expires_at ASC
    `);

    return NextResponse.json({
      success: true,
      stats: {
        overall: overallStats.rows[0],
        byLevel: levelStats.rows,
        byStatus: statusStats.rows,
        recentTournaments: recentTournaments.rows,
        activeTournaments: activeTournaments.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching automated tournament stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
