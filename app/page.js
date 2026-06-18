import Link from "next/link";
import { supabase } from "../lib/supabase";

export default async function HomePage() {
  const { data: movies, error } = await supabase
    .from("movies")
    .select("*")
    .order("revenue", { ascending: false });

  if (error) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>Error Loading Movies</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <h1>🎬 Box Office Egypt</h1>

        <Link href="/admin">
          <button
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ⚙️ Admin Panel
          </button>
        </Link>
      </div>


      <h2 style={{ marginBottom: 30 }}>
        🏆 Top Movies By Revenue
      </h2>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 30,
        }}
      >

        {movies?.map((movie, index) => (

          <div
            key={movie.id}
            style={{
              background:"#1c1c1c",
              borderRadius:20,
              padding:20,
              textAlign:"center",
              border:
                index === 0
                ? "2px solid gold"
                : "1px solid #333",
            }}
          >

            {/* Rank */}
            <div
              style={{
                width:45,
                height:45,
                margin:"0 auto 15px",
                borderRadius:"50%",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontWeight:"bold",
                fontSize:22,
                background:
                  index === 0
                  ? "gold"
                  : index === 1
                  ? "silver"
                  : index === 2
                  ? "#cd7f32"
                  : "#dc2626",
                color:
                  index < 3
                  ? "black"
                  : "white",
              }}
            >
              {index + 1}
            </div>


            {/* Hex Poster */}
            <div
              style={{
                width:220,
                height:260,
                margin:"auto",
                clipPath:
                "polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)",
                overflow:"hidden",
              }}
            >

              <img
                src={
                  movie.poster ||
                  "https://via.placeholder.com/300x450"
                }
                alt={movie.title}
                style={{
                  width:"100%",
                  height:"100%",
                  objectFit:"cover",
                }}
              />

            </div>


            <h3
              style={{
                marginTop:20,
                fontSize:22,
              }}
            >
              {movie.title}
            </h3>


            <p>
              💰 Revenue:
              {" "}
              {movie.revenue?.toLocaleString() || 0}
            </p>


            <p>
              🎬 Cinemas:
              {" "}
              {movie.cinemas || 0}
            </p>


            <p>
              👥 Audience:
              {" "}
              {movie.audience?.toLocaleString() || 0}
            </p>


            <p>
              🌍 Language:
              {" "}
              {movie.language || "-"}
            </p>


            <div
              style={{
                display:"flex",
                justifyContent:"center",
                gap:10,
                marginTop:15,
                flexWrap:"wrap",
              }}
            >

              <Link href={`/movie/${movie.id}`}>
                <button
                  style={{
                    background:"#2563eb",
                    color:"white",
                    border:"none",
                    padding:"10px 14px",
                    borderRadius:8,
                    cursor:"pointer",
                  }}
                >
                  🎬 Details
                </button>
              </Link>


              {movie.trailer && (
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background:"#dc2626",
                    color:"white",
                    padding:"10px 14px",
                    borderRadius:8,
                    textDecoration:"none",
                  }}
                >
                  ▶ Trailer
                </a>
              )}

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}