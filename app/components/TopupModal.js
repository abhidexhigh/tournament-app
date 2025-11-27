"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";

export default function TopupModal({ isOpen, onClose, user }) {
  const [diamondAmount, setDiamondAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDiamondAmount("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handlePurchase = async () => {
    const amount = parseInt(diamondAmount);

    // Validation
    if (!amount || amount < 1) {
      setError("Please enter a valid amount (minimum 1 diamond)");
      return;
    }

    if (amount > 100000) {
      setError("Maximum purchase limit is 100,000 diamonds");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create checkout session with custom amount
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          userId: user.id,
          userEmail: user.email,
          currency: "diamonds",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message || "Failed to process payment. Please try again.");
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    const amount = parseInt(diamondAmount) || 0;
    return amount; // 1 Diamond = 1 USD
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="animate-slideUp w-full max-w-md">
        <div className="bg-dark-card/95 border-gold-dark/30 rounded-xl border p-6 shadow-2xl backdrop-blur-md md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-gold mb-2 text-2xl font-bold">
                💎 Buy Diamonds
              </h2>
              <p className="text-sm text-gray-400">
                Enter the amount of diamonds you want to purchase
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 transition-colors hover:text-white"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* Current Balance */}
          <div className="from-gold/10 to-gold/5 border-gold/30 mb-6 rounded-lg border bg-gradient-to-br p-4">
            <div className="text-center">
              <p className="mb-1 text-xs text-gray-400">Current Balance</p>
              <p className="text-gold text-3xl font-bold">
                {(user?.diamonds || 0).toLocaleString()} 💎
              </p>
            </div>
          </div>

          {/* Diamond Amount Input */}
          <div className="mb-6">
            <Input
              label="Diamond Amount"
              type="number"
              value={diamondAmount}
              onChange={(e) => {
                setDiamondAmount(e.target.value);
                setError("");
              }}
              placeholder="Enter amount (e.g., 100)"
              icon="💎"
              min="1"
              max="100000"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">💡 1 Diamond = $1 USD</p>
          </div>

          {/* Price Display */}
          {diamondAmount && parseInt(diamondAmount) > 0 && (
            <div className="bg-dark-primary/50 border-gold-dark/30 mb-6 rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">You will receive:</span>
                <span className="text-gold text-xl font-bold">
                  {parseInt(diamondAmount).toLocaleString()} 💎
                </span>
              </div>
              <div className="via-gold-dark/30 mb-3 h-px bg-gradient-to-r from-transparent to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Price:</span>
                <span className="text-2xl font-bold text-green-400">
                  ${calculatePrice().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <p className="mb-3 text-xs text-gray-400">Quick Select:</p>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDiamondAmount(amount.toString())}
                  disabled={loading}
                  className="bg-dark-primary/50 hover:bg-gold/20 border-gold-dark/30 hover:border-gold/50 text-gold rounded-lg border px-3 py-2 text-sm font-semibold transition-all"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handlePurchase}
              disabled={
                loading || !diamondAmount || parseInt(diamondAmount) < 1
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : (
                `Buy for $${calculatePrice()}`
              )}
            </Button>
          </div>

          {/* Info Note */}
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-center text-xs text-blue-300">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
