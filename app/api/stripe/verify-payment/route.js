// API route: /api/stripe/verify-payment
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { usersDb, transactionsDb } from "../../../lib/database";
import { getTicketName } from "../../../lib/ticketConfig";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Get metadata
    const { userId, amount, currency, ticket_type } = session.metadata;
    const amountToAdd = parseFloat(amount);
    const isTickets = currency === "tickets";
    const isUSD = currency === "usd";

    // Check if this payment has already been processed (idempotency)
    const existingTransaction = transactionsDb
      .getAll()
      .find((txn) => txn.payment_id === session.payment_intent);

    if (existingTransaction) {
      // Payment already processed, return success with existing data
      const user = usersDb.getById(userId);
      return NextResponse.json({
        success: true,
        data: {
          user: user,
          transaction: existingTransaction,
          amount: amountToAdd,
          currency: currency,
        },
        message: "Payment already processed",
      });
    }

    // Get user
    const user = usersDb.getById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update user's balance (Tickets, USD, or Diamonds)
    let updateData;
    if (isTickets) {
      const currentTickets = user.tickets || {
        ticket_010: 0,
        ticket_100: 0,
        ticket_1000: 0,
      };
      updateData = {
        tickets: {
          ...currentTickets,
          [ticket_type]: (currentTickets[ticket_type] || 0) + amountToAdd,
        },
      };
    } else if (isUSD) {
      updateData = { usd_balance: (user.usd_balance || 0) + amountToAdd };
    } else {
      updateData = { diamonds: user.diamonds + amountToAdd };
    }

    const updatedUser = usersDb.update(userId, updateData);

    // Create transaction record
    let description;
    if (isTickets) {
      const ticketName = getTicketName(ticket_type);
      description = `Bought ${amountToAdd}x ${ticketName} tickets via Stripe`;
    } else if (isUSD) {
      description = `Wallet top-up: $${amountToAdd} USD via Stripe`;
    } else {
      description = `Wallet top-up: ${amountToAdd} diamonds via Stripe`;
    }

    const transaction = transactionsDb.create({
      user_id: userId,
      type: "wallet_topup",
      amount: amountToAdd,
      description: description,
      tournament_id: null,
      payment_id: session.payment_intent,
      payment_method: "stripe",
      currency: currency,
      ticket_type: ticket_type || null,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        transaction: transaction,
        amount: amountToAdd,
        currency: currency,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
