// API route: /api/tournaments/[id]/join
import { NextResponse } from "next/server";
import {
  tournamentsDb,
  usersDb,
  transactionsDb,
} from "../../../../lib/database";

// POST /api/tournaments/[id]/join - Join tournament
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const tournament = tournamentsDb.getById(id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.status !== "upcoming") {
      return NextResponse.json(
        { success: false, error: "Tournament is not accepting participants" },
        { status: 400 }
      );
    }

    const user = usersDb.getById(user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.type !== "player") {
      return NextResponse.json(
        { success: false, error: "Only players can join tournaments" },
        { status: 400 }
      );
    }

    // Check if user meets minimum rank requirement
    if (tournament.min_rank) {
      const rankOrder = {
        Silver: 1,
        Gold: 2,
        Platinum: 3,
        Diamond: 4,
        Master: 5,
      };

      const userRankLevel = rankOrder[user.rank] || 0;
      const requiredRankLevel = rankOrder[tournament.min_rank] || 0;

      if (userRankLevel < requiredRankLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient rank! This tournament requires ${
              tournament.min_rank
            } rank or higher. Your current rank: ${user.rank || "No rank set"}`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user has enough diamonds for entry fee
    const entryFee = tournament.entry_fee || 0;
    if (user.diamonds < entryFee) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient diamonds! You need ${entryFee} diamonds to join this tournament.`,
        },
        { status: 400 }
      );
    }

    try {
      // Add participant to tournament
      const updatedTournament = tournamentsDb.addParticipant(id, user_id);

      // Deduct entry fee from user
      if (entryFee > 0) {
        usersDb.updateDiamonds(user_id, -entryFee);

        // Add transaction record
        transactionsDb.create({
          user_id: user_id,
          type: "tournament_entry",
          amount: -entryFee,
          description: `Entry fee for ${tournament.title}`,
          tournament_id: id,
        });
      }

      return NextResponse.json({ success: true, data: updatedTournament });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
