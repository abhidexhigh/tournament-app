"use client";

import { useTranslations } from "../contexts/LocaleContext";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="py-8">
      <div className="max-w-main mx-auto px-4 text-center sm:px-6 lg:px-8">
        <p className="text-gray-400">{t("copyright")}</p>
        <p className="text-gold-dark mt-2 text-sm">{t("tagline")}</p>
      </div>
    </footer>
  );
}

