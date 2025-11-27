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
          const { userId, diamonds } = session.metadata;
          const diamondsToAdd = parseInt(diamonds);

          // Get user
          const user = await usersDb.getById(userId);
          if (user) {
            // Update user's diamond balance
            await usersDb.update(userId, {
              diamonds: user.diamonds + diamondsToAdd,
            });

            // Create transaction record
            await transactionsDb.create({
              user_id: userId,
              type: "wallet_topup",
              amount: diamondsToAdd,
              description: `Wallet top-up: ${diamondsToAdd} diamonds via Stripe (Webhook)`,
              tournament_id: null,
              payment_id: session.payment_intent,
              payment_method: "stripe",
            });

            console.log(
              `Successfully credited ${diamondsToAdd} diamonds to user ${userId}`,
            );
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
