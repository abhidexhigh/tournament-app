// API route: /api/tournaments/[id]
import { NextResponse } from "next/server";
import { tournamentsDb, usersDb, transactionsDb, pool } from "../../../lib/database";

// GET /api/tournaments/[id] - Get tournament by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tournament = await tournamentsDb.getById(id);

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/tournaments/[id] - Update tournament
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedTournament = await tournamentsDb.update(id, body);

    if (!updatedTournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedTournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/tournaments/[id] - Cancel tournament and refund participants
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { host_id } = body;

    // Get tournament
    const tournament = await tournamentsDb.getById(id);

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 },
      );
    }

    // Verify the requester is the host
    if (tournament.host_id !== host_id) {
      return NextResponse.json(
        { success: false, error: "Only the host can cancel this tournament" },
        { status: 403 },
      );
    }

    // Only allow cancellation of upcoming tournaments
    if (tournament.status !== "upcoming") {
      return NextResponse.json(
        { success: false, error: "Only upcoming tournaments can be cancelled" },
        { status: 400 },
      );
    }

    const refundedParticipants = [];
    const participants = tournament.participants || [];

    // Refund each participant
    for (const participantId of participants) {
      try {
        // Find the original entry transaction for this participant
        const transactionResult = await pool.query(
          `SELECT * FROM transactions 
           WHERE tournament_id = $1 
           AND user_id = $2 
           AND type = 'tournament_entry'
           ORDER BY created_at DESC 
           LIMIT 1`,
          [tournament.id, participantId],
        );

        const originalTransaction = transactionResult.rows[0];

        if (originalTransaction) {
          const refundAmount = Math.abs(originalTransaction.amount);
          const currency = originalTransaction.currency || "diamonds";

          // Refund based on currency type
          if (currency === "usd") {
            // Refund USD
            const user = await usersDb.getById(participantId);
            if (user) {
              const currentBalance = Number(
                user.balance || user.usd_balance || 0,
              );
              await usersDb.update(participantId, {
                usd_balance: currentBalance + refundAmount,
              });
            }
          } else {
            // Refund diamonds (default)
            await usersDb.updateDiamonds(participantId, refundAmount);
          }

          // Create refund transaction record
          await transactionsDb.create({
            user_id: participantId,
            type: "tournament_refund",
            amount: refundAmount,
            description: `Refund for cancelled tournament: ${tournament.title} (cancelled by host)`,
            tournament_id: tournament.id,
            currency: currency,
          });

          refundedParticipants.push({
            participantId,
            refundAmount,
            currency,
          });

          console.log(
            `[Cancel Tournament] Refunded ${refundAmount} ${currency} to user ${participantId}`,
          );
        }
      } catch (refundError) {
        console.error(
          `[Cancel Tournament] Error refunding participant ${participantId}:`,
          refundError,
        );
      }
    }

    // Mark tournament as cancelled by host
    const cancelledTournament = await tournamentsDb.update(id, {
      status: "cancelled",
      cancelled_by: "host",
    });

    console.log(
      `[Cancel Tournament] Tournament ${tournament.title} cancelled by host. Refunded ${refundedParticipants.length} participant(s).`,
    );

    return NextResponse.json({
      success: true,
      data: cancelledTournament,
      refundedCount: refundedParticipants.length,
      refunded: refundedParticipants,
      message: `Tournament cancelled successfully. ${refundedParticipants.length} participant(s) refunded.`,
    });
  } catch (error) {
    console.error("[Cancel Tournament] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
