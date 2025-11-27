// API route: /api/stripe/verify-payment
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { usersDb, transactionsDb } from "../../../lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID" },
        { status: 400 },
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 },
      );
    }

    // Get metadata
    const { userId, amount, currency } = session.metadata;
    const amountToAdd = parseInt(amount);

    // Validate currency (should always be diamonds now)
    if (currency !== "diamonds") {
      return NextResponse.json(
        { success: false, error: "Invalid currency type" },
        { status: 400 },
      );
    }

    // Check if this payment has already been processed (idempotency)
    const allTransactions = await transactionsDb.getAll();
    const existingTransaction = allTransactions.find(
      (txn) => txn.payment_id === session.payment_intent,
    );

    if (existingTransaction) {
      // Payment already processed, return success with existing data
      const user = await usersDb.getById(userId);
      return NextResponse.json({
        success: true,
        data: {
          user: user,
          transaction: existingTransaction,
          amount: amountToAdd,
          currency: "diamonds",
        },
        message: "Payment already processed",
      });
    }

    // Get user
    const user = await usersDb.getById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Update user's diamond balance
    const updateData = {
      diamonds: (user.diamonds || 0) + amountToAdd,
    };

    const updatedUser = await usersDb.update(userId, updateData);

    // Create transaction record
    const description = `Purchased ${amountToAdd.toLocaleString()} diamonds via Stripe`;

    const transaction = await transactionsDb.create({
      user_id: userId,
      type: "wallet_topup",
      amount: amountToAdd,
      description: description,
      tournament_id: null,
      payment_id: session.payment_intent,
      payment_method: "stripe",
      currency: "diamonds",
      ticket_type: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        transaction: transaction,
        amount: amountToAdd,
        currency: "diamonds",
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify payment",
      },
      { status: 500 },
    );
  }
}
