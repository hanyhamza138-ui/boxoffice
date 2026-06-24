"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";


export default function HomeContent({ movies }) {

  const { language, isArabic } = useLanguage();


  const font =
    isArabic
      ? "Cairo, Arial, sans-serif"
      : "Poppins, Arial, sans-serif";


  return (

    <main
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        background:"#0b0b0b",
        color:"white",
        minHeight:"100vh",
        padding:40,
        fontFamily:font
      }}
    >


      <header
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          marginBottom:40,
          flexWrap:"wrap",
          gap:20
        }}
      >

        <h1
          style={{
            fontSize:42,
            fontWeight:900,
            margin:0
          }}
        >
          🎬 {language==="ar"
          ?"شباك التذاكر المصري"
          :"Box Office Egypt"}
        </h1>


        <div
          style={{
            display:"flex",
            gap:15
          }}
        >

          <LanguageSwitcher />


          <Link href="/admin">

            <button
              style={{
                padding:"12px 20px",
                borderRadius:10,
                border:"none",
                cursor:"pointer",
                fontWeight:900
              }}
            >
              ⚙️ {language==="ar"
              ?"لوحة التحكم"
              :"Admin Panel"}

            </button>

          </Link>

        </div>

      </header>



      <h2
        style={{
          fontSize:32,
          fontWeight:900,
          marginBottom:35
        }}
      >
        🏆 {language==="ar"
        ?"أعلى الأفلام إيراداً"
        :"Top Movies By Revenue"}

      </h2>



      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(auto-fill,minmax(280px,1fr))",
          gap:35
        }}
      >


      {movies?.map((movie,index)=>{


        let badge = index + 1;
            index < 3
            ? ` ${index + 1}`
          : index + 1;


        let badgeColor =
          index===0
          ? "#FFD700"
          : index===1
          ? "#C0C0C0"
          : index===2
          ? "#CD7F32"
          : "#dc2626";



        return (

          <div
            key={movie.id}
            style={{
              background:"#171717",
              borderRadius:22,
              padding:25,
              boxShadow:
              "0 15px 35px rgba(0,0,0,.5)",
              border:
              index<3
              ? `2px solid ${badgeColor}`
              :"1px solid #333"
            }}
          >



            {/* Rank */}

            <div
              style={{
                display:"flex",
                justifyContent:"center",
                marginBottom:25
              }}
            >

              <div
                style={{
                  width:85,
                  height:85,
                  borderRadius:"50%",
                  background:badgeColor,
                  color:index<3
                  ?"black"
                  :"white",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize:38,
                  fontWeight:900,
                  boxShadow:
                  "0 5px 15px rgba(0,0,0,.4)"
                }}
              >
                {badge}
              </div>

            </div>




            {/* Poster */}

            <img
              src={
                movie.poster ||
                "https://placehold.co/300x450"
              }
              alt={movie.title}
              style={{
                width:"100%",
                height:390,
                objectFit:"cover",
                borderRadius:18
              }}
            />




            {/* Title */}

            <h3
              style={{
                marginTop:30,
                marginBottom:20,
                fontSize:28,
                fontWeight:900,
                textAlign:"center",
                lineHeight:1.3
              }}
            >
              {movie.title}

            </h3>




            <div
              style={{
                background:"#222",
                borderRadius:15,
                padding:18,
                fontSize:18,
                fontWeight:700,
                lineHeight:2
              }}
            >

              <div>
                💰 {movie.revenue?.toLocaleString() || 0}
              </div>

              <div>
                👥 {movie.audience?.toLocaleString() || 0}
              </div>

              <div>
                🎬 {movie.cinemas || 0}
              </div>

              <div>
                🌍 {movie.language || "-"}
              </div>

            </div>



            <Link href={`/movie/${movie.id}`}>

              <button
                style={{
                  marginTop:25,
                  width:"100%",
                  padding:14,
                  borderRadius:10,
                  border:"none",
                  background:"#2563eb",
                  color:"white",
                  fontWeight:900,
                  fontSize:17,
                  cursor:"pointer"
                }}
              >

                🎬 {language==="ar"
                ?"التفاصيل"
                :"Details"}

              </button>

            </Link>



          </div>

        );


      })}


      </div>


    </main>

  );

}