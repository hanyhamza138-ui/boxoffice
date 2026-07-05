"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";


export default function Sidebar() {


  const router = useRouter();


  const { t } = useLanguage();



  function logout() {

    document.cookie =
      "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";


    router.push("/admin/login");

  }





  return (

    <aside

      style={{

        width:250,

        minHeight:"100vh",

        background:"#111",

        color:"white",

        padding:25,

        boxSizing:"border-box",

      }}

    >



      <h2

        style={{

          marginBottom:20,

        }}

      >

        🎬 BoxOffice

      </h2>





      <div

        style={{

          marginBottom:30,

        }}

      >

        <LanguageSwitcher />

      </div>






      <nav

        style={{

          display:"flex",

          flexDirection:"column",

          gap:15,

        }}

      >



        <Link href="/admin/dashboard" style={link}>

          📊 {t.dashboard}

        </Link>





        <Link href="/admin/movies" style={link}>

          🎥 {t.movies}

        </Link>





        <Link href="/admin/Adminstats/cinemas" style={link}>

          🏢 {t.cinemas}

        </Link>





        <Link href="/admin/daily-stats" style={link}>

          📅 {t.dailyStats}

        </Link>





        <Link href="/admin/analytics" style={link}>

          📈 {t.analytics || "Analytics"}

        </Link>





      </nav>







      <button

        onClick={logout}

        style={{


          marginTop:40,

          width:"100%",

          padding:12,

          background:"#dc2626",

          color:"white",

          border:"none",

          borderRadius:8,

          cursor:"pointer",

        }}

      >

        🚪 {t.logout}

      </button>





    </aside>

  );

}







const link = {

  color:"white",

  textDecoration:"none",

  padding:"12px 14px",

  borderRadius:"10px",

  background:"#1b1b1b",

  transition:"0.2s",

  fontWeight:"500",

};