"use client";

import Card from "../Card";
import Button from "../Button";
// import { getEntryFeeDisplayDual } from "../../lib/prizeCalculator";
// import { getTicketCount } from "../../lib/utils";
import { formatEntryFee } from "../../lib/currencyFormatter";
import {
  SINGLE_CURRENCY_MODE,
  PRIMARY_CURRENCY,
  getUserBalance,
  getPrimaryCurrency,
} from "../../lib/currencyConfig";
import {
  getUserBalanceDisplay,
  validateTournamentPayment,
} from "../../lib/currencyHelper";

export default function PaymentModal({
  show,
  tournament,
  user,
  paymentMethod,
  setPaymentMethod,
  loading,
  onConfirm,
  onCancel,
  onAddMoney,
}) {
  if (!show) return null;

  // Get currency info - always use primary currency
  const currencyInfo = getPrimaryCurrency();
  const userBalanceDisplay = getUserBalanceDisplay(user);
  const entryFeeFormatted = formatEntryFee(tournament?.entry_fee || 0);

  // Validate payment
  const validation = validateTournamentPayment(user, tournament);
  const hasInsufficientBalance = !validation.valid;
  const userBalance = userBalanceDisplay.amount || 0;
  const entryFeeAmount = validation.amount || 0;

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-sm sm:p-4">
      <div className="my-4 w-full max-w-md">
        {/* Decorative background glow */}
        <div className="from-gold/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-purple-500/5 blur-3xl" />

        <Card className="border-gold-dark/30 relative overflow-hidden border-2 shadow-2xl">
          {/* Top golden accent line */}
          <div className="via-gold absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

          {/* Header */}
          <div className="relative mb-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div className="from-gold/20 to-gold/5 border-gold/30 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br">
                    <span className="text-2xl">{currencyInfo.emoji}</span>
                  </div>
                  <div>
                    <h2 className="text-gold-gradient text-xl font-bold sm:text-2xl">
                      Confirm & Join
                    </h2>
                    <p className="text-xs text-gray-400">
                      {tournament?.title || "Tournament"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Info Card */}
          <div className="from-dark-primary to-dark-secondary border-gold-dark/30 mb-4 rounded-lg border bg-gradient-to-br p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">
                Tournament
              </span>
              <span className="text-gold bg-gold/10 rounded-full px-3 py-1 text-xs font-bold">
                {tournament?.display_type === "tournament"
                  ? "🏆 Tournament"
                  : "🎪 Event"}
              </span>
            </div>
            <h3 className="mb-2 text-base font-bold text-white">
              {tournament?.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>👥 {tournament?.max_players} Players</span>
              <span>📅 {tournament?.date}</span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-4 space-y-3">
            {/* Entry Fee */}
            <div className="from-gold/5 to-gold/10 border-gold/20 rounded-lg border bg-gradient-to-br p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">Entry Fee</span>
                <span className="text-gold text-2xl font-bold">
                  {entryFeeFormatted}
                </span>
              </div>
              <div className="via-gold/30 h-px bg-gradient-to-r from-transparent to-transparent" />
            </div>

            {/* Balance Info */}
            <div
              className={`rounded-lg border p-4 ${
                hasInsufficientBalance
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-green-500/30 bg-green-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg ${hasInsufficientBalance ? "text-red-400" : "text-green-400"}`}
                  >
                    {hasInsufficientBalance ? "⚠️" : "✓"}
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">Your Balance</p>
                    <p
                      className={`text-base font-bold ${hasInsufficientBalance ? "text-red-400" : "text-green-400"}`}
                    >
                      {userBalanceDisplay.formatted}
                    </p>
                  </div>
                </div>
                {!hasInsufficientBalance && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">After Join</p>
                    <p className="text-base font-bold text-gray-300">
                      {PRIMARY_CURRENCY === "USD"
                        ? `$${(userBalance - entryFeeAmount).toFixed(2)}`
                        : `${(userBalance - entryFeeAmount).toLocaleString()} 💎`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {hasInsufficientBalance && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">❌</span>
                  <div>
                    <p className="text-sm font-semibold text-red-400">
                      Insufficient Balance
                    </p>
                    <p className="mt-0.5 text-xs text-red-300">
                      {validation.error ||
                        `You need ${entryFeeFormatted} to join this tournament.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Money Button - Show when balance is insufficient */}
            {hasInsufficientBalance && onAddMoney && (
              <button
                onClick={onAddMoney}
                className="from-gold/20 to-gold/10 border-gold/50 hover:from-gold/30 hover:to-gold/20 hover:border-gold/70 group flex w-full items-center justify-center gap-3 rounded-lg border bg-gradient-to-r px-4 py-3 transition-all duration-200"
              >
                <span className="bg-gold/20 flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform group-hover:scale-110">
                  {currencyInfo.emoji}
                </span>
                <div className="text-left">
                  <p className="text-gold text-sm font-bold">
                    Add Money to Wallet
                  </p>
                  <p className="text-xs text-gray-400">
                    Top up your balance to join
                  </p>
                </div>
                <span className="text-gold ml-auto text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            )}
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
              disabled={loading || hasInsufficientBalance}
              className="group relative overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : hasInsufficientBalance ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>❌</span>
                    <span>Insufficient Balance</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Join Tournament</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                )}
              </span>
            </Button>
          </div>

          {/* Info Footer */}
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-center text-xs text-blue-300">
              🔒 Secure transaction • {currencyInfo.displayName} will be
              deducted from your balance
            </p>
          </div>

          {/* Ticket functionality commented out for now */}
          {/* 
          {tournament.display_type === "tournament" && tournament.accepts_tickets && (
            <div>Ticket joining options would go here</div>
          )}
          */}
        </Card>
      </div>
    </div>
  );
}
