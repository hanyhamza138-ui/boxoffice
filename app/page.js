import Link from "next/link";
import { supabase } from "../lib/supabase";

export default async function HomePage() {

  const { data: movies, error } = await supabase
    .from("movies")
    .select("*");

  if (error) {
    return (
      <div
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 30,
        }}
      >
        <h1>Error Loading Movies</h1>

        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: 30,
      }}
    >
      <h1
        style={{
          fontSize: 40,
          marginBottom: 30,
        }}
      >
        🎬 Box Office Egypt
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(220px,1fr))",
          gap: 20,
        }}
      >
        {movies?.map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#1c1c1c",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: "100%",
                height: 320,
                objectFit: "cover",
              }}
            />

            <div style={{ padding: 15 }}>
              <h2>{movie.title}</h2>

              <p>
                💰 Revenue:{" "}
                {movie.revenue || 0}
              </p>

              <Link href={`/movie/${movie.id}`}>
                <button
                  style={{
                    marginTop: 10,
                    padding: "10px 15px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View Movie
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}