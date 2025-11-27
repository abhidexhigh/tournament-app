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
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="mb-2 text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      {trend && (
        <p className="mt-2 text-xs text-gray-500">
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
        </p>
      )}
    </Card>
  );
}
