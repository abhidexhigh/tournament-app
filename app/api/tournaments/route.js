// API route: /api/tournaments
import { NextResponse } from "next/server";
import { tournamentsDb, usersDb, transactionsDb } from "../../lib/database";

// GET /api/tournaments - Get all tournaments
export async function GET() {
  try {
    const tournaments = await tournamentsDb.getAll();
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
      prize_pool_usd,
      prize_split_first,
      prize_split_second,
      prize_split_third,
      entry_fee,
      entry_fee_usd,
      rules,
      image,
      host_id,
      tournament_type,
      clan_battle_mode,
      clan1_id,
      clan2_id,
      min_rank,
      accepts_tickets,
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
    const host = await usersDb.getById(host_id);
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

    let expires_at = body.expires_at || null;
    if (!expires_at && date && time) {
      try {
        const combinedDate = new Date(`${date}T${time}`);
        if (!isNaN(combinedDate.getTime())) {
          expires_at = combinedDate.toISOString();
        }
      } catch (err) {
        console.warn("Invalid date/time provided for expires_at:", err);
      }
    }

    const tournamentData = {
      title,
      game,
      date,
      time,
      max_players: parseInt(max_players),
      min_rank: min_rank || null,
      prize_pool_type,
      prize_pool: parseInt(prize_pool),
      prize_pool_usd: parseFloat(prize_pool_usd) || 0,
      prize_split_first: parseInt(prize_split_first),
      prize_split_second: parseInt(prize_split_second),
      prize_split_third: parseInt(prize_split_third),
      entry_fee: parseInt(entry_fee),
      entry_fee_usd: parseFloat(entry_fee_usd) || 0,
      rules,
      image: image || "🎮",
      host_id,
      tournament_type: tournament_type || "regular",
      clan_battle_mode: clan_battle_mode || null,
      clan1_id: clan1_id || null,
      clan2_id: clan2_id || null,
      accepts_tickets: accepts_tickets || false,
      expires_at,
    };

    // Create tournament
    const newTournament = await tournamentsDb.create(tournamentData);

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
