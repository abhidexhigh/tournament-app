import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "ko", "ja", "zh", "vi", "ru", "es"];
export const defaultLocale = "en";

export const localeNames = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  zh: "简体中文",
  vi: "Tiếng Việt",
  ru: "Русский",
  es: "Español",
};

export const localeFlags = {
  en: "🇺🇸",
  ko: "🇰🇷",
  ja: "🇯🇵",
  zh: "🇨🇳",
  vi: "🇻🇳",
  ru: "🇷🇺",
  es: "🇪🇸",
};

export default getRequestConfig(async () => {
  // For now, we'll use cookie-based locale detection
  // This will be enhanced in the client component
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
