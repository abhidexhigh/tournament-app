// API route: /api/stripe/webhook
// This handles Stripe webhook events for production use
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { usersDb, transactionsDb } from "../../../lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!webhookSecret) {
      console.warn("Stripe webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Only process if payment is complete
        if (session.payment_status === "paid") {
          const { userId, amount, currency, diamonds } = session.metadata || {};
          
          if (!userId) {
            console.error("Missing userId in webhook metadata");
            break;
          }
          
          // Handle both USD and diamonds, with backward compatibility for old metadata format
          const currencyType = currency || "diamonds"; // Default to diamonds for backward compatibility
          
          let amountToAdd;
          if (currencyType === "usd") {
            // For USD, use the actual amount paid from Stripe (more reliable than metadata)
            // amount_total is in cents, so divide by 100 to get dollars
            const amountPaidInCents = session.amount_total || 0;
            amountToAdd = amountPaidInCents / 100;
            
            // Log for debugging
            console.log(`USD Webhook - Metadata amount: ${amount}, Stripe amount_total (cents): ${amountPaidInCents}, Final amount: ${amountToAdd}`);
          } else {
            // For diamonds, use metadata amount
            const amountValue = amount || diamonds; // Support old metadata format with 'diamonds' key
            amountToAdd = parseInt(amountValue) || 0;
            if (isNaN(amountToAdd) || amountToAdd <= 0) {
              console.error(`Invalid diamond amount in webhook metadata: ${amountValue}`);
              break;
            }
          }

          // Check if this payment has already been processed (idempotency)
          const allTransactions = await transactionsDb.getAll();
          const existingTransaction = allTransactions.find(
            (txn) => txn.payment_id === session.payment_intent,
          );

          if (existingTransaction) {
            console.log(`Payment ${session.payment_intent} already processed via webhook, skipping`);
            break;
          }

          // Get user
          const user = await usersDb.getById(userId);
          if (!user) {
            console.error(`User ${userId} not found in webhook`);
            break;
          }

          let updateData;
          let description;
          
          if (currencyType === "usd") {
            const currentBalance = Number(user.usd_balance || user.balance || 0);
            const newBalance = currentBalance + amountToAdd;
            updateData = {
              usd_balance: newBalance,
            };
            description = `Wallet top-up: $${amountToAdd.toFixed(2)} USD via Stripe (Webhook)`;
            
            console.log(`Webhook updating USD balance - User: ${userId}, Current: ${currentBalance}, Adding: ${amountToAdd}, New: ${newBalance}`);
          } else {
            const currentDiamonds = Number(user.diamonds || 0);
            const newDiamonds = currentDiamonds + amountToAdd;
            updateData = {
              diamonds: newDiamonds,
            };
            description = `Wallet top-up: ${amountToAdd} diamonds via Stripe (Webhook)`;
            
            console.log(`Webhook updating diamonds - User: ${userId}, Current: ${currentDiamonds}, Adding: ${amountToAdd}, New: ${newDiamonds}`);
          }

          // Update user's balance - this must succeed before creating transaction
          try {
            const updatedUser = await usersDb.update(userId, updateData);
            console.log(`Webhook: User balance updated successfully - User: ${userId}, Updated balance:`, 
              currencyType === "usd" ? updatedUser.usd_balance || updatedUser.balance : updatedUser.diamonds);
            
            // Create transaction record only after successful balance update
            await transactionsDb.create({
              user_id: userId,
              type: "wallet_topup",
              amount: amountToAdd,
              description: description,
              tournament_id: null,
              payment_id: session.payment_intent,
              payment_method: "stripe",
              currency: currencyType,
            });

            console.log(
              `Successfully credited ${amountToAdd} ${currencyType} to user ${userId} via webhook`,
            );
          } catch (updateError) {
            console.error(`Webhook failed to update user balance for user ${userId}:`, updateError);
            // Don't break here, let the error be logged but continue processing other events
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.error("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// Important: Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
