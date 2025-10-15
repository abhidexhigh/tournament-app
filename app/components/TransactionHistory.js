"use client";

import Card from "./Card";
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

  const getTransactionIcon = (type) => {
    const icons = {
      prize_won: "🏆",
      tournament_creation: "➖",
      tournament_join: "✓",
      wallet_add: "➕",
      wallet_subtract: "➖",
    };
    return icons[type] || "💎";
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? "text-green-400" : "text-red-400";
  };

  if (transactions.length === 0) {
    return (
      <Card glass className="text-center py-8">
        <div className="text-5xl mb-3">📜</div>
        <p className="text-gray-400">No transactions yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Your transaction history will appear here
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gold mb-4">
        📜 Transaction History
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-dark-secondary rounded-lg border border-gold-dark/20 hover:border-gold-dark/40 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="text-3xl">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {transaction.description}
                </p>
                <p className="text-gray-500 text-sm">
                  {formatDate(transaction.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-xl font-bold ${getTransactionColor(
                  transaction.amount
                )}`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toLocaleString()} 💎
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
