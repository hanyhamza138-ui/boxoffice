"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

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
          marginBottom:30,
        }}
      >
        🎬 BoxOffice
      </h2>


      <nav
        style={{
          display:"flex",
          flexDirection:"column",
          gap:15,
        }}
      >

        <Link href="/admin/dashboard" style={link}>
          📊 Dashboard
        </Link>


        <Link href="/admin/movies" style={link}>
          🎥 Movies
        </Link>


        <Link href="/admin/Adminstats/cinemas" style={link}>
          🏢 Cinemas
        </Link>


        <Link href="/admin/daily-stats" style={link}>
          📅 Daily Stats
        </Link>


        <Link href="/admin/analytics" style={link}>
          📈 Analytics
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
        🚪 Logout
      </button>


    </aside>
  );
}


const link = {
  color: "white",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#1b1b1b",
  transition: "0.2s",
  fontWeight: "500",
};