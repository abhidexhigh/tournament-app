// Stripe configuration and utilities
import { loadStripe } from "@stripe/stripe-js";
import { getTicketPackages } from "./ticketConfig";

// Initialize Stripe on client side
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Ticket packages - Imported from central config
export const TICKET_PACKAGES = getTicketPackages();

// USD packages - Direct USD top-up
export const USD_PACKAGES = [
  {
    id: "usd_5",
    amount: 5,
    price: 5.0,
    label: "Starter",
    popular: false,
    currency: "usd",
  },
  {
    id: "usd_10",
    amount: 10,
    price: 10.0,
    label: "Popular",
    popular: true,
    bonus: 1, // $1 bonus
    currency: "usd",
  },
  {
    id: "usd_25",
    amount: 25,
    price: 25.0,
    label: "Best Value",
    popular: false,
    bonus: 3, // $3 bonus
    currency: "usd",
  },
  {
    id: "usd_50",
    amount: 50,
    price: 50.0,
    label: "Pro Pack",
    popular: false,
    bonus: 7, // $7 bonus
    currency: "usd",
  },
  {
    id: "usd_100",
    amount: 100,
    price: 100.0,
    label: "Elite Pack",
    popular: false,
    bonus: 15, // $15 bonus
    currency: "usd",
  },
  {
    id: "usd_250",
    amount: 250,
    price: 250.0,
    label: "Ultimate Pack",
    popular: false,
    bonus: 50, // $50 bonus
    currency: "usd",
  },
];

// Diamond packages with USD pricing
export const DIAMOND_PACKAGES = [
  {
    id: "package_100",
    diamonds: 100,
    price: 0.99,
    label: "Starter Pack",
    popular: false,
  },
  {
    id: "package_500",
    diamonds: 500,
    price: 4.99,
    label: "Popular",
    popular: true,
    bonus: 50, // 10% bonus
  },
  {
    id: "package_1000",
    diamonds: 1000,
    price: 8.99,
    label: "Best Value",
    popular: false,
    bonus: 150, // 15% bonus
  },
  {
    id: "package_2500",
    diamonds: 2500,
    price: 19.99,
    label: "Pro Pack",
    popular: false,
    bonus: 500, // 20% bonus
  },
  {
    id: "package_5000",
    diamonds: 5000,
    price: 34.99,
    label: "Elite Pack",
    popular: false,
    bonus: 1250, // 25% bonus
  },
  {
    id: "package_10000",
    diamonds: 10000,
    price: 59.99,
    label: "Ultimate Pack",
    popular: false,
    bonus: 3000, // 30% bonus
  },
];

// Get package by ID (searches USD, Diamond, and Ticket packages)
export const getPackageById = (packageId) => {
  const ticketPackage = TICKET_PACKAGES.find((pkg) => pkg.id === packageId);
  if (ticketPackage) return ticketPackage;

  const usdPackage = USD_PACKAGES.find((pkg) => pkg.id === packageId);
  if (usdPackage) return usdPackage;

  const diamondPackage = DIAMOND_PACKAGES.find((pkg) => pkg.id === packageId);
  return diamondPackage;
};

// Calculate total diamonds (base + bonus)
export const calculateTotalDiamonds = (packageData) => {
  return packageData.diamonds + (packageData.bonus || 0);
};

// Calculate total USD (base + bonus)
export const calculateTotalUSD = (packageData) => {
  return packageData.amount + (packageData.bonus || 0);
};

// Check package type
export const isTicketPackage = (packageId) => {
  return packageId.startsWith("ticket_");
};

export const isUSDPackage = (packageId) => {
  return packageId.startsWith("usd_");
};

export const isDiamondPackage = (packageId) => {
  return packageId.startsWith("package_");
};
