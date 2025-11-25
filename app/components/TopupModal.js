"use client";

import { useState } from "react";
import {
  TICKET_PACKAGES,
  USD_PACKAGES,
  DIAMOND_PACKAGES,
  calculateTotalDiamonds,
  calculateTotalUSD,
} from "../lib/stripe";
import Card from "./Card";
import Button from "./Button";

export default function TopupModal({ isOpen, onClose, user }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tickets"); // 'tickets', 'usd' or 'diamonds'

  if (!isOpen) return null;

  const handlePurchase = async (packageData) => {
    setLoading(true);
    setError("");
    setSelectedPackage(packageData.id);

    try {
      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: packageData.id,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout URL (modern approach)
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message || "Failed to process payment. Please try again.");
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const currentPackages =
    activeTab === "tickets"
      ? TICKET_PACKAGES
      : activeTab === "usd"
      ? USD_PACKAGES
      : DIAMOND_PACKAGES;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-dark-card/90 backdrop-blur-md border border-gold-dark/30 rounded-xl shadow-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gold mb-2">
                💰 Top Up Wallet
              </h2>
              <p className="text-gray-400 text-sm">
                Choose to add Tickets, USD, or Diamonds to your wallet
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* Current Balance */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-primary/50 border border-purple-500/30 rounded-lg p-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">🎫 Tickets</p>
                <p className="text-xl font-bold text-purple-400">
                  {(user?.tickets?.ticket_010 || 0) +
                    (user?.tickets?.ticket_100 || 0) +
                    (user?.tickets?.ticket_1000 || 0)}
                </p>
              </div>
            </div>
            <div className="bg-dark-primary/50 border border-green-500/30 rounded-lg p-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">💵 USD</p>
                <p className="text-xl font-bold text-green-400">
                  ${Number(user?.usd_balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-dark-primary/50 border border-gold/30 rounded-lg p-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">💎 Diamonds</p>
                <p className="text-xl font-bold text-gold">
                  {user?.diamonds || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("tickets")}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "tickets"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                  : "bg-dark-primary/50 text-gray-400 hover:text-white border border-purple-500/30"
              }`}
            >
              🎫 Tickets
            </button>
            <button
              onClick={() => setActiveTab("usd")}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "usd"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                  : "bg-dark-primary/50 text-gray-400 hover:text-white border border-green-500/30"
              }`}
            >
              💵 USD
            </button>
            <button
              onClick={() => setActiveTab("diamonds")}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "diamonds"
                  ? "bg-gradient-to-r from-gold to-gold-dark text-dark-primary shadow-lg"
                  : "bg-dark-primary/50 text-gray-400 hover:text-white border border-gold/30"
              }`}
            >
              💎 Diamonds
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPackages.map((pkg) => {
              const isTickets = activeTab === "tickets";
              const isUSD = activeTab === "usd";
              const isDiamonds = activeTab === "diamonds";

              let total,
                displayAmount,
                icon,
                colorClass,
                borderClass,
                popularBorder,
                popularShadow;

              if (isTickets) {
                total = pkg.quantity;
                displayAmount = pkg.quantity;
                icon = "🎫";
                colorClass = "text-purple-400";
                borderClass = "border-purple-500/30 hover:border-purple-500/50";
                popularBorder = "border-purple-500";
                popularShadow = "shadow-purple-500/20";
              } else if (isUSD) {
                total = calculateTotalUSD(pkg);
                displayAmount = pkg.amount;
                icon = "💵";
                colorClass = "text-green-400";
                borderClass = "border-green-500/30 hover:border-green-500/50";
                popularBorder = "border-green-500";
                popularShadow = "shadow-green-500/20";
              } else {
                total = calculateTotalDiamonds(pkg);
                displayAmount = pkg.diamonds;
                icon = "💎";
                colorClass = "text-gold";
                borderClass = "border-gold-dark/30 hover:border-gold/50";
                popularBorder = "border-gold";
                popularShadow = "shadow-gold/20";
              }

              const isLoading = loading && selectedPackage === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-dark-card border-2 rounded-lg p-6 transition-all duration-300 ${
                    pkg.popular
                      ? `${popularBorder} shadow-lg ${popularShadow}`
                      : borderClass
                  }`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span
                        className={`${
                          isTickets
                            ? "bg-gradient-to-r from-purple-500 to-purple-600"
                            : isUSD
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-gold to-gold-dark"
                        } text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg`}
                      >
                        {pkg.label}
                      </span>
                    </div>
                  )}

                  {/* Package Details */}
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{icon}</div>
                    {isTickets ? (
                      <>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {pkg.quantity}x ${pkg.ticket_value.toFixed(2)}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">
                          {pkg.label}
                        </p>
                        <p className={`${colorClass} text-sm font-medium`}>
                          Value: ${pkg.total_value.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {isUSD ? "$" : ""}
                          {displayAmount.toLocaleString()}
                          {isUSD ? "" : " 💎"}
                        </h3>
                        {pkg.bonus && (
                          <p className={`${colorClass} text-sm font-medium mb-2`}>
                            + {isUSD ? "$" : ""}
                            {pkg.bonus.toLocaleString()}
                            {isUSD ? "" : " 💎"} Bonus 🎁
                          </p>
                        )}
                        {!pkg.popular && (
                          <p className="text-gray-400 text-sm mb-2">
                            {pkg.label}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Total */}
                  {(pkg.bonus || isTickets) && (
                    <div className="bg-dark-primary/50 rounded-lg p-2 mb-4">
                      <p className="text-center text-gray-300 text-sm">
                        {isTickets ? (
                          <>
                            <span className="text-green-400 font-bold">
                              Save ${(pkg.total_value - pkg.price).toFixed(2)}
                            </span>
                            <span className="text-gray-400"> (10% off)</span>
                          </>
                        ) : (
                          <>
                            Total:{" "}
                            <span className={`${colorClass} font-bold`}>
                              {isUSD ? "$" : ""}
                              {total.toLocaleString()}
                              {isUSD ? "" : " 💎"}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center mb-4">
                    <p
                      className={`text-3xl font-bold ${
                        isUSD ? "text-green-400" : isTickets ? "text-purple-400" : "text-gold"
                      }`}
                    >
                      ${pkg.price.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm">USD</p>
                  </div>

                  {/* Buy Button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loading}
                    className="w-full"
                    variant={pkg.popular ? "primary" : "outline"}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </span>
                    ) : (
                      "Buy Now"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Payment Info */}
          <div className="mt-6 bg-dark-primary/50 border border-gold-dark/20 rounded-lg p-4">
            <h4 className="text-gold font-medium mb-2 flex items-center gap-2">
              🔒 Secure Payment Information
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Powered by Stripe - Industry-leading payment security</li>
              <li>
                • Test mode: Use card 4242 4242 4242 4242 with any future date
              </li>
              <li>• Your payment information is never stored on our servers</li>
              <li>
                • Balance credited instantly after successful payment
              </li>
              <li>• All transactions are encrypted and secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
