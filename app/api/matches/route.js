import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MATCHES_FILE = path.join(process.cwd(), "data", "matches.json");

// Helper function to read matches
function readMatches() {
  try {
    const fileContent = fs.readFileSync(MATCHES_FILE, "utf8");
    const data = JSON.parse(fileContent);
    return data.matches || [];
  } catch (error) {
    console.error("Error reading matches file:", error);
    return [];
  }
}

// Helper function to write matches
function writeMatches(matches) {
  try {
    const data = {
      matches: matches,
      metadata: {
        totalMatches: matches.length,
        totalPrizePool: matches.reduce((sum, m) => sum + (m.prizePool || 0), 0),
        generatedAt: new Date().toISOString(),
      },
    };
    fs.writeFileSync(MATCHES_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing matches file:", error);
    throw error;
  }
}

// GET - Get all matches or filter by query params
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("player_id");
    const tournamentId = searchParams.get("tournament_id");
    const status = searchParams.get("status");

    let matches = readMatches();

    // Filter by player ID (check if player is in leaderboard)
    if (playerId) {
      matches = matches.filter((match) =>
        match.leaderboard?.some((entry) => entry.playerId === playerId),
      );
    }

    // Filter by tournament ID
    if (tournamentId) {
      matches = matches.filter((match) => match.tournamentId === tournamentId);
    }

    // Filter by status
    if (status) {
      matches = matches.filter((match) => match.status === status);
    }

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

// POST - Create new match
export async function POST(request) {
  try {
    const matchData = await request.json();

    // Validate required fields
    if (
      !matchData.tournamentId ||
      !matchData.title ||
      !matchData.date ||
      !matchData.startTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: tournamentId, title, date, startTime",
        },
        { status: 400 },
      );
    }

    const matches = readMatches();

    // Generate unique ID
    const newMatch = {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tournamentId: matchData.tournamentId,
      title: matchData.title,
      date: matchData.date,
      startTime: matchData.startTime,
      endTime: matchData.endTime || null,
      prizePool: matchData.prizePool || 0,
      participants: matchData.participants || 0,
      status: matchData.status || "upcoming",
      leaderboard: matchData.leaderboard || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    matches.push(newMatch);
    writeMatches(matches);

    return NextResponse.json(
      {
        success: true,
        data: newMatch,
        message: "Match created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create match" },
      { status: 500 },
    );
  }
}
