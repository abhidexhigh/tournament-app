"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "../contexts/LocaleContext";

const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ChevronLeftIcon = () => (
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
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRightIcon = () => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DatePicker({
  selectedDate,
  onDateChange,
  placeholder,
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const t = useTranslations("filter");

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = compact ? 260 : 300;
      
      // Check if dropdown would overflow right edge
      let left = compact ? rect.right - dropdownWidth : rect.left;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      if (left < 10) left = 10;
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: left + window.scrollX,
      });
    }
  }, [isOpen, compact]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset to selected month when opening
  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    } else if (isOpen && !selectedDate) {
      setCurrentMonth(new Date());
    }
  }, [isOpen, selectedDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isNextMonth: true,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleDateSelect = (date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onDateChange(null);
    setIsOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const days = getDaysInMonth(currentMonth);

  // Dropdown content rendered via portal
  const dropdownContent = isOpen && typeof document !== "undefined" ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 99999,
      }}
      className={`from-dark-card/98 via-dark-card/95 to-dark-card/98 border-gold-dark/40 animate-fadeIn overflow-hidden border bg-gradient-to-br shadow-2xl shadow-black/60 backdrop-blur-xl ${compact ? "w-[260px] rounded-xl" : "w-[300px] rounded-2xl border-2"}`}
    >
      {/* Calendar Header */}
      <div className={`from-gold/10 to-gold/5 border-gold-dark/30 flex items-center justify-between border-b bg-gradient-to-r ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        <button
          type="button"
          onClick={handlePrevMonth}
          className={`hover:bg-gold/20 hover:text-gold rounded-lg text-gray-400 transition-all duration-200 ${compact ? "p-1" : "p-1.5"}`}
        >
          <ChevronLeftIcon />
        </button>
        <span className={`text-gold font-bold tracking-wide ${compact ? "text-xs" : "text-sm"}`}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className={`hover:bg-gold/20 hover:text-gold rounded-lg text-gray-400 transition-all duration-200 ${compact ? "p-1" : "p-1.5"}`}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className={`border-gold-dark/20 grid grid-cols-7 border-b ${compact ? "px-1.5 py-1.5" : "px-2 py-2"}`}>
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className={`text-gold-dark text-center font-semibold tracking-wider uppercase ${compact ? "text-[10px]" : "text-xs"}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 ${compact ? "gap-0.5 p-1.5" : "gap-1 p-2"}`}>
        {days.map((dayInfo, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleDateSelect(dayInfo.date)}
            className={`relative flex aspect-square items-center justify-center font-medium transition-all duration-200 ${compact ? "rounded-md text-xs" : "rounded-lg text-sm"} ${
              !dayInfo.isCurrentMonth
                ? "text-gray-600 hover:bg-white/5 hover:text-gray-400"
                : isSelected(dayInfo.date)
                  ? "from-gold to-gold/80 shadow-gold/30 scale-105 bg-gradient-to-br text-black shadow-lg"
                  : isToday(dayInfo.date)
                    ? "border-gold/50 bg-gold/10 text-gold border"
                    : "hover:bg-gold/20 hover:text-gold text-gray-300"
            }`}
          >
            {dayInfo.day}
            {isToday(dayInfo.date) && !isSelected(dayInfo.date) && (
              <span className={`bg-gold absolute rounded-full ${compact ? "bottom-0.5 h-0.5 w-0.5" : "bottom-1 h-1 w-1"}`} />
            )}
          </button>
        ))}
      </div>

      {/* Quick Actions Footer */}
      <div className={`border-gold-dark/20 flex items-center justify-between gap-2 border-t ${compact ? "px-2 py-2" : "px-3 py-2.5"}`}>
        <button
          type="button"
          onClick={() => handleDateSelect(new Date())}
          className={`hover:bg-gold/20 text-gold rounded-lg font-semibold transition-all duration-200 ${compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}`}
        >
          {t("today") || "Today"}
        </button>
        {compact && selectedDate && (
          <span className="text-gold text-[10px] font-medium">
            {formatDisplayDate(selectedDate)}
          </span>
        )}
        <button
          type="button"
          onClick={handleClear}
          className={`rounded-lg font-semibold text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white ${compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}`}
        >
          {t("clear") || "Clear"}
        </button>
      </div>

      {/* Glow Effect */}
      <div className={`from-gold/10 to-gold/10 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r via-yellow-600/10 opacity-50 blur-xl ${compact ? "rounded-xl" : "rounded-2xl"}`} />
    </div>,
    document.body
  ) : null;

  // Compact mode trigger (icon only for mobile/tablet)
  if (compact) {
    return (
      <div className="date-picker-container relative" ref={containerRef}>
        {/* Compact Trigger Button (Icon Only) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
            isOpen || selectedDate
              ? "border-gold bg-gold/20 text-gold"
              : "border-gold-dark/30 hover:border-gold/50 bg-black/20 text-gray-400 hover:text-white"
          }`}
        >
          <CalendarIcon />
          {/* Active indicator dot */}
          {selectedDate && !isOpen && (
            <span className="bg-gold absolute -top-1 -right-1 h-3 w-3 rounded-full" />
          )}
        </button>

        {dropdownContent}
      </div>
    );
  }

  return (
    <div className="date-picker-container relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`border-gold-dark/30 focus:border-gold focus:ring-gold/30 hover:border-gold/40 group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-r from-black/40 to-black/20 px-4 py-3 text-left text-sm font-medium transition-all duration-300 focus:ring-2 focus:outline-none lg:min-w-[180px] ${
          selectedDate ? "text-white" : "text-gray-400"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-gold-dark group-focus-within:text-gold transition-colors duration-300">
            <CalendarIcon />
          </span>
          <span className={selectedDate ? "font-semibold text-white" : ""}>
            {selectedDate
              ? formatDisplayDate(selectedDate)
              : placeholder || t("selectDate")}
          </span>
        </div>
        {selectedDate ? (
          <button
            onClick={handleClear}
            className="hover:text-gold ml-2 text-gray-400 transition-colors duration-200 hover:scale-110"
            aria-label="Clear date"
          >
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
          </button>
        ) : (
          <svg
            className={`text-gold ml-2 h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
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
        )}
      </button>

      {dropdownContent}

      {/* Active Glow */}
      {selectedDate && (
        <div className="from-gold/20 pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-xl bg-gradient-to-r to-yellow-600/20 opacity-20 blur-lg" />
      )}
    </div>
  );
}
