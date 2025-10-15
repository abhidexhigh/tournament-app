// API route: /api/users/[id]
import { NextResponse } from "next/server";
import { usersDb } from "../../../lib/database";

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = usersDb.getById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedUser = usersDb.update(id, body);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const updatedUser = usersDb.updateDiamonds(id, amount);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
