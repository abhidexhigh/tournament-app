"use client";

import Card from "./Card";
// Simplified tickets - no need for ticket config anymore
import Badge from "./Badge";

export default function TransactionHistory({ transactions = [] }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type, currency) => {
    if (type === "wallet_topup") {
      if (currency === "tickets") return "🎫";
      if (currency === "usd") return "💵";
      return "💎";
    }
    const icons = {
      prize_won: "🏆",
      tournament_creation: "➖",
      tournament_join: "✓",
      wallet_add: "➕",
      wallet_subtract: "➖",
      tournament_entry: "🎮",
      ticket_use: "🎫",
    };
    return icons[type] || "💎";
  };

  const getTransactionColor = (amount, currency) => {
    if (currency === "usd") {
      return amount > 0 ? "text-green-400" : "text-red-400";
    }
    return amount > 0 ? "text-green-400" : "text-red-400";
  };

  const formatAmount = (amount, currency) => {
    const prefix = amount > 0 ? "+" : "";
    if (currency === "tickets") {
      const absAmount = Math.abs(amount);
      return `${prefix}${absAmount} ticket${absAmount !== 1 ? "s" : ""} 🎫`;
    }
    // Show everything in Diamonds (1 USD = 1 Diamond)
    return `${prefix}${Math.abs(amount).toLocaleString()} 💎`;
  };

  if (transactions.length === 0) {
    return (
      <Card glass className="py-8 text-center">
        <div className="mb-3 text-5xl">📜</div>
        <p className="text-gray-400">No transactions yet</p>
        <p className="mt-2 text-sm text-gray-500">
          Your transaction history will appear here
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-gold mb-4 text-2xl font-bold">
        📜 Transaction History
      </h2>
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-dark-secondary border-gold-dark/20 hover:border-gold-dark/40 flex items-center justify-between rounded-lg border p-4 transition-colors"
          >
            <div className="flex flex-1 items-center space-x-4">
              <div className="text-3xl">
                {getTransactionIcon(transaction.type, transaction.currency)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  {transaction.description}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(transaction.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-xl font-bold ${getTransactionColor(
                  transaction.amount,
                  transaction.currency,
                )}`}
              >
                {formatAmount(transaction.amount, transaction.currency)}
              </p>
              {transaction.currency === "tickets" && (
                <p className="text-xs text-gray-500">Tickets</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
