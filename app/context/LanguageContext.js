"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import ar from "../../translations/ar";
import en from "../../translations/en";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {

  const [language, setLanguage] = useState("en");
  const [font, setFont] = useState("Poppins");
  const [t, setT] = useState(en);

  useEffect(() => {

    const savedLanguage =
      localStorage.getItem("language");

    const savedFont =
      localStorage.getItem("font");

    if (savedLanguage) {

      setLanguage(savedLanguage);

      document.cookie =
        `language=${savedLanguage}; path=/; max-age=31536000`;

    }

    if (savedFont) {

      setFont(savedFont);

    }

  }, []);



  useEffect(() => {

    if (language === "ar") {

      setT(ar);

    } else {

      setT(en);

    }

  }, [language]);



  useEffect(() => {

    if (language === "ar") {

      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";

    } else {

      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";

    }

  }, [language]);



  useEffect(() => {

    document.body.className = "";

    if (font === "Cairo") {

      document.body.classList.add("font-cairo");

    } else if (font === "Tajawal") {

      document.body.classList.add("font-tajawal");

    } else if (font === "Tahoma") {

      document.body.classList.add("font-tahoma");

    } else {

      document.body.classList.add("font-poppins");

    }

  }, [font]);



  function changeLanguage(lang) {

    setLanguage(lang);

    localStorage.setItem(
      "language",
      lang
    );

    document.cookie =
      `language=${lang}; path=/; max-age=31536000`;

  }



  function changeFont(newFont) {

    setFont(newFont);

    localStorage.setItem(
      "font",
      newFont
    );

  }



  return (

    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        isArabic: language === "ar",
        font,
        changeFont,
        t
      }}
    >

      {children}

    </LanguageContext.Provider>

  );

}

export function useLanguage() {

  return useContext(LanguageContext);

}