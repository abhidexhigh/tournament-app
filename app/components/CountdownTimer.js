"use client";

import { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";

// Custom hook to get countdown state
export function useCountdown({ date, time, expiresAt }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      let tournamentDateTime;

      if (expiresAt) {
        tournamentDateTime = new Date(expiresAt);
        if (isNaN(tournamentDateTime.getTime())) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }
      } else {
        if (!date || !time) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }

        let dateStr = date;
        if (date instanceof Date) {
          // Use local date components to avoid timezone shifts
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          dateStr = `${year}-${month}-${day}`;
        } else if (typeof date === "string" && date.includes("T")) {
          dateStr = date.split("T")[0];
        }

        tournamentDateTime = new Date(`${dateStr}T${time}`);

        if (isNaN(tournamentDateTime.getTime())) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }
      }

      const now = new Date();
      const difference = tournamentDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [date, time, expiresAt]);

  return timeLeft;
}

export default function CountdownTimer({
  date,
  time,
  expiresAt,
  label,
  className = "",
  style = "default",
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      let tournamentDateTime;

      // If expiresAt is provided, use it directly (for ongoing tournaments)
      if (expiresAt) {
        tournamentDateTime = new Date(expiresAt);
        if (isNaN(tournamentDateTime.getTime())) {
          console.error("Invalid expiresAt:", expiresAt);
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }
      } else {
        // Otherwise use date + time (for upcoming tournaments)
        // Validate inputs
        if (!date || !time) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }

        // Handle both Date objects and string dates from PostgreSQL
        let dateStr = date;
        if (date instanceof Date) {
          // Use local date components to avoid timezone shifts
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          dateStr = `${year}-${month}-${day}`;
        } else if (typeof date === "string" && date.includes("T")) {
          // Handle full ISO string - extract just the date part
          dateStr = date.split("T")[0];
        }

        tournamentDateTime = new Date(`${dateStr}T${time}`);

        // Check if date is valid
        if (isNaN(tournamentDateTime.getTime())) {
          console.error("Invalid tournament date/time:", {
            date,
            time,
            dateStr,
          });
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }
      }

      const now = new Date();
      const difference = tournamentDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [date, time, expiresAt]);

  if (timeLeft.isExpired) {
    // For compact or minimal styles, return just the text
    if (style === "compact" || style === "minimal") {
      return expiresAt ? "EXPIRED" : "STARTED";
    }

    // For default style, return full component
    return (
      <div
        className={`flex items-center justify-center space-x-2 text-sm font-medium text-red-400 sm:justify-start ${className}`}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
          <FaClock className="text-base sm:text-lg 2xl:text-xl" />
        </div>
        <span className="text-sm font-medium tracking-wider text-red-400">
          {expiresAt ? "Joining Closed" : "Tournament Started"}
        </span>
      </div>
    );
  }
  if (style === "compact") {
    // Compact style - just the countdown text without extra formatting
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else {
      return `${timeLeft.minutes}m`;
    }
  }

  if (style === "minimal") {
    return (
      <div className="flex items-center justify-center space-x-2 sm:justify-start">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-lg leading-6 font-bold text-white">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
            <span className="text-gold-text text-[10px] leading-3.5 font-medium">
              Days
            </span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-lg leading-6 font-bold text-white">
            {timeLeft.hours.toString().padStart(2, "0")}
          </span>
          <span className="text-gold-text text-[10px] leading-3.5 font-medium">
            Hours
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg leading-6 font-bold text-white">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className="text-gold-text text-[10px] leading-3.5 font-medium">
            Min
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg leading-6 font-bold text-white">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-gold-text text-[10px] leading-3.5 font-medium">
            Sec
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-gold text-sm font-medium ${className}`}>
      <div className="flex items-center justify-center space-x-1 sm:justify-start">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10">
          <FaClock className="text-base sm:text-lg 2xl:text-xl" />
        </div>
        <span>{label || "Starts in"}:</span>
      </div>
      <div className="flex items-center justify-center space-x-2 sm:justify-start">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-lg leading-6 font-bold text-white">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
            <span className="text-gold-text text-[10px] leading-3.5 font-medium">
              Days
            </span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-lg leading-6 font-bold text-white">
            {timeLeft.hours.toString().padStart(2, "0")}
          </span>
          <span className="text-gold-text text-[10px] leading-3.5 font-medium">
            Hours
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg leading-6 font-bold text-white">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className="text-gold-text text-[10px] leading-3.5 font-medium">
            Min
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg leading-6 font-bold text-white">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-gold-text text-[10px] leading-3.5 font-medium">
            Sec
          </span>
        </div>
      </div>
    </div>
  );
}
