import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        display: "flex",
      }}
    >

      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "#111",
          borderRight: "1px solid #222",
          padding: 25,
          position: "fixed",
          top: 0,
          bottom: 0,
        }}
      >

        <h1
          style={{
            fontSize:28,
            marginBottom:40,
          }}
        >
          🎬 BoxOffice
        </h1>


        <nav
          style={{
            display:"flex",
            flexDirection:"column",
            gap:15,
          }}
        >

          <Menu href="/admin">
            🏠 Dashboard
          </Menu>


          <Menu href="/admin/movies">
            🎬 Movies
          </Menu>


          <Menu href="/admin/Adminstats/cinemas">
            🎥 Cinemas
          </Menu>


          <Menu href="/admin/daily-stats">
            📅 Daily Stats
          </Menu>


          <Menu href="/admin/analytics">
            📊 Analytics
          </Menu>


        </nav>


      </aside>



      {/* Main Content */}

      <main
        style={{
          marginLeft:260,
          width:"100%",
          padding:40,
        }}
      >

        {children}

      </main>


    </div>
  );
}



function Menu({href,children}) {

  return (
    <Link
      href={href}
      style={{
        color:"white",
        textDecoration:"none",
        background:"#1c1c1c",
        padding:"12px 15px",
        borderRadius:10,
        display:"block",
        transition:"0.3s",
      }}
    >
      {children}
    </Link>
  );

}