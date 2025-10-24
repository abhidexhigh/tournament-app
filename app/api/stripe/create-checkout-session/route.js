// API route: /api/stripe/create-checkout-session
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPackageById,
  calculateTotalDiamonds,
  calculateTotalUSD,
  isUSDPackage,
} from "../../../lib/stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request) {
  try {
    const { packageId, userId, userEmail } = await request.json();

    // Validate input
    if (!packageId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get package details
    const packageData = getPackageById(packageId);
    if (!packageData) {
      return NextResponse.json(
        { success: false, error: "Invalid package" },
        { status: 400 }
      );
    }

    const isUSD = isUSDPackage(packageId);
    const totalAmount = isUSD
      ? calculateTotalUSD(packageData)
      : calculateTotalDiamonds(packageData);
    const bonusText = packageData.bonus ? ` + ${packageData.bonus} Bonus` : "";

    const productName = isUSD
      ? `$${packageData.amount} USD${bonusText}`
      : `${packageData.diamonds} Diamonds${bonusText}`;

    const productDescription = isUSD
      ? `${packageData.label} - $${totalAmount} Total USD`
      : `${packageData.label} - ${totalAmount} Total Diamonds`;

    const productImage = isUSD
      ? "https://img.icons8.com/fluency/96/000000/money.png"
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
            unit_amount: Math.round(packageData.price * 100), // Convert to cents
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
        packageId: packageId,
        amount: totalAmount.toString(),
        currency: isUSD ? "usd" : "diamonds",
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
      { status: 500 }
    );
  }
}
