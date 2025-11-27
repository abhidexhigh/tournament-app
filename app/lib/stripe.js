// Stripe configuration and utilities
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe on client side
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Diamond conversion rate: 1 Diamond = 1 USD
export const DIAMOND_TO_USD_RATE = 1;

// Calculate USD price from diamond amount
export const calculatePrice = (diamondAmount) => {
  return diamondAmount * DIAMOND_TO_USD_RATE;
};

// Calculate diamond amount from USD price
export const calculateDiamonds = (usdAmount) => {
  return usdAmount / DIAMOND_TO_USD_RATE;
};
