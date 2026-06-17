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
          maxWidth: 1200,
margin: "0 auto",
        }}
      >
        <h1>Movie Not Found</h1>
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
        <Link href="/admin/dashboard">
        <button
          style={{
            marginBottom: 20,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </Link>

      <div
        style={{
          display: "flex",
          gap: 30,
          flexWrap: "wrap",
        }}
      >
        <img
  src={
    movie.poster ||
    "https://placehold.co/350x500?text=No+Poster"
  }
  alt={movie.title}
        />

        <h1>{movie.title}</h1>

<h3>
  💰 الإيرادات / Revenue:
  {movie.revenue?.toLocaleString()}
</h3>

<h3>
  👥 الجمهور / Audience:
  {movie.audience?.toLocaleString()}
</h3>

<h3>
  🎬 عدد السينمات / Cinemas:
  {movie.cinemas?.toLocaleString()}
</h3>

<h3>
  🌍 اللغة / Language:
  {movie.language}
</h3>

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