"use client";

import Card from "../Card";
import Button from "../Button";
import { getEntryFeeDisplayDual } from "../../lib/prizeCalculator";
import { getTicketCount } from "../../lib/utils";

export default function PaymentModal({
  show,
  tournament,
  user,
  paymentMethod,
  setPaymentMethod,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-sm sm:p-4">
      <div className="my-4 w-full max-w-2xl">
        {/* Decorative background glow */}
        <div className="from-gold/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-purple-500/5 blur-3xl" />

        <Card className="border-gold-dark/30 relative overflow-hidden border-2 shadow-2xl">
          {/* Top golden accent line */}
          <div className="via-gold absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

          {/* Header with icon */}
          <div className="relative">
            <div className="mb-3 flex items-start gap-2 sm:mb-4 sm:items-center sm:gap-3">
              <div className="from-gold/20 to-gold/5 border-gold/30 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br sm:h-10 sm:w-10">
                <span className="text-xl sm:text-2xl">💳</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-gold-gradient text-lg font-bold sm:text-2xl">
                  Select Payment Method
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Choose how you&apos;d like to pay for this tournament
                </p>
              </div>
            </div>

            {/* Show info message */}
            {tournament.display_type === "tournament" ? (
              <div className="from-gold/10 border-gold/30 mb-3 rounded-lg border bg-gradient-to-r to-purple-500/10 p-2.5 backdrop-blur-sm sm:mb-4 sm:p-3">
                <div className="flex items-start gap-2 sm:items-center">
                  <div className="bg-gold/20 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8">
                    <span className="text-base sm:text-lg">⚡</span>
                  </div>
                  <p className="text-gold-light text-xs font-medium sm:text-sm">
                    Tournaments can be joined using Tickets or Diamonds
                  </p>
                </div>
              </div>
            ) : (
              <div className="from-gold/10 to-gold/5 border-gold/30 mb-3 rounded-lg border bg-gradient-to-r p-2.5 backdrop-blur-sm sm:mb-4 sm:p-3">
                <div className="flex items-start gap-2 sm:items-center">
                  <div className="bg-gold/20 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8">
                    <span className="text-base sm:text-lg">🎪</span>
                  </div>
                  <p className="text-gold-light text-xs font-medium sm:text-sm">
                    Events can only be joined using Diamonds
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Options */}
          <div
            className={`mb-3 grid grid-cols-1 gap-2 sm:mb-4 sm:gap-3 ${
              tournament.display_type === "tournament" ? "sm:grid-cols-2" : ""
            }`}
          >
            {/* Diamonds Option - Always available */}
            <PaymentOption
              type="diamonds"
              icon="💎"
              label="Diamonds"
              amount={`${getEntryFeeDisplayDual(tournament).diamonds} 💎`}
              balance={
                user && `Balance: ${(user.diamonds || 0).toLocaleString()} 💎`
              }
              selected={paymentMethod === "diamonds"}
              onClick={() => setPaymentMethod("diamonds")}
              colorClass="gold"
            />

            {/* Tickets Option - Only for Tournaments */}
            {tournament.display_type === "tournament" && (
              <PaymentOption
                type="tickets"
                icon="🎫"
                label="Tickets"
                amount={`${Math.ceil(Number(tournament.entry_fee_usd || 0))} ticket${
                  Math.ceil(Number(tournament.entry_fee_usd || 0)) > 1
                    ? "s"
                    : ""
                }`}
                balance={user && `Balance: ${getTicketCount(user.tickets)} 🎫`}
                selected={paymentMethod === "tickets"}
                onClick={() => setPaymentMethod("tickets")}
                colorClass="purple"
              />
            )}
          </div>

          {/* Entry Fee Summary */}
          <div className="from-dark-primary to-dark-secondary border-gold-dark/30 relative mb-3 rounded-lg border bg-gradient-to-br p-2.5 shadow-inner sm:mb-4 sm:p-3">
            <div className="via-gold/50 absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-xs text-gray-400">Payment Method</p>
                <p className="truncate text-xs font-bold text-white sm:text-sm">
                  {paymentMethod === "diamonds"
                    ? "💎 Diamonds"
                    : paymentMethod === "usd"
                      ? "💎 Diamonds"
                      : "🎫 Tickets"}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="mb-0.5 text-xs text-gray-400">Amount</p>
                <p className="text-gold-gradient text-base font-bold sm:text-lg">
                  {paymentMethod === "diamonds"
                    ? `${getEntryFeeDisplayDual(tournament).diamonds} 💎`
                    : paymentMethod === "usd"
                      ? `${getEntryFeeDisplayDual(tournament).diamonds} 💎`
                      : `${Math.ceil(Number(tournament.entry_fee_usd || 0))} 🎫`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={onConfirm}
              disabled={loading}
              className="group relative overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Confirm & Join</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                )}
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PaymentOption({
  type,
  icon,
  label,
  amount,
  balance,
  selected,
  onClick,
  colorClass,
}) {
  const colorStyles = {
    gold: {
      border: selected
        ? "border-gold bg-gradient-to-br from-gold/15 to-gold/5 shadow-lg shadow-gold/20"
        : "border-gold-dark/30 hover:border-gold/50 bg-dark-secondary/50",
      iconBg: selected ? "bg-gold/20 shadow-md shadow-gold/30" : "bg-gold/10",
      checkBg: "bg-gold",
      textColor: "text-gold",
      gradient: "from-gold/10",
      borderTop: "border-gold/20",
    },
    green: {
      border: selected
        ? "border-green-500 bg-gradient-to-br from-green-500/15 to-green-500/5 shadow-lg shadow-green-500/20"
        : "border-green-500/30 hover:border-green-500/50 bg-dark-secondary/50",
      iconBg: selected
        ? "bg-green-500/20 shadow-md shadow-green-500/30"
        : "bg-green-500/10",
      checkBg: "bg-green-500",
      textColor: "text-green-400",
      gradient: "from-green-500/10",
      borderTop: "border-green-500/20",
    },
    purple: {
      border: selected
        ? "border-purple-500 bg-gradient-to-br from-purple-500/15 to-purple-500/5 shadow-lg shadow-purple-500/20"
        : "border-purple-500/30 hover:border-purple-500/50 bg-dark-secondary/50",
      iconBg: selected
        ? "bg-purple-500/20 shadow-md shadow-purple-500/30"
        : "bg-purple-500/10",
      checkBg: "bg-purple-500",
      textColor: "text-purple-400",
      gradient: "from-purple-500/10",
      borderTop: "border-purple-500/20",
    },
  };

  const styles = colorStyles[colorClass];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all duration-300 sm:p-4 ${
        selected ? `${styles.border} scale-[1.02]` : styles.border
      }`}
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between sm:mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all sm:h-10 sm:w-10 ${styles.iconBg}`}
            >
              <span className="text-xl sm:text-2xl">{icon}</span>
            </div>
            <p className="text-sm font-bold text-white sm:text-base">{label}</p>
          </div>
          {selected && (
            <div
              className={`h-4 w-4 rounded-full sm:h-5 sm:w-5 ${styles.checkBg} flex flex-shrink-0 items-center justify-center`}
            >
              <span className="text-[10px] font-bold text-white sm:text-xs">
                ✓
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className={`${styles.textColor} text-base font-bold sm:text-lg`}>
            {amount}
          </p>
          {balance && (
            <div className={`border-t pt-1 sm:pt-1.5 ${styles.borderTop}`}>
              <p className="text-[10px] text-gray-400 sm:text-xs">{balance}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
