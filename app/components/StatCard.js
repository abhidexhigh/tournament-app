"use client";

import Card from "./Card";

export default function StatCard({
  icon,
  label,
  value,
  trend,
  color = "gold",
}) {
  const colorClasses = {
    gold: "text-gold",
    green: "text-green-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };

  return (
    <Card hover className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      {trend && (
        <p className="text-gray-500 text-xs mt-2">
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
        </p>
      )}
    </Card>
  );
}
