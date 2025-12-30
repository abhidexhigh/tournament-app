// API route: /api/users/[id]
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authConfig";
import { usersDb } from "../../../lib/database";

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await usersDb.getById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If updating user type, require admin authentication
    if (body.type !== undefined) {
      const session = await getServerSession(authOptions);
      
      if (!session || session.user.type !== "game_owner") {
        return NextResponse.json(
          { success: false, error: "Unauthorized. Only admins can change user types." },
          { status: 403 },
        );
      }
    }

    // Validate clan membership if clans are being updated
    if (body.clans !== undefined) {
      if (Array.isArray(body.clans) && body.clans.length > 1) {
        return NextResponse.json(
          {
            success: false,
            error: "A user can only be part of one clan at a time",
          },
          { status: 400 },
        );
      }
    }

    const updatedUser = await usersDb.update(id, body);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    // Check if it's a clan validation error
    if (error.message.includes("one clan at a time")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PATCH /api/users/[id]/diamonds - Update user diamonds
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== "number") {
      return NextResponse.json(
        { success: false, error: "Amount must be a number" },
        { status: 400 },
      );
    }

    const updatedUser = await usersDb.updateDiamonds(id, amount);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
