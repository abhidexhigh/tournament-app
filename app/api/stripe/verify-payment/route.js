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
    const { userId, amount, currency } = session.metadata || {};
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user ID in payment metadata" },
        { status: 400 },
      );
    }
    
    // Validate currency
    if (currency !== "diamonds" && currency !== "usd") {
      return NextResponse.json(
        { success: false, error: "Invalid currency type" },
        { status: 400 },
      );
    }

    // For USD, use the actual amount paid from Stripe (more reliable than metadata)
    // amount_total is in cents, so divide by 100 to get dollars
    let amountToAdd;
    if (currency === "usd") {
      // Use actual Stripe amount_total as source of truth (in cents, convert to dollars)
      const amountPaidInCents = session.amount_total || 0;
      amountToAdd = amountPaidInCents / 100;
      
      // Log for debugging
      console.log(`USD Payment - Metadata amount: ${amount}, Stripe amount_total (cents): ${amountPaidInCents}, Final amount: ${amountToAdd}`);
    } else {
      // For diamonds, use metadata amount
      amountToAdd = parseInt(amount) || 0;
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid diamond amount in metadata" },
          { status: 400 },
        );
      }
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
          currency: currency,
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

    // Update user's balance based on currency type
    let updateData;
    let description;
    
    if (currency === "usd") {
      const currentBalance = Number(user.usd_balance || user.balance || 0);
      const newBalance = currentBalance + amountToAdd;
      updateData = {
        usd_balance: newBalance,
      };
      description = `Purchased $${amountToAdd.toFixed(2)} USD via Stripe`;
      
      console.log(`Updating USD balance - User: ${userId}, Current: ${currentBalance}, Adding: ${amountToAdd}, New: ${newBalance}`);
    } else {
      const currentDiamonds = Number(user.diamonds || 0);
      const newDiamonds = currentDiamonds + amountToAdd;
      updateData = {
        diamonds: newDiamonds,
      };
      description = `Purchased ${amountToAdd.toLocaleString()} diamonds via Stripe`;
      
      console.log(`Updating diamonds - User: ${userId}, Current: ${currentDiamonds}, Adding: ${amountToAdd}, New: ${newDiamonds}`);
    }

    // Update user balance - this must succeed before creating transaction
    let updatedUser;
    try {
      updatedUser = await usersDb.update(userId, updateData);
      console.log(`User balance updated successfully - User: ${userId}, Updated balance:`, 
        currency === "usd" ? updatedUser.usd_balance || updatedUser.balance : updatedUser.diamonds);
    } catch (updateError) {
      console.error(`Failed to update user balance for user ${userId}:`, updateError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update wallet balance: ${updateError.message}`,
        },
        { status: 500 },
      );
    }

    // Verify the update actually happened
    if (!updatedUser) {
      console.error(`User update returned null for user ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: "User update failed - no user returned",
        },
        { status: 500 },
      );
    }

    // Create transaction record only after successful balance update
    let transaction;
    try {
      transaction = await transactionsDb.create({
        user_id: userId,
        type: "wallet_topup",
        amount: amountToAdd,
        description: description,
        tournament_id: null,
        payment_id: session.payment_intent,
        payment_method: "stripe",
        currency: currency,
        ticket_type: null,
      });
      console.log(`Transaction created successfully - ID: ${transaction.id || 'unknown'}`);
    } catch (transactionError) {
      console.error(`Failed to create transaction for user ${userId}:`, transactionError);
      // Transaction creation failed, but balance was already updated
      // This is a problem - we should ideally rollback, but for now just log
      return NextResponse.json(
        {
          success: false,
          error: `Balance updated but transaction record failed: ${transactionError.message}`,
        },
        { status: 500 },
      );
    }

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
      { status: 500 },
    );
  }
}
