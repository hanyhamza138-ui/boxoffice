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

      <h2 style={{ marginBottom: 25 }}>
        🏆 Top Movies By Revenue
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {movies?.map((movie, index) => (
          <div
            key={movie.id}
            style={{
              background: "#1c1c1c",
              borderRadius: 12,
              overflow: "hidden",
              border:
                index === 0
                  ? "2px solid gold"
                  : "1px solid #333",
            }}
          >
            <img
              src={
                movie.poster ||
                "https://via.placeholder.com/300x450?text=No+Poster"
              }
              alt={movie.title}
              style={{
                width: "100%",
                height: 380,
                objectFit: "cover",
              }}
            />

            <div style={{ padding: 15 }}>
              <h3>
                #{index + 1} {movie.title}
              </h3>

              <p>
                💰 Revenue:{" "}
                {movie.revenue?.toLocaleString() || 0}
              </p>

              <p>
                👥 Audience:{" "}
                {movie.audience?.toLocaleString() || 0}
              </p>

              <p>
                🎬 Cinemas:{" "}
                {movie.cinemas?.toLocaleString() || 0}
              </p>

              <p>
                🌍 Language: {movie.language || "-"}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 15,
                  flexWrap: "wrap",
                }}
              >
                <Link href={`/movie/${movie.id}`}>
                  <button
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    🎬 View Details
                  </button>
                </Link>

                {movie.trailer && (
                  <a
                    href={movie.trailer}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#dc2626",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: 6,
                      textDecoration: "none",
                    }}
                  >
                    ▶ Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}