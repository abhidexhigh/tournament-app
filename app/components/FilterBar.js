"use client";

import { useState, useEffect } from "react";

// Constants defined outside component to prevent recreation on each render
const displayTypeTabs = [
  {
    key: "tournaments",
    label: "Tournaments",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    key: "events",
    label: "Events",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
];

const statusOptions = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

// Move StatusDropdown outside to prevent recreation
const StatusDropdown = ({ activeTab, setActiveTab, isDropdownOpen, setIsDropdownOpen }) => (
    <div className="relative status-dropdown w-full lg:w-auto lg:inline-block z-[100]">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full lg:w-auto bg-gradient-to-r from-black/40 to-black/20 border border-gold-dark/30 rounded-xl py-3 px-4 text-white text-sm font-medium focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all duration-300 hover:border-gold/40 cursor-pointer lg:min-w-[160px] text-left flex items-center justify-between group"
      >
        <span className="font-semibold">
          {statusOptions.find((opt) => opt.value === activeTab)?.label}
        </span>
        <svg
          className={`w-5 h-5 text-gold ml-2 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-full lg:min-w-full bg-gradient-to-br from-dark-card/95 via-dark-card/90 to-dark-card/95 backdrop-blur-xl border-2 border-gold-dark/30 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[9999] animate-fadeIn">
          <div className="py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setActiveTab(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 relative ${
                  activeTab === option.value
                    ? "bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3 relative z-10">
                  {activeTab === option.value && (
                    <span className="text-gold font-bold text-base">✓</span>
                  )}
                  <span
                    className={activeTab === option.value ? "font-bold" : ""}
                  >
                    {option.label}
                  </span>
                </span>
                {activeTab === option.value && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-yellow-600 rounded-r" />
                )}
              </button>
            ))}
          </div>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/10 via-yellow-600/10 to-gold/10 opacity-50 blur-xl -z-10 pointer-events-none" />
        </div>
      )}

      {activeTab && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/20 to-yellow-600/20 opacity-20 blur-lg -z-10 animate-pulse pointer-events-none" />
      )}
    </div>
);

// Move DisplayTypeTabs outside to prevent recreation
const DisplayTypeTabs = ({ displayTypeTab, setDisplayTypeTab, isMobile = false }) => (
    <div className="bg-gradient-to-r from-dark-card/80 via-dark-card to-dark-card/80 p-1.5 rounded-2xl border border-gold-dark/30 backdrop-blur-sm">
      <div className="flex gap-2">
        {displayTypeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setDisplayTypeTab(tab.key)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm
              transition-all duration-300 ease-out
              ${
                displayTypeTab === tab.key
                  ? `bg-gradient-to-br ${tab.gradient} border-2 border-gold text-white shadow-lg shadow-gold/30 scale-105`
                  : "bg-dark-card/50 border-2 border-transparent text-gray-400 hover:text-white hover:bg-dark-card/80"
              }
            `}
          >
            <span className="tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
);

// Move SearchBar outside to prevent recreation
const SearchBar = ({ searchQuery, setSearchQuery }) => (
    <div className="w-full lg:w-72">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
          <svg
            className="w-5 h-5 text-gold-dark group-focus-within:text-gold transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, game..."
          className="w-full bg-gradient-to-r from-black/40 to-black/20 border border-gold-dark/30 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all duration-300 hover:border-gold/40"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gold transition-all duration-200 hover:scale-110"
            aria-label="Clear search"
          >
            <div className="p-1 rounded-full hover:bg-gold/20">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </button>
        )}
        {searchQuery && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/20 to-yellow-600/20 opacity-20 blur-lg -z-10 animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
);

export default function FilterBar({
  activeTab,
  setActiveTab,
  displayTypeTab,
  setDisplayTypeTab,
  searchQuery,
  setSearchQuery,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".status-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      {/* Display Type Tabs - Mobile Only (on top) */}
      <div className="mb-6 lg:hidden">
        <DisplayTypeTabs 
          displayTypeTab={displayTypeTab}
          setDisplayTypeTab={setDisplayTypeTab}
          isMobile={true} 
        />
      </div>

      {/* Main Filter Bar */}
      <div className="mb-8 relative z-10">
        <div className="backdrop-blur-xl border-gold-dark/20 rounded-2xl p-4 sm:px-4 sm:py-0 shadow-2xl shadow-black/30">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 lg:items-center lg:gap-4 relative">
            {/* Left: Status Dropdown */}
            <div className="flex justify-start lg:justify-start space-y-3 w-full lg:w-auto">
              <StatusDropdown 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            </div>

            {/* Center: Display Type Tabs (Desktop Only) */}
            <div className="hidden lg:flex items-center justify-center">
              <DisplayTypeTabs 
                displayTypeTab={displayTypeTab}
                setDisplayTypeTab={setDisplayTypeTab}
              />
            </div>

            {/* Right: Search */}
            <div className="flex justify-end lg:justify-end">
              <SearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
