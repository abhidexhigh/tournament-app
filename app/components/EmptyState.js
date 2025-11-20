"use client";

export default function EmptyState({ searchQuery, onClearSearch }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{searchQuery ? "🔍" : "🎮"}</div>
      <h3 className="text-2xl font-bold text-gray-400 mb-2">
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
          className="mt-4 px-6 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg font-medium transition-colors duration-200"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
