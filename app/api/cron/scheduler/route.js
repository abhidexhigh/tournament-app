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
 *     "schedule": "every 5 minutes"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Check if this is a Vercel cron request
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set and this is NOT a Vercel cron request, verify it
    // Vercel cron jobs send x-vercel-cron header, so we allow those automatically
    if (
      cronSecret &&
      !vercelCronHeader &&
      authHeader !== `Bearer ${cronSecret}`
    ) {
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
