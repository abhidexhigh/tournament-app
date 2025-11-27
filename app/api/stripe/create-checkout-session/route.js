// API route: /api/stripe/create-checkout-session
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request) {
  try {
    const { amount, userId, userEmail, currency } = await request.json();

    // Validate input
    if (!amount || !userId || !currency) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate amount
    const diamondAmount = parseInt(amount);
    if (isNaN(diamondAmount) || diamondAmount < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid amount (minimum 1 diamond)" },
        { status: 400 },
      );
    }

    if (diamondAmount > 100000) {
      return NextResponse.json(
        { success: false, error: "Maximum purchase limit is 100,000 diamonds" },
        { status: 400 },
      );
    }

    // Calculate price: 1 Diamond = 1 USD
    const priceInUSD = diamondAmount;

    const productName = `${diamondAmount.toLocaleString()} Diamonds`;
    const productDescription = `Purchase ${diamondAmount.toLocaleString()} diamonds for your wallet`;
    const productImage = "https://img.icons8.com/fluency/96/000000/diamond.png";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
              images: [productImage],
            },
            unit_amount: Math.round(priceInUSD * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        amount: diamondAmount.toString(),
        currency: "diamonds",
        customPurchase: "true",
      },
      billing_address_collection: "auto",
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create checkout session",
      },
      { status: 500 },
    );
  }
}
