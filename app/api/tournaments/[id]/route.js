// API route: /api/tournaments/[id]
import { NextResponse } from "next/server";
import { tournamentsDb } from "../../../lib/database";

// GET /api/tournaments/[id] - Get tournament by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tournament = await tournamentsDb.getById(id);

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedTournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
