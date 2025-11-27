"use client";

export default function EmptyState({ searchQuery, onClearSearch }) {
  return (
    <div className="py-16 text-center">
      <div className="mb-4 text-6xl">{searchQuery ? "🔍" : "🎮"}</div>
      <h3 className="mb-2 text-2xl font-bold text-gray-400">
        {searchQuery
          ? `No results for "${searchQuery}"`
          : "No tournaments found"}
      </h3>
      <p className="text-gray-500">
        {searchQuery
          ? "Try adjusting your search terms or filters"
          : "Check back later for new tournaments!"}
      </p>
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="bg-gold/20 hover:bg-gold/30 text-gold mt-4 rounded-lg px-6 py-2 font-medium transition-colors duration-200"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
