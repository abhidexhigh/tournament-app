"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import {
  PRIMARY_CURRENCY,
  getPrimaryCurrency,
  CONVERSION_RATE,
} from "../lib/currencyConfig";
import { useTranslations } from "../contexts/LocaleContext";

export default function TopupModal({ isOpen, onClose, user }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  
  const currencyInfo = getPrimaryCurrency();
  const currencyType = PRIMARY_CURRENCY === "USD" ? "usd" : "diamonds";
  const isUSD = PRIMARY_CURRENCY === "USD";

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handlePurchase = async () => {
    const purchaseAmount = parseFloat(amount);

    // Validation
    if (!purchaseAmount || purchaseAmount < 1) {
      setError(`Please enter a valid amount (minimum ${isUSD ? "$1" : "1 diamond"})`);
      return;
    }

    if (purchaseAmount > 100000) {
      setError(`Maximum purchase limit is ${isUSD ? "$100,000" : "100,000 diamonds"}`);
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
          amount: purchaseAmount,
          userId: user.id,
          userEmail: user.email,
          currency: currencyType,
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
    const purchaseAmount = parseFloat(amount) || 0;
    if (isUSD) {
      return purchaseAmount; // USD direct
    } else {
      return purchaseAmount * CONVERSION_RATE.DIAMOND_TO_USD; // Convert diamonds to USD for price
    }
  };

  const getCurrentBalance = () => {
    if (isUSD) {
      return `$${(user?.balance || 0).toFixed(2)}`;
    } else {
      return `${(user?.diamonds || 0).toLocaleString()} 💎`;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="animate-slideUp w-full max-w-md">
        <div className="bg-dark-card/95 border-gold-dark/30 rounded-xl border p-6 shadow-2xl backdrop-blur-md md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-gold mb-2 text-2xl font-bold">
                {currencyInfo.emoji} {t("buyFor")} {currencyInfo.displayName}
              </h2>
              <p className="text-sm text-gray-400">
                {t("enterAmount")}
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
              <p className="mb-1 text-xs text-gray-400">{t("currentBalance")}</p>
              <p className="text-gold text-3xl font-bold">
                {getCurrentBalance()}
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <Input
              label={`Amount (${currencyInfo.displayName})`}
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder={isUSD ? "Enter USD amount (e.g., 100)" : "Enter diamond amount (e.g., 100)"}
              icon={currencyInfo.emoji}
              min="1"
              max="100000"
              step={isUSD ? "0.01" : "1"}
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 {isUSD ? "Direct USD purchase" : `1 Diamond = $${CONVERSION_RATE.DIAMOND_TO_USD} USD`}
            </p>
          </div>

          {/* Price Display */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-dark-primary/50 border-gold-dark/30 mb-6 rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">{t("youWillReceive")}</span>
                <span className="text-gold text-xl font-bold">
                  {isUSD 
                    ? `$${parseFloat(amount).toFixed(2)}`
                    : `${parseFloat(amount).toLocaleString()} 💎`
                  }
                </span>
              </div>
              <div className="via-gold-dark/30 mb-3 h-px bg-gradient-to-r from-transparent to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t("totalPrice")}</span>
                <span className="text-2xl font-bold text-green-400">
                  ${calculatePrice().toFixed(2)}
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
            <p className="mb-3 text-xs text-gray-400">{t("quickSelect")}</p>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={loading}
                  className="bg-dark-primary/50 hover:bg-gold/20 border-gold-dark/30 hover:border-gold/50 text-gold rounded-lg border px-3 py-2 text-sm font-semibold transition-all"
                >
                  {isUSD ? `$${quickAmount}` : quickAmount}
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
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handlePurchase}
              disabled={
                loading || !amount || parseFloat(amount) < 1
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {tCommon("processing")}
                </span>
              ) : (
                `${t("buyFor")} $${calculatePrice().toFixed(2)}`
              )}
            </Button>
          </div>

          {/* Info Note */}
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-center text-xs text-blue-300">
              🔒 {t("securePayment")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
