// API route: /api/tournaments
import { NextResponse } from "next/server";
import { tournamentsDb, usersDb, transactionsDb } from "../../lib/database";
import {
  sanitizeForDatabase,
  sanitizeWithLength,
  sanitizeUrl,
} from "../../lib/sanitize";

// GET /api/tournaments - Get all tournaments
export async function GET() {
  try {
    const tournaments = await tournamentsDb.getAll();
    return NextResponse.json({ success: true, data: tournaments });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST /api/tournaments - Create new tournament
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
    const {
      title,
      game,
      date,
      time,
      max_players,
      max_players_per_clan,
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
      clan_prize_mode,
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
        { status: 400 },
      );
    }

    // Check if host exists
    const host = await usersDb.getById(host_id);
    if (!host) {
      return NextResponse.json(
        { success: false, error: "Host not found" },
        { status: 404 },
      );
    }

    // Validate prize split - top 3 must be less than 100%
    const topThreeSplit =
      prize_split_first + prize_split_second + prize_split_third;
    if (topThreeSplit >= 100) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Top 3 prize split must be less than 100% to allow for additional positions",
        },
        { status: 400 },
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

    // Sanitize user input to prevent XSS attacks
    const sanitizedTitle = sanitizeWithLength(title, 200);
    const sanitizedGame = sanitizeWithLength(game, 100);
    const sanitizedRules = sanitizeWithLength(rules, 5000); // Allow longer rules
    
    // Sanitize image URL - Cloudinary URLs can be 80-150+ characters
    // Use URL-specific sanitization if it's a URL, otherwise use generic sanitization
    let sanitizedImage = "🎮"; // Default
    if (image) {
      // If it's a URL, use URL sanitization (allows up to 500 chars)
      if (image.startsWith("http://") || image.startsWith("https://")) {
        const urlSanitized = sanitizeUrl(image);
        if (urlSanitized) {
          // Ensure it doesn't exceed database limit (VARCHAR(255))
          sanitizedImage = urlSanitized.length > 255 ? urlSanitized.substring(0, 255) : urlSanitized;
        }
      } else {
        // For emoji or short strings, use generic sanitization with length limit
        sanitizedImage = sanitizeWithLength(image, 255) || "🎮";
      }
    }
    
    const sanitizedMinRank = min_rank ? sanitizeWithLength(min_rank, 50) : null;

    const tournamentData = {
      title: sanitizedTitle,
      game: sanitizedGame,
      date,
      time,
      max_players: parseInt(max_players),
      max_players_per_clan: max_players_per_clan
        ? parseInt(max_players_per_clan)
        : null,
      min_rank: sanitizedMinRank,
      prize_pool_type,
      prize_pool: parseInt(prize_pool),
      prize_pool_usd: parseFloat(prize_pool_usd) || 0,
      prize_split_first: parseInt(prize_split_first),
      prize_split_second: parseInt(prize_split_second),
      prize_split_third: parseInt(prize_split_third),
      additional_prize_positions:
        parseInt(body.additional_prize_positions) || 0,
      entry_fee: parseInt(entry_fee),
      entry_fee_usd: parseFloat(entry_fee_usd) || 0,
      rules: sanitizedRules,
      image: sanitizedImage,
      host_id,
      tournament_type: tournament_type || "regular",
      clan_battle_mode: clan_battle_mode || null,
      clan_prize_mode: clan_prize_mode || null,
      clan1_id: clan1_id || null,
      clan2_id: clan2_id || null,
      accepts_tickets: accepts_tickets || false,
      expires_at,
    };

    // Create tournament
    const newTournament = await tournamentsDb.create(tournamentData);

    return NextResponse.json(
      { success: true, data: newTournament },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
