"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "../contexts/LocaleContext";
import DatePicker from "./DatePicker";

// Move StatusDropdown outside to prevent recreation
const StatusDropdown = ({
  activeTab,
  setActiveTab,
  isDropdownOpen,
  setIsDropdownOpen,
  statusOptions,
}) => (
  <div className="status-dropdown relative z-[100] w-full lg:inline-block lg:w-auto">
    <button
      type="button"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="border-gold-dark/30 focus:border-gold focus:ring-gold/30 hover:border-gold/40 group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-r from-black/40 to-black/20 px-4 py-3 text-left text-sm font-medium text-white transition-all duration-300 focus:ring-2 focus:outline-none lg:w-auto lg:min-w-[160px]"
    >
      <span className="font-semibold">
        {statusOptions.find((opt) => opt.value === activeTab)?.label}
      </span>
      <svg
        className={`text-gold ml-2 h-5 w-5 transition-transform duration-300 ${
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
      <div className="from-dark-card/95 via-dark-card/90 to-dark-card/95 border-gold-dark/30 animate-fadeIn absolute top-full left-0 z-[9999] mt-2 w-full overflow-hidden rounded-xl border-2 bg-gradient-to-br shadow-2xl shadow-black/50 backdrop-blur-xl lg:min-w-full">
        <div className="py-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setActiveTab(option.value);
                setIsDropdownOpen(false);
              }}
              className={`relative w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                activeTab === option.value
                  ? "from-gold/20 text-gold bg-gradient-to-r to-yellow-600/20"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="relative z-10 flex items-center gap-3">
                {activeTab === option.value && (
                  <span className="text-gold text-base font-bold">✓</span>
                )}
                <span className={activeTab === option.value ? "font-bold" : ""}>
                  {option.label}
                </span>
              </span>
              {activeTab === option.value && (
                <div className="from-gold absolute top-0 bottom-0 left-0 w-1 rounded-r bg-gradient-to-b to-yellow-600" />
              )}
            </button>
          ))}
        </div>
        <div className="from-gold/10 to-gold/10 pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-r via-yellow-600/10 opacity-50 blur-xl" />
      </div>
    )}

    {activeTab && (
      <div className="from-gold/20 pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-xl bg-gradient-to-r to-yellow-600/20 opacity-20 blur-lg" />
    )}
  </div>
);

// Move DisplayTypeTabs outside to prevent recreation
const DisplayTypeTabs = ({
  displayTypeTab,
  setDisplayTypeTab,
  isMobile = false,
  tabs,
}) => (
  <div className="from-dark-card/80 via-dark-card to-dark-card/80 border-gold-dark/30 rounded-2xl border bg-gradient-to-r p-1.5 backdrop-blur-sm">
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setDisplayTypeTab(tab.key)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ease-out ${
            displayTypeTab === tab.key
              ? `bg-gradient-to-br ${tab.gradient} border-gold shadow-gold/30 scale-105 border-2 text-white shadow-lg`
              : "bg-dark-card/50 hover:bg-dark-card/80 border-2 border-transparent text-gray-400 hover:text-white"
          } `}
        >
          <span className="tracking-wide">{tab.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// Move SearchBar outside to prevent recreation
const SearchBar = ({ searchQuery, setSearchQuery, placeholder }) => (
  <div className="w-full lg:w-72">
    <div className="group relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
        <svg
          className="text-gold-dark group-focus-within:text-gold h-5 w-5 transition-colors duration-300"
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
        placeholder={placeholder}
        className="border-gold-dark/30 focus:border-gold focus:ring-gold/30 hover:border-gold/40 w-full rounded-xl border bg-gradient-to-r from-black/40 to-black/20 py-3 pr-11 pl-12 text-sm font-medium text-white placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:outline-none"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="hover:text-gold absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-all duration-200 hover:scale-110"
          aria-label="Clear search"
        >
          <div className="hover:bg-gold/20 rounded-full p-1">
            <svg
              className="h-4 w-4"
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
        <div className="from-gold/20 pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-xl bg-gradient-to-r to-yellow-600/20 opacity-20 blur-lg" />
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
  selectedDate,
  setSelectedDate,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const t = useTranslations("filter");
  const tTournament = useTranslations("tournament");

  // Translated constants
  const displayTypeTabs = [
    {
      key: "tournaments",
      label: tTournament("tournaments"),
      gradient: "from-yellow-500/20 to-orange-500/20",
    },
    {
      key: "events",
      label: tTournament("events"),
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  const statusOptions = [
    { value: "all", label: t("all") },
    { value: "upcoming", label: t("upcoming") },
    { value: "ongoing", label: t("ongoing") },
    { value: "completed", label: t("completed") },
    { value: "cancelled", label: t("cancelled") },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".status-dropdown")) {
        setIsDropdownOpen(false);
      }
      // Close mobile search when clicking outside
      if (
        isMobileSearchOpen &&
        !event.target.closest(".mobile-search-container")
      ) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isMobileSearchOpen]);

  return (
    <>
      {/* Display Type Tabs - Mobile Only (on top) */}
      <div className="mb-4 lg:hidden">
        <DisplayTypeTabs
          displayTypeTab={displayTypeTab}
          setDisplayTypeTab={setDisplayTypeTab}
          isMobile={true}
          tabs={displayTypeTabs}
        />
      </div>

      {/* Main Filter Bar */}
      <div className="relative z-10 mb-4 lg:mb-8">
        <div className="border-gold-dark/20 rounded-2xl px-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-4 sm:py-0">
          <div className="relative flex items-center justify-between gap-3 lg:grid lg:grid-cols-3 lg:items-center lg:gap-4">
            {/* Left: Status Dropdown */}
            <div className="flex-1 lg:flex-none">
              <StatusDropdown
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                statusOptions={statusOptions}
              />
            </div>

            {/* Center: Display Type Tabs (Desktop Only) */}
            <div className="hidden items-center justify-center lg:flex">
              <DisplayTypeTabs
                displayTypeTab={displayTypeTab}
                setDisplayTypeTab={setDisplayTypeTab}
                tabs={displayTypeTabs}
              />
            </div>

            {/* Right: Date & Search Icons (Mobile) / Date Picker & Search Bar (Desktop) */}
            <div className="flex items-center justify-end gap-2 lg:justify-end lg:gap-3">
              {/* Mobile/Tablet Date Picker (Floating) */}
              <div className="mobile-date-container lg:hidden">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  placeholder={t("filterByDate")}
                  compact={true}
                />
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => {
                  setIsMobileSearchOpen(!isMobileSearchOpen);
                  setIsMobileDateOpen(false);
                }}
                aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
                aria-expanded={isMobileSearchOpen}
                className={`mobile-search-container relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 lg:hidden ${
                  isMobileSearchOpen || searchQuery
                    ? "border-gold bg-gold/20 text-gold"
                    : "border-gold-dark/30 hover:border-gold/50 bg-black/20 text-gray-400 hover:text-white"
                }`}
              >
                <svg
                  className="h-5 w-5"
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
                {/* Active indicator dot */}
                {searchQuery && !isMobileSearchOpen && (
                  <span className="bg-gold absolute -top-1 -right-1 h-3 w-3 rounded-full" />
                )}
              </button>

              {/* Desktop Date Picker */}
              <div className="hidden lg:block">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  placeholder={t("filterByDate")}
                />
              </div>

              {/* Desktop Search Bar */}
              <div className="hidden lg:block">
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder={t("searchByName")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Expandable (Below Filter Bar) */}
      <div
        className={`mobile-search-container overflow-hidden transition-all duration-300 ease-out lg:hidden ${
          isMobileSearchOpen ? "mb-6 max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
            <svg
              className="text-gold h-5 w-5"
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
            placeholder={t("searchTournaments")}
            autoFocus={isMobileSearchOpen}
            className="border-gold/30 focus:border-gold bg-dark-card/80 w-full rounded-xl border py-3 pr-11 pl-12 text-sm font-medium text-white placeholder-gray-400 transition-all duration-300 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gold absolute inset-y-0 right-0 flex items-center pr-4"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
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
            </button>
          )}
        </div>
      </div>
    </>
  );
}
