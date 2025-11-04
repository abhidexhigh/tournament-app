// API route: /api/tournaments/[id]/join
import { NextResponse } from "next/server";
import {
  tournamentsDb,
  usersDb,
  transactionsDb,
} from "../../../../lib/database";
import {
  getTicketValue,
  getTicketName,
  validateTicketMatch,
} from "../../../../lib/ticketConfig";

// POST /api/tournaments/[id]/join - Join tournament
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id, payment_method = "diamonds", ticket_type } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const tournament = await tournamentsDb.getById(id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.status !== "upcoming") {
      return NextResponse.json(
        { success: false, error: "Tournament is not accepting participants" },
        { status: 400 }
      );
    }

    const user = await usersDb.getById(user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.type !== "player") {
      return NextResponse.json(
        { success: false, error: "Only players can join tournaments" },
        { status: 400 }
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
          { status: 400 }
        );
      }
    }

    // Check payment method validity
    const entryFee = tournament.entry_fee || 0;
    const entryFeeUSD = tournament.entry_fee_usd || 0;

    // Validate payment method for ticket-based tournaments
    if (payment_method === "tickets") {
      if (!tournament.accepts_tickets) {
        return NextResponse.json(
          {
            success: false,
            error: "This tournament does not accept ticket payments.",
          },
          { status: 400 }
        );
      }

      if (!ticket_type) {
        return NextResponse.json(
          {
            success: false,
            error: "Ticket type must be specified for ticket payment.",
          },
          { status: 400 }
        );
      }

      // Check if ticket value matches entry fee
      if (!validateTicketMatch(ticket_type, entryFeeUSD)) {
        const ticketValue = getTicketValue(ticket_type);
        return NextResponse.json(
          {
            success: false,
            error: `Entry fee ($${entryFeeUSD}) must match ticket value ($${ticketValue}). Please use the correct ticket type.`,
          },
          { status: 400 }
        );
      }

      // Check if user has the ticket
      const userTickets = user.tickets || {};
      if (!userTickets[ticket_type] || userTickets[ticket_type] < 1) {
        const ticketName = getTicketName(ticket_type);
        return NextResponse.json(
          {
            success: false,
            error: `You don't have any ${ticketName} tickets!`,
          },
          { status: 400 }
        );
      }
    } else if (payment_method === "diamonds") {
      // Check if user has enough diamonds for entry fee
      if (user.diamonds < entryFee) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient diamonds! You need ${entryFee} diamonds to join this tournament.`,
          },
          { status: 400 }
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
          { status: 400 }
        );
      }
    }

    try {
      // Add participant to tournament
      const updatedTournament = await tournamentsDb.addParticipant(id, user_id);

      // Deduct entry fee based on payment method
      if (payment_method === "tickets" && entryFee > 0) {
        // Deduct ticket
        const currentTickets = user.tickets || {};
        await usersDb.update(user_id, {
          tickets: {
            ...currentTickets,
            [ticket_type]: currentTickets[ticket_type] - 1,
          },
        });

        // Add transaction record
        const ticketName = getTicketName(ticket_type);
        await transactionsDb.create({
          user_id: user_id,
          type: "ticket_use",
          amount: -1,
          description: `Used 1x ${ticketName} ticket for ${tournament.title}`,
          tournament_id: id,
          currency: "tickets",
          ticket_type: ticket_type,
        });
      } else if (payment_method === "usd" && entryFeeUSD > 0) {
        // Deduct USD
        await usersDb.update(user_id, {
          usd_balance: (user.usd_balance || 0) - entryFeeUSD,
        });

        // Add transaction record
        await transactionsDb.create({
          user_id: user_id,
          type: "tournament_entry",
          amount: -entryFeeUSD,
          description: `Entry fee for ${tournament.title} (USD)`,
          tournament_id: id,
          currency: "usd",
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
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
