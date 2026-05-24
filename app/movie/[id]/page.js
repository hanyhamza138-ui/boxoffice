import { supabase } from "../../../lib/supabase";

export default async function MoviePage({ params }) {

  const id = Number(params.id);

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

      <h1
        style={{
          fontSize: 50,
          marginBottom: 20,
        }}
      >
        {movie.title}
      </h1>

      <p
        style={{
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        {movie.description}
      </p>

      <h2>
        💰 Revenue:
        {" "}
        ${movie.revenue}
      </h2>

    </main>
  );
}