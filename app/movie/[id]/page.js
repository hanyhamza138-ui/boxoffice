import { supabase } from "../../../lib/supabase";

export default async function Page({ params }) {

  const { id } = await params;

  const movieId = Number(id);

  const { data: movies } = await supabase
    .from("movies")
    .select("*");

  const movie = movies?.find(
    (m) => m.id === movieId
  );

  if (!movie) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>Movie not found</h1>
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
      <img
        src={movie.poster}
        alt={movie.title}
        style={{
          width: 300,
          borderRadius: 20,
          marginBottom: 20,
        }}
      />

      <h1>{movie.title}</h1>

      <p>Language: {movie.language}</p>

      <h2>💰 Revenue: {movie.revenue}</h2>
    </main>
  );
}