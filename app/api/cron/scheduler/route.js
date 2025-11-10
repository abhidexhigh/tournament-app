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
  // Log immediately when route is called
  console.log("[Scheduler] ===== CRON ENDPOINT CALLED =====");
  console.log("[Scheduler] Timestamp:", new Date().toISOString());

  try {
    // Check if this is a Vercel cron request
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    console.log("[Scheduler] Headers:", {
      hasVercelCronHeader: !!vercelCronHeader,
      hasAuthHeader: !!authHeader,
      hasCronSecret: !!cronSecret,
    });

    // If CRON_SECRET is set and this is NOT a Vercel cron request, verify it
    // Vercel cron jobs send x-vercel-cron header, so we allow those automatically
    if (
      cronSecret &&
      !vercelCronHeader &&
      authHeader !== `Bearer ${cronSecret}`
    ) {
      console.log("[Scheduler] ❌ Unauthorized request");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Scheduler] ✅ Authorization passed, running scheduler...");
    console.log("[Scheduler] Running automated tournament scheduler...");

    // Check database connection
    try {
      await pool.query("SELECT 1");
      console.log("[Scheduler] ✅ Database connection verified");
    } catch (dbError) {
      console.error("[Scheduler] ❌ Database connection failed:", dbError);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    const results = await runScheduler(pool);

    console.log("[Scheduler] ✅ Scheduler completed successfully");
    console.log("[Scheduler] Results:", JSON.stringify(results, null, 2));

    const response = {
      success: true,
      message: "Scheduler executed successfully",
      results,
      timestamp: new Date().toISOString(),
    };

    console.log("[Scheduler] ===== CRON ENDPOINT COMPLETED =====");
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Scheduler] ===== CRON ENDPOINT ERROR =====");
    console.error("[Scheduler] Error type:", error?.constructor?.name);
    console.error("[Scheduler] Error message:", error?.message);
    console.error("[Scheduler] Error stack:", error?.stack);
    console.error("[Scheduler] Full error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
        errorType: error?.constructor?.name,
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
