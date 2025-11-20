"use client";

import Card from "../Card";
import Button from "../Button";
import { getEntryFeeDisplayDual } from "../../lib/prizeCalculator";

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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="max-w-2xl w-full my-4">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 blur-3xl pointer-events-none" />

        <Card className="relative overflow-hidden border-2 border-gold-dark/30 shadow-2xl">
          {/* Top golden accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

          {/* Header with icon */}
          <div className="relative">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/30 flex items-center justify-center">
                <span className="text-xl sm:text-2xl">💳</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-gold-gradient">
                  Select Payment Method
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Choose how you&apos;d like to pay for this tournament
                </p>
              </div>
            </div>

            {/* Show info message for tournaments */}
            {tournament.display_type === "tournament" && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-start sm:items-center gap-2">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-base sm:text-lg">⚡</span>
                  </div>
                  <p className="text-blue-300 text-xs sm:text-sm font-medium">
                    Tournaments can only be joined using tickets
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Options */}
          <div
            className={`grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4 ${
              tournament.display_type === "tournament"
                ? ""
                : "sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {/* Diamonds Option - Only for Events */}
            {tournament.display_type === "event" && (
              <PaymentOption
                type="diamonds"
                icon="💎"
                label="Diamonds"
                amount={`${getEntryFeeDisplayDual(tournament).diamonds} 💎`}
                balance={user && `Balance: ${user.diamonds || 0} 💎`}
                selected={paymentMethod === "diamonds"}
                onClick={() => setPaymentMethod("diamonds")}
                colorClass="gold"
              />
            )}

            {/* USD Option - Only for Events */}
            {tournament.display_type === "event" && (
              <PaymentOption
                type="usd"
                icon="💵"
                label="USD"
                amount={`$${getEntryFeeDisplayDual(tournament).usd}`}
                balance={
                  user &&
                  `Balance: $${Number(user.usd_balance || 0).toFixed(2)}`
                }
                selected={paymentMethod === "usd"}
                onClick={() => setPaymentMethod("usd")}
                colorClass="green"
              />
            )}

            {/* Tickets Option - Required for Tournaments, Optional for Events */}
            {(tournament.display_type === "tournament" ||
              tournament.accepts_tickets) && (
              <PaymentOption
                type="tickets"
                icon="🎫"
                label="Tickets"
                amount={`$${Number(tournament.entry_fee_usd || 0).toFixed(
                  2
                )} ticket`}
                balance={
                  user &&
                  `Balance: ${
                    (user.tickets?.ticket_010 || 0) +
                    (user.tickets?.ticket_100 || 0) +
                    (user.tickets?.ticket_1000 || 0)
                  } 🎫`
                }
                selected={paymentMethod === "tickets"}
                onClick={() => setPaymentMethod("tickets")}
                colorClass="purple"
              />
            )}
          </div>

          {/* Entry Fee Summary */}
          <div className="relative mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-dark-primary to-dark-secondary border border-gold-dark/30 shadow-inner">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs mb-0.5">Payment Method</p>
                <p className="text-white font-bold text-xs sm:text-sm truncate">
                  {paymentMethod === "diamonds"
                    ? "💎 Diamonds"
                    : paymentMethod === "usd"
                    ? "💵 USD"
                    : "🎫 Tickets"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-gray-400 text-xs mb-0.5">Amount</p>
                <p className="text-gold-gradient font-bold text-base sm:text-lg">
                  {paymentMethod === "diamonds"
                    ? `${getEntryFeeDisplayDual(tournament).diamonds} 💎`
                    : paymentMethod === "usd"
                    ? `$${getEntryFeeDisplayDual(tournament).usd}`
                    : `$${Number(tournament.entry_fee_usd || 0).toFixed(2)}`}
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
              className="relative overflow-hidden group"
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
                    <span className="group-hover:translate-x-1 transition-transform">
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
      className={`group relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 text-left overflow-hidden ${
        selected ? `${styles.border} scale-[1.02]` : styles.border
      }`}
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all ${styles.iconBg}`}
            >
              <span className="text-xl sm:text-2xl">{icon}</span>
            </div>
            <p className="text-white font-bold text-sm sm:text-base">{label}</p>
          </div>
          {selected && (
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${styles.checkBg} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-[10px] sm:text-xs font-bold">
                ✓
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className={`${styles.textColor} font-bold text-base sm:text-lg`}>
            {amount}
          </p>
          {balance && (
            <div className={`pt-1 sm:pt-1.5 border-t ${styles.borderTop}`}>
              <p className="text-[10px] sm:text-xs text-gray-400">{balance}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
