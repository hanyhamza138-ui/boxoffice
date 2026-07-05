"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import ar from "../../translations/ar";
import en from "../../translations/en";

const LanguageContext = createContext(null);

const getStoredValue = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  return localStorage.getItem(key) || fallback;
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() =>
    getStoredValue("language", "en")
  );
  const [font, setFont] = useState(() =>
    getStoredValue("font", "Poppins")
  );

  const isArabic = language === "ar";
  const t = useMemo(() => (isArabic ? ar : en), [isArabic]);

  useEffect(() => {
    document.cookie = `language=${language}; path=/; max-age=31536000`;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar" : "en";
  }, [isArabic, language]);

  useEffect(() => {
    document.body.className = "";

    const className =
      font === "Cairo"
        ? "font-cairo"
        : font === "Tajawal"
          ? "font-tajawal"
          : font === "Tahoma"
            ? "font-tahoma"
            : "font-poppins";

    document.body.classList.add(className);
  }, [font]);

  function changeLanguage(lang) {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.cookie = `language=${lang}; path=/; max-age=31536000`;
  }

  function changeFont(newFont) {
    setFont(newFont);
    localStorage.setItem("font", newFont);
  }

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      isArabic,
      font,
      changeFont,
      t,
    }),
    [font, isArabic, language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
