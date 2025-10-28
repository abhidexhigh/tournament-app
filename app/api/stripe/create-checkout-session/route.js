// API route: /api/stripe/create-checkout-session
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPackageById,
  calculateTotalDiamonds,
  calculateTotalUSD,
  isTicketPackage,
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

    const isTickets = isTicketPackage(packageId);
    const isUSD = isUSDPackage(packageId);

    let totalAmount, productName, productDescription, productImage, currency;

    if (isTickets) {
      totalAmount = packageData.quantity;
      productName = `${
        packageData.quantity
      }x $${packageData.ticket_value.toFixed(2)} Tickets`;
      productDescription = `${packageData.label} - Save ${(
        ((packageData.total_value - packageData.price) /
          packageData.total_value) *
        100
      ).toFixed(0)}%`;
      productImage = "https://img.icons8.com/fluency/96/000000/ticket.png";
      currency = "tickets";
    } else if (isUSD) {
      totalAmount = calculateTotalUSD(packageData);
      const bonusText = packageData.bonus
        ? ` + ${packageData.bonus} Bonus`
        : "";
      productName = `$${packageData.amount} USD${bonusText}`;
      productDescription = `${packageData.label} - $${totalAmount} Total USD`;
      productImage = "https://img.icons8.com/fluency/96/000000/money.png";
      currency = "usd";
    } else {
      totalAmount = calculateTotalDiamonds(packageData);
      const bonusText = packageData.bonus
        ? ` + ${packageData.bonus} Bonus`
        : "";
      productName = `${packageData.diamonds} Diamonds${bonusText}`;
      productDescription = `${packageData.label} - ${totalAmount} Total Diamonds`;
      productImage = "https://img.icons8.com/fluency/96/000000/diamond.png";
      currency = "diamonds";
    }

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
        currency: currency,
        ticket_type: isTickets ? packageId : null,
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
