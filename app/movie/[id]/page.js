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
> <h1>Movie Not Found</h1> </main>
);
}

return (
<main
style={{
background: "#0b0b0b",
color: "white",
minHeight: "100vh",
}}
>
<div
style={{
height: 450,
backgroundImage: `url(${movie.poster})`,
backgroundSize: "cover",
backgroundPosition: "center",
position: "relative",
}}
>
<div
style={{
position: "absolute",
inset: 0,
background:
"linear-gradient(to top,#0b0b0b,rgba(0,0,0,.3))",
}}
/>

```
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 40,
      }}
    >
      <h1
        style={{
          fontSize: 60,
          margin: 0,
        }}
      >
        {movie.title}
      </h1>
    </div>
  </div>

  <div style={{ padding: 40 }}>
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
        gridTemplateColumns:
          "repeat(auto-fit,minmax(320px,1fr))",
        gap: 30,
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
          width: "100%",
          maxWidth: 350,
          borderRadius: 15,
          boxShadow:
            "0 10px 30px rgba(0,0,0,.5)",
        }}
      />

      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 15,
          }}
        >
          <Card
            title="💰 Revenue"
            value={
              movie.revenue?.toLocaleString() || 0
            }
          />

          <Card
            title="👥 Audience"
            value={
              movie.audience?.toLocaleString() || 0
            }
          />

          <Card
            title="🎬 Cinemas"
            value={
              movie.cinemas?.toLocaleString() || 0
            }
          />

          <Card
            title="🌍 Language"
            value={movie.language || "N/A"}
          />
        </div>

        {movie.trailer && (
          <a
            href={movie.trailer}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: 25,
              background: "#dc2626",
              color: "white",
              padding: "14px 22px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ▶ Watch Trailer
          </a>
        )}

        <div style={{ marginTop: 20 }}>
          <Link
            href={`/admin/movie/edit/${movie.id}`}
          >
            <button
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              ✏️ Edit Movie
            </button>
          </Link>
        </div>
      </div>
    </div>
  </div>
</main>

);
}

function Card({ title, value }) {
return (
<div
style={{
background: "#171717",
padding: 20,
borderRadius: 15,
}}
>
<h3 style={{ marginTop: 0 }}>
{title} </h3>

```
  <h2>{value}</h2>
</div>

);
}
