import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default async function MoviePage({ params }) {
  const { id } = await params;

  const { data: movie, error } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !movie) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>Movie Not Found</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#0b0b0b",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >
      <Link href="/">
        <button
          style={{
            marginBottom: 25,
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#333",
            color: "white",
          }}
        >
          ← Back
        </button>
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        <img
          src={
            movie.poster ||
            "https://placehold.co/350x500?text=No+Poster"
          }
          alt={movie.title}
          style={{
            width: 350,
            height: 520,
            objectFit: "cover",
            borderRadius: 15,
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          }}
        />

        <div>
          <h1
            style={{
              fontSize: 48,
              marginTop: 0,
              marginBottom: 20,
            }}
          >
            {movie.title}
          </h1>

          <div
            style={{
              background: "#171717",
              padding: 25,
              borderRadius: 15,
              maxWidth: 700,
            }}
          >
            <p>
              💰 Revenue:
              <strong>
                {" "}
                {(movie.revenue || 0).toLocaleString()}
              </strong>
            </p>

            <p>
              👥 Audience:
              <strong>
                {" "}
                {(movie.audience || 0).toLocaleString()}
              </strong>
            </p>

            <p>
              🎬 Cinemas:
              <strong>
                {" "}
                {(movie.cinemas || 0).toLocaleString()}
              </strong>
            </p>

            <p>
              🌍 Language:
              <strong>
                {" "}
                {movie.language || "N/A"}
              </strong>
            </p>
          </div>

          {movie.trailer && (
            <a
              href={movie.trailer}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: 20,
                background: "#dc2626",
                color: "white",
                padding: "12px 20px",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              ▶ Watch Trailer
            </a>
          )}
        </div>
      </div>
    </main>
  );
}