// API route: /api/users
import { NextResponse } from "next/server";
import { usersDb } from "../../lib/database";

// GET /api/users - Get all users or filter by email
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const user = await usersDb.getByEmail(email);
      return NextResponse.json({ success: true, data: user });
    }

    const users = await usersDb.getAll();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST /api/users - Create new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, type, avatar, clans } = body;

    // Validation
    if (!username || !email || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate clan membership: a user can only be in ONE clan
    if (clans !== undefined) {
      if (Array.isArray(clans) && clans.length > 1) {
        return NextResponse.json(
          {
            success: false,
            error: "A user can only be part of one clan at a time",
          },
          { status: 400 },
        );
      }
    }

    // Check if user already exists
    const existingUser = await usersDb.getByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Set initial diamonds based on type
    const initialDiamonds = type === "host" ? 5000 : 1000;

    const userData = {
      username,
      email,
      type,
      diamonds: initialDiamonds,
      avatar: avatar || (type === "host" ? "👑" : "🎮"),
      clans: clans || [],
    };

    const newUser = await usersDb.create(userData);

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
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
