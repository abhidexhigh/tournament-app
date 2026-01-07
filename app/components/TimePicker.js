"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChevronUpIcon = () => (
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
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const ChevronDownIcon = () => (
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
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default function TimePicker({
  selectedTime,
  onTimeChange,
  placeholder = "Select time",
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState("AM");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Parse selectedTime (format: "HH:mm") into state
  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        setHours(hour12);
        setMinutes(m);
        setPeriod(h >= 12 ? "PM" : "AM");
      }
    }
  }, [selectedTime]);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = compact ? 240 : 280;
      
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

  const formatTime24 = (h, m, p) => {
    let hour24 = h;
    if (p === "AM") {
      hour24 = h === 12 ? 0 : h;
    } else {
      hour24 = h === 12 ? 12 : h + 12;
    }
    return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const formatDisplayTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const p = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m.toString().padStart(2, "0")} ${p}`;
  };

  const handleHourChange = (delta) => {
    setHours((prev) => {
      let newHour = prev + delta;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      return newHour;
    });
  };

  const handleMinuteChange = (delta) => {
    setMinutes((prev) => {
      let newMin = prev + delta * 5;
      if (newMin >= 60) newMin = 0;
      if (newMin < 0) newMin = 55;
      return newMin;
    });
  };

  const handleConfirm = () => {
    const time24 = formatTime24(hours, minutes, period);
    onTimeChange(time24);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onTimeChange("");
    setIsOpen(false);
  };

  const quickTimes = [
    { label: "9:00 AM", value: "09:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "9:00 PM", value: "21:00" },
  ];

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
      className={`from-dark-card/98 via-dark-card/95 to-dark-card/98 border-gold-dark/40 animate-fadeIn overflow-hidden border bg-gradient-to-br shadow-2xl shadow-black/60 backdrop-blur-xl ${compact ? "w-[240px] rounded-xl" : "w-[280px] rounded-2xl border-2"}`}
    >
      {/* Time Selector */}
      <div className={`from-gold/10 to-gold/5 border-gold-dark/30 border-b bg-gradient-to-r ${compact ? "px-4 py-3" : "px-4 py-4"}`}>
        <div className={`flex items-center justify-center ${compact ? "gap-2" : "gap-3"}`}>
          {/* Hours */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => handleHourChange(1)}
              className={`hover:bg-gold/20 hover:text-gold rounded-lg text-gray-400 transition-all ${compact ? "p-1" : "p-1.5"}`}
            >
              <ChevronUpIcon />
            </button>
            <span className={`text-gold text-center font-bold ${compact ? "w-10 text-2xl" : "w-12 text-3xl"}`}>
              {hours.toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => handleHourChange(-1)}
              className={`hover:bg-gold/20 hover:text-gold rounded-lg text-gray-400 transition-all ${compact ? "p-1" : "p-1.5"}`}
            >
              <ChevronDownIcon />
            </button>
          </div>

          <span className={`text-gold font-bold ${compact ? "text-2xl" : "text-3xl"}`}>:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => handleMinuteChange(1)}
              className={`hover:bg-gold/20 hover:text-gold rounded-lg text-gray-400 transition-all ${compact ? "p-1" : "p-1.5"}`}
            >
              <ChevronUpIcon />
            </button>
            <span className={`text-gold text-center font-bold ${compact ? "w-10 text-2xl" : "w-12 text-3xl"}`}>
              {minutes.toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => handleMinuteChange(-1)}
              className={`hover:bg-gold/20 hover:text-gold rounded-lg text-gray-400 transition-all ${compact ? "p-1" : "p-1.5"}`}
            >
              <ChevronDownIcon />
            </button>
          </div>

          {/* AM/PM Toggle */}
          <div className={`flex flex-col ${compact ? "ml-2 gap-1" : "ml-3 gap-1.5"}`}>
            <button
              type="button"
              onClick={() => setPeriod("AM")}
              className={`rounded-lg font-bold transition-all ${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${
                period === "AM"
                  ? "bg-gold text-black shadow-lg"
                  : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setPeriod("PM")}
              className={`rounded-lg font-bold transition-all ${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${
                period === "PM"
                  ? "bg-gold text-black shadow-lg"
                  : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      {/* Quick Time Selection */}
      <div className={`border-gold-dark/20 border-b ${compact ? "p-2" : "p-3"}`}>
        {!compact && (
          <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
            Quick Select
          </p>
        )}
        <div className={`grid ${compact ? "grid-cols-5 gap-1" : "flex flex-wrap gap-1.5"}`}>
          {quickTimes.map((qt) => (
            <button
              key={qt.value}
              type="button"
              onClick={() => {
                onTimeChange(qt.value);
                setIsOpen(false);
              }}
              className={`rounded-lg font-medium transition-all ${compact ? "px-1 py-1.5 text-[10px]" : "px-2.5 py-1.5 text-xs"} ${
                selectedTime === qt.value
                  ? "bg-gold text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {compact ? qt.label.split(" ")[0] : qt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Footer */}
      <div className={`flex items-center justify-between gap-2 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        <button
          type="button"
          onClick={handleClear}
          className={`rounded-lg font-semibold text-gray-400 transition-all hover:bg-white/10 hover:text-white ${compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}`}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={`bg-gold hover:shadow-gold/30 rounded-lg font-bold text-black transition-all hover:bg-yellow-500 hover:shadow-lg ${compact ? "px-3 py-1 text-[10px]" : "px-4 py-1.5 text-xs"}`}
        >
          Confirm
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
      <div className="time-picker-container relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
            isOpen || selectedTime
              ? "border-gold bg-gold/20 text-gold"
              : "border-gold-dark/30 hover:border-gold/50 bg-black/20 text-gray-400 hover:text-white"
          }`}
        >
          <ClockIcon />
          {selectedTime && !isOpen && (
            <span className="bg-gold absolute -top-1 -right-1 h-3 w-3 rounded-full" />
          )}
        </button>

        {dropdownContent}
      </div>
    );
  }

  return (
    <div className="time-picker-container relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`border-gold-dark/30 focus:border-gold focus:ring-gold/30 hover:border-gold/40 group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-r from-black/40 to-black/20 px-4 py-3 text-left text-sm font-medium transition-all duration-300 focus:ring-2 focus:outline-none ${
          selectedTime ? "text-white" : "text-gray-400"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-gold-dark group-focus-within:text-gold transition-colors duration-300">
            <ClockIcon />
          </span>
          <span className={selectedTime ? "font-semibold text-white" : ""}>
            {selectedTime ? formatDisplayTime(selectedTime) : placeholder}
          </span>
        </div>
        {selectedTime ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear(e);
            }}
            className="hover:text-gold ml-2 text-gray-400 transition-colors duration-200 hover:scale-110"
            aria-label="Clear time"
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
      {selectedTime && (
        <div className="from-gold/20 pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-xl bg-gradient-to-r to-yellow-600/20 opacity-20 blur-lg" />
      )}
    </div>
  );
}
