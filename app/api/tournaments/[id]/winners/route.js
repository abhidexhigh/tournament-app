// API route: /api/tournaments/[id]/winners
import { NextResponse } from "next/server";
import {
  tournamentsDb,
  usersDb,
  transactionsDb,
} from "../../../../lib/database";
import { calculatePrizes } from "../../../../lib/prizeCalculator";

// POST /api/tournaments/[id]/winners - Declare winners
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { winners, host_id } = body;

    if (!winners || !host_id) {
      return NextResponse.json(
        { success: false, error: "Winners and host_id are required" },
        { status: 400 }
      );
    }

    const tournament = await tournamentsDb.getById(id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.host_id !== host_id) {
      return NextResponse.json(
        { success: false, error: "Only the host can declare winners" },
        { status: 403 }
      );
    }

    if (tournament.status !== "ongoing") {
      return NextResponse.json(
        {
          success: false,
          error: "Tournament must be ongoing to declare winners",
        },
        { status: 400 }
      );
    }

    // Calculate prize amounts
    const prizes = calculatePrizes(tournament);

    // Update tournament with winners
    const updatedTournament = await tournamentsDb.declareWinners(id, winners);

    // Distribute prizes
    if (winners.first && prizes.first > 0) {
      await usersDb.updateDiamonds(winners.first, prizes.first);
      await transactionsDb.create({
        user_id: winners.first,
        type: "prize_win",
        amount: prizes.first,
        description: `1st place prize from ${tournament.title}`,
        tournament_id: id,
      });
    }

    if (winners.second && prizes.second > 0) {
      await usersDb.updateDiamonds(winners.second, prizes.second);
      await transactionsDb.create({
        user_id: winners.second,
        type: "prize_win",
        amount: prizes.second,
        description: `2nd place prize from ${tournament.title}`,
        tournament_id: id,
      });
    }

    if (winners.third && prizes.third > 0) {
      await usersDb.updateDiamonds(winners.third, prizes.third);
      await transactionsDb.create({
        user_id: winners.third,
        type: "prize_win",
        amount: prizes.third,
        description: `3rd place prize from ${tournament.title}`,
        tournament_id: id,
      });
    }

    return NextResponse.json({ success: true, data: updatedTournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
