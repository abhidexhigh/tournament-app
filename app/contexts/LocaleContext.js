"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
} from "../lib/i18n-constants";

const LocaleContext = createContext();

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function LocaleProvider({ children, initialLocale }) {
  const [locale, setLocale] = useState(initialLocale || defaultLocale);
  const [messages, setMessages] = useState(null);

  // Load messages for the current locale
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await import(`../../messages/${locale}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        // Fallback to English
        const fallbackMsgs = await import(`../../messages/en.json`);
        setMessages(fallbackMsgs.default);
      }
    };

    loadMessages();
  }, [locale]);

  // Get locale from cookie on mount
  useEffect(() => {
    const savedLocale = getCookie(LOCALE_COOKIE_NAME);
    if (savedLocale && locales.includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  const changeLocale = (newLocale) => {
    if (locales.includes(newLocale)) {
      setLocale(newLocale);
      setCookie(LOCALE_COOKIE_NAME, newLocale, 365);
      // Update html lang attribute
      document.documentElement.lang = newLocale;
    }
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale: changeLocale,
        messages,
        locales,
        localeNames,
        localeFlags,
        defaultLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

// Translation hook
export function useTranslations(namespace) {
  const { messages, locale } = useLocale();

  const t = (key, params = {}) => {
    if (!messages) return key;

    // Support nested keys like "nav.tournaments"
    const keys = namespace ? `${namespace}.${key}`.split(".") : key.split(".");
    let value = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Key not found, return the key itself
        return key;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters like {param}
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  };

  return t;
}

// Helper functions for cookies
function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
