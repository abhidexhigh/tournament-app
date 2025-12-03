"use client";

import Card from "../Card";

export default function RulesTab({ rules }) {
  return (
    <Card>
      <h2 className="text-gold mb-6 text-2xl font-bold">📜 Tournament Rules</h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-300">
          {rules || "No specific rules provided for this tournament. Please contact the host for more information."}
        </p>
      </div>
    </Card>
  );
}
