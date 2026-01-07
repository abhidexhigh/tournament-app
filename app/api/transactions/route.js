// API route: /api/transactions
import { NextResponse } from "next/server";
import { transactionsDb } from "../../lib/database";
import { sanitizeWithLength } from "../../lib/sanitize";

// GET /api/transactions - Get all transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    let transactions;
    if (userId) {
      transactions = await transactionsDb.getByUserId(userId);
    } else {
      transactions = await transactionsDb.getAll();
    }

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request) {
  try {
    // Parse body first (before CSRF validation to avoid reading request twice)
    const body = await request.json();
    
    // Validate CSRF token (pass body to avoid re-reading request)
    const { validateCSRFRequest } = await import("../../lib/csrfMiddleware");
    const csrfValidation = await validateCSRFRequest(request, body);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { success: false, error: csrfValidation.error || "CSRF token validation failed" },
        { status: 403 },
      );
    }
    const { user_id, type, amount, description, tournament_id } = body;

    // Validation
    if (!user_id || !type || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Sanitize description to prevent XSS attacks
    const sanitizedDescription = sanitizeWithLength(description || "", 500);

    const transactionData = {
      user_id,
      type,
      amount,
      description: sanitizedDescription,
      tournament_id: tournament_id || null,
    };

    const newTransaction = await transactionsDb.create(transactionData);

    return NextResponse.json(
      { success: true, data: newTransaction },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
