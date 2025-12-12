"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { LuGlobe } from "react-icons/lu";

export default function LanguageSwitcher({ variant = "default" }) {
  const { locale, setLocale, locales, localeNames, localeFlags } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLocale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  // Icon-only variant - shows just a globe icon
  if (variant === "icon") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border-gold-dark/30 hover:border-gold/50 hover:text-gold group flex h-9 w-9 items-center justify-center rounded-lg border bg-black/20 text-gray-400 transition-all hover:bg-black/30 active:scale-95"
          aria-label="Select language"
        >
          <LuGlobe className="h-[18px] w-[18px]" />
        </button>

        {isOpen && (
          <div className="bg-dark-card border-gold-dark/30 animate-fadeIn absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border shadow-2xl">
            <div className="border-gold-dark/20 border-b px-3 py-2">
              <p className="text-gold text-xs font-semibold uppercase tracking-wider">
                Language
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    locale === loc
                      ? "bg-gold/20 text-gold font-semibold"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-base">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                  {locale === loc && (
                    <span className="text-gold ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact variant for mobile
  if (variant === "compact") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border-gold-dark/30 hover:border-gold/50 flex h-12 w-12 items-center justify-center rounded-xl border bg-black/20 text-lg transition-all active:scale-95"
          aria-label="Select language"
        >
          {localeFlags[locale]}
        </button>

        {isOpen && (
          <div className="bg-dark-card border-gold-dark/30 animate-fadeIn absolute right-0 bottom-full z-50 mb-2 w-40 overflow-hidden rounded-xl border shadow-2xl">
            <div className="max-h-64 overflow-y-auto py-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    locale === loc
                      ? "bg-gold/20 text-gold font-semibold"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-base">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                  {locale === loc && (
                    <span className="text-gold ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-gold-dark/30 hover:border-gold/50 group flex items-center gap-2 rounded-lg border bg-black/20 px-3 py-2 transition-all"
        aria-label="Select language"
      >
        <span className="text-base">{localeFlags[locale]}</span>
        <span className="text-sm font-medium text-gray-300 group-hover:text-white">
          {localeNames[locale]}
        </span>
        <svg
          className={`text-gold h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && (
        <div className="bg-dark-card border-gold-dark/30 animate-fadeIn absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border shadow-2xl">
          <div className="max-h-80 overflow-y-auto py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  locale === loc
                    ? "bg-gold/20 text-gold font-semibold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
                {locale === loc && (
                  <span className="text-gold ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

