// API route: /api/users/[id]
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authConfig";
import { usersDb } from "../../../lib/database";
import {
  sanitizeWithLength,
  sanitizeEmail,
} from "../../../lib/sanitize";

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
    // Parse body first (before CSRF validation to avoid reading request twice)
    const body = await request.json();
    
    // Validate CSRF token (pass body to avoid re-reading request)
    const { validateCSRFRequest } = await import("../../../lib/csrfMiddleware");
    const csrfValidation = await validateCSRFRequest(request, body);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { success: false, error: csrfValidation.error || "CSRF token validation failed" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // If updating user type, allow if it's the user themselves or an admin
    if (body.type !== undefined) {
      const session = await getServerSession(authOptions);

      if (
        !session ||
        (session.user.id !== id && session.user.type !== "game_owner")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized. Only admins or the user themselves can change user types.",
          },
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

    // Sanitize user input fields if they're being updated
    const updateData = { ...body };
    if (updateData.username !== undefined) {
      updateData.username = sanitizeWithLength(updateData.username, 100);
    }
    if (updateData.email !== undefined) {
      const sanitizedEmail = sanitizeEmail(updateData.email);
      if (!sanitizedEmail) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 },
        );
      }
      updateData.email = sanitizedEmail;
    }
    if (updateData.avatar !== undefined) {
      updateData.avatar = sanitizeWithLength(updateData.avatar, 50);
    }

    const updatedUser = await usersDb.update(id, updateData);

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
