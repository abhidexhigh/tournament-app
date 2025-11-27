// API route: /api/tournaments/[id]/join
import { NextResponse } from "next/server";
import {
  tournamentsDb,
  usersDb,
  transactionsDb,
} from "../../../../lib/database";
// Ticket imports removed - simplified to single ticket type (1 ticket = $1 USD)

// POST /api/tournaments/[id]/join - Join tournament
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id, payment_method = "diamonds" } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const tournament = await tournamentsDb.getById(id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 },
      );
    }

    if (tournament.status !== "upcoming") {
      return NextResponse.json(
        { success: false, error: "Tournament is not accepting participants" },
        { status: 400 },
      );
    }

    const user = await usersDb.getById(user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (user.type !== "player") {
      return NextResponse.json(
        { success: false, error: "Only players can join tournaments" },
        { status: 400 },
      );
    }

    // Check if user meets minimum rank requirement
    if (tournament.min_rank) {
      const rankOrder = {
        Silver: 1,
        Gold: 2,
        Platinum: 3,
        Diamond: 4,
        Master: 5,
      };

      const userRankLevel = rankOrder[user.rank] || 0;
      const requiredRankLevel = rankOrder[tournament.min_rank] || 0;

      if (userRankLevel < requiredRankLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient rank! This tournament requires ${
              tournament.min_rank
            } rank or higher. Your current rank: ${user.rank || "No rank set"}`,
          },
          { status: 400 },
        );
      }
    }

    // Check payment method validity
    const entryFee = tournament.entry_fee || 0;
    const entryFeeUSD = tournament.entry_fee_usd || 0;
    const requiresPayment = entryFee > 0 || entryFeeUSD > 0;

    // Validate payment method based on display_type
    // Tournaments can only use tickets, Events can use all three
    if (tournament.display_type === "tournament") {
      if (payment_method !== "tickets") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Tournaments can only be joined using tickets. Please use tickets to join this tournament.",
          },
          { status: 400 },
        );
      }
    }

    // Validate payment method for ticket-based tournaments
    if (payment_method === "tickets") {
      // Tournaments always accept tickets, Events need accepts_tickets flag
      const acceptsTickets =
        tournament.display_type === "tournament" || tournament.accepts_tickets;
      if (!acceptsTickets) {
        return NextResponse.json(
          {
            success: false,
            error: "This tournament does not accept ticket payments.",
          },
          { status: 400 },
        );
      }

      if (requiresPayment) {
        // Calculate tickets needed: 1 ticket = $1 USD
        const ticketsNeeded = Math.ceil(entryFeeUSD);
        const userTickets = user.tickets || 0;

        // Check if user has enough tickets
        if (userTickets < ticketsNeeded) {
          return NextResponse.json(
            {
              success: false,
              error: `You need ${ticketsNeeded} ticket${ticketsNeeded > 1 ? "s" : ""} to join this tournament. You have ${userTickets}.`,
            },
            { status: 400 },
          );
        }
      }
    } else if (payment_method === "diamonds") {
      // Check if user has enough diamonds for entry fee
      if (user.diamonds < entryFee) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient diamonds! You need ${entryFee} diamonds to join this tournament.`,
          },
          { status: 400 },
        );
      }
    } else if (payment_method === "usd") {
      // Check if user has enough USD for entry fee
      if ((user.usd_balance || 0) < entryFeeUSD) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient USD! You need $${entryFeeUSD} to join this tournament.`,
          },
          { status: 400 },
        );
      }
    }

    try {
      // Add participant to tournament
      const updatedTournament = await tournamentsDb.addParticipant(id, user_id);

      // Deduct entry fee based on payment method
      if (payment_method === "tickets" && requiresPayment) {
        // Calculate tickets needed: 1 ticket = $1 USD
        const ticketsNeeded = Math.ceil(entryFeeUSD);
        const currentTickets = user.tickets || 0;

        // Deduct tickets
        await usersDb.update(user_id, {
          tickets: currentTickets - ticketsNeeded,
        });

        // Add transaction record
        await transactionsDb.create({
          user_id: user_id,
          type: "ticket_use",
          amount: -ticketsNeeded,
          description: `Used ${ticketsNeeded} ticket${ticketsNeeded > 1 ? "s" : ""} for ${tournament.title}`,
          tournament_id: id,
          currency: "tickets",
        });
      } else if (entryFee > 0) {
        // Deduct diamonds (default)
        await usersDb.updateDiamonds(user_id, -entryFee);

        // Add transaction record
        await transactionsDb.create({
          user_id: user_id,
          type: "tournament_entry",
          amount: -entryFee,
          description: `Entry fee for ${tournament.title}`,
          tournament_id: id,
          currency: "diamonds",
        });
      }

      return NextResponse.json({ success: true, data: updatedTournament });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
