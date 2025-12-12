"use client";

import { useTranslations } from "../contexts/LocaleContext";

export default function EmptyState({ searchQuery, onClearSearch }) {
  const t = useTranslations("empty");
  const tFilter = useTranslations("filter");

  return (
    <div className="py-16 text-center">
      <div className="mb-4 text-6xl">{searchQuery ? "🔍" : "🎮"}</div>
      <h3 className="mb-2 text-2xl font-bold text-gray-400">
        {searchQuery
          ? t("noResults", { query: searchQuery })
          : t("noTournaments")}
      </h3>
      <p className="text-gray-500">
        {searchQuery ? t("tryAdjusting") : t("checkBackLater")}
      </p>
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="bg-gold/20 hover:bg-gold/30 text-gold mt-4 rounded-lg px-6 py-2 font-medium transition-colors duration-200"
        >
          {tFilter("clearSearch")}
        </button>
      )}
    </div>
  );
}
