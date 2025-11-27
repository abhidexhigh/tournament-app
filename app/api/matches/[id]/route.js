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

// GET - Get match by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const matches = readMatches();
    const match = matches.find((m) => m.id === id);

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch match" },
      { status: 500 },
    );
  }
}

// PUT - Update match
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();
    const matches = readMatches();
    const matchIndex = matches.findIndex((m) => m.id === id);

    if (matchIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 },
      );
    }

    // Update match with new data
    matches[matchIndex] = {
      ...matches[matchIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    writeMatches(matches);

    return NextResponse.json({
      success: true,
      data: matches[matchIndex],
      message: "Match updated successfully",
    });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update match" },
      { status: 500 },
    );
  }
}

// DELETE - Delete match
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const matches = readMatches();
    const matchIndex = matches.findIndex((m) => m.id === id);

    if (matchIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 },
      );
    }

    matches.splice(matchIndex, 1);
    writeMatches(matches);

    return NextResponse.json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
