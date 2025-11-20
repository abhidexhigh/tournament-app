"use client";

import Card from "../Card";

export default function RulesTab({ rules }) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-gold mb-6">📜 Tournament Rules</h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">
          {rules}
        </p>
      </div>
    </Card>
  );
}
