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
  const [language, setLanguage] = useState("en");

  const [font, setFont] = useState("Poppins");

  useEffect(() => {

    const savedLanguage =
      localStorage.getItem("language") || "en";

    const savedFont =
      localStorage.getItem("font") || "Poppins";

    // Sync persisted browser preferences after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(savedLanguage);

    setFont(savedFont);

  }, []);

  const isArabic = language === "ar";

  const t = useMemo(
    () => (isArabic ? ar : en),
    [isArabic]
  );

  useEffect(() => {

    document.cookie =
      `language=${language}; path=/; max-age=31536000`;

    document.documentElement.dir =
      isArabic ? "rtl" : "ltr";

    document.documentElement.lang =
      isArabic ? "ar" : "en";

  }, [language, isArabic]);

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

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
