"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ date, time, className = "" }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
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
        // Convert Date object to YYYY-MM-DD format
        dateStr = date.toISOString().split("T")[0];
      } else if (typeof date === "string" && date.includes("T")) {
        // Handle full ISO string - extract just the date part
        dateStr = date.split("T")[0];
      }

      const tournamentDateTime = new Date(`${dateStr}T${time}`);

      // Check if date is valid
      if (isNaN(tournamentDateTime.getTime())) {
        console.error("Invalid tournament date/time:", { date, time, dateStr });
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
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
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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
  }, [date, time]);

  if (timeLeft.isExpired) {
    return (
      <div className={`text-red-400 text-sm font-medium ${className}`}>
        ⏰ Tournament Started
      </div>
    );
  }

  return (
    <div className={`text-gold text-sm font-medium ${className}`}>
      <div className="flex items-center space-x-1 justify-center sm:justify-start">
        <span className="text-lg">⏰</span>
        <span>Starts in:</span>
      </div>
      <div className="flex items-center space-x-2 mt-1 justify-center sm:justify-start">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-400">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-white font-bold text-lg">
            {timeLeft.hours.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-gray-400">Hours</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white font-bold text-lg">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-gray-400">Min</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white font-bold text-lg">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-gray-400">Sec</span>
        </div>
      </div>
    </div>
  );
}
