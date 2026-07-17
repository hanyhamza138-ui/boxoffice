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

export function LanguageProvider({ children }) {

  const [mounted, setMounted] = useState(false);

  const [language, setLanguage] = useState("en");

  const [font, setFont] = useState("Poppins");

  useEffect(() => {

    const savedLanguage =
      localStorage.getItem("language") || "en";

    const savedFont =
      localStorage.getItem("font") || "Poppins";

    setLanguage(savedLanguage);

    setFont(savedFont);

    setMounted(true);

  }, []);

  const isArabic = language === "ar";

  const t = useMemo(
    () => (isArabic ? ar : en),
    [isArabic]
  );

  useEffect(() => {

    if (!mounted) return;

    document.cookie =
      `language=${language}; path=/; max-age=31536000`;

    document.documentElement.dir =
      isArabic ? "rtl" : "ltr";

    document.documentElement.lang =
      isArabic ? "ar" : "en";

  }, [language, isArabic, mounted]);

  useEffect(() => {

    if (!mounted) return;

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

  }, [font, mounted]);

  function changeLanguage(lang) {

    setLanguage(lang);

    localStorage.setItem("language", lang);

    document.cookie =
      `language=${lang}; path=/; max-age=31536000`;

  }

  function changeFont(newFont) {

    setFont(newFont);

    localStorage.setItem("font", newFont);

  }

  const value = {

    language,

    changeLanguage,

    isArabic,

    font,

    changeFont,

    t,

  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}