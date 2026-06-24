"use client";

import { useLanguage } from "../context/LanguageContext";


export default function LanguageSwitcher(){

  const {
    language,
    changeLanguage
  } = useLanguage();


  return (

    <div
      style={{
        display:"flex",
        gap:10
      }}
    >

      <button
        onClick={()=>changeLanguage("en")}
        style={{
          padding:"10px 15px",
          borderRadius:8,
          border:"none",
          cursor:"pointer",
          fontWeight:900,
          background:
            language==="en"
            ? "#2563eb"
            : "#333",
          color:"white"
        }}
      >
        🇬🇧 EN
      </button>



      <button
        onClick={()=>changeLanguage("ar")}
        style={{
          padding:"10px 15px",
          borderRadius:8,
          border:"none",
          cursor:"pointer",
          fontWeight:900,
          background:
            language==="ar"
            ? "#2563eb"
            : "#333",
          color:"white"
        }}
      >
        🇪🇬 عربي
      </button>


    </div>

  );

}