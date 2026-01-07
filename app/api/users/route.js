// API route: /api/users
import { NextResponse } from "next/server";
import { usersDb } from "../../lib/database";
import {
  sanitizeForDatabase,
  sanitizeWithLength,
  sanitizeEmail,
} from "../../lib/sanitize";

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

    // Sanitize user input to prevent XSS attacks
    const sanitizedUsername = sanitizeWithLength(username, 100);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedAvatar = sanitizeWithLength(avatar, 50) || (type === "host" ? "👑" : "🎮");

    if (!sanitizedEmail) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Set initial diamonds based on type
    const initialDiamonds = type === "host" ? 5000 : 1000;

    const userData = {
      username: sanitizedUsername,
      email: sanitizedEmail,
      type,
      diamonds: initialDiamonds,
      avatar: sanitizedAvatar,
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
