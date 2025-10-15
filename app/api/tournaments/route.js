// API route: /api/tournaments
import { NextResponse } from "next/server";
import { tournamentsDb, usersDb, transactionsDb } from "../../lib/database";

// GET /api/tournaments - Get all tournaments
export async function GET() {
  try {
    const tournaments = tournamentsDb.getAll();
    return NextResponse.json({ success: true, data: tournaments });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tournaments - Create new tournament
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      game,
      date,
      time,
      max_players,
      prize_pool_type,
      prize_pool,
      prize_split_first,
      prize_split_second,
      prize_split_third,
      entry_fee,
      rules,
      image,
      host_id,
    } = body;

    // Validation
    if (
      !title ||
      !game ||
      !date ||
      !time ||
      !max_players ||
      !prize_pool_type ||
      !prize_pool ||
      !host_id ||
      entry_fee === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if host exists
    const host = usersDb.getById(host_id);
    if (!host) {
      return NextResponse.json(
        { success: false, error: "Host not found" },
        { status: 404 }
      );
    }

    // Validate prize split adds up to 100%
    const totalSplit =
      prize_split_first + prize_split_second + prize_split_third;
    if (totalSplit !== 100) {
      return NextResponse.json(
        { success: false, error: "Prize split must add up to 100%" },
        { status: 400 }
      );
    }

    const tournamentData = {
      title,
      game,
      date,
      time,
      max_players: parseInt(max_players),
      prize_pool_type,
      prize_pool: parseInt(prize_pool),
      prize_split_first: parseInt(prize_split_first),
      prize_split_second: parseInt(prize_split_second),
      prize_split_third: parseInt(prize_split_third),
      entry_fee: parseInt(entry_fee),
      rules,
      image: image || "🎮",
      host_id,
    };

    // Create tournament
    const newTournament = tournamentsDb.create(tournamentData);

    return NextResponse.json(
      { success: true, data: newTournament },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
