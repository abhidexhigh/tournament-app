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

    // Validate currency
    if (currency !== "diamonds" && currency !== "usd") {
      return NextResponse.json(
        { success: false, error: "Invalid currency type. Must be 'diamonds' or 'usd'" },
        { status: 400 },
      );
    }

    // Validate amount
    const purchaseAmount = currency === "usd" ? parseFloat(amount) : parseInt(amount);
    if (isNaN(purchaseAmount) || purchaseAmount < 1) {
      return NextResponse.json(
        { success: false, error: `Invalid amount (minimum 1 ${currency === "usd" ? "USD" : "diamond"})` },
        { status: 400 },
      );
    }

    if (purchaseAmount > 100000) {
      return NextResponse.json(
        { success: false, error: `Maximum purchase limit is 100,000 ${currency === "usd" ? "USD" : "diamonds"}` },
        { status: 400 },
      );
    }

    // Calculate price: 1 Diamond = 1 USD, USD is direct
    const priceInUSD = currency === "usd" ? purchaseAmount : purchaseAmount;

    // Set product details based on currency
    const productName = currency === "usd" 
      ? `$${purchaseAmount.toFixed(2)} USD Wallet Top-Up`
      : `${purchaseAmount.toLocaleString()} Diamonds`;
    const productDescription = currency === "usd"
      ? `Purchase $${purchaseAmount.toFixed(2)} USD for your wallet`
      : `Purchase ${purchaseAmount.toLocaleString()} diamonds for your wallet`;
    const productImage = currency === "usd"
      ? "https://img.icons8.com/fluency/96/000000/dollar.png"
      : "https://img.icons8.com/fluency/96/000000/diamond.png";

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
        amount: purchaseAmount.toString(),
        currency: currency,
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
