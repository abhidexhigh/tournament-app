import { NextResponse } from "next/server";
import { pool } from "../../../lib/database";
import { runScheduler } from "../../../lib/automatedTournaments";

/**
 * GET /api/cron/scheduler
 * Background job to run the automated tournament scheduler
 * This should be called periodically (e.g., every 5 minutes) by a cron service
 * 
 * For Vercel, you can use Vercel Cron Jobs:
 * https://vercel.com/docs/cron-jobs
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/scheduler",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Optional: Add authentication/authorization check
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Scheduler] Running automated tournament scheduler...");
    const results = await runScheduler(pool);

    console.log("[Scheduler] Results:", JSON.stringify(results, null, 2));

    return NextResponse.json({
      success: true,
      message: "Scheduler executed successfully",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Scheduler] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggering
export async function POST(request) {
  return GET(request);
}

