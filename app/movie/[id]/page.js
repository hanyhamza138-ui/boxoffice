import { supabase } from "../../../lib/supabase";

export default async function Page({ params }) {

  const { data } = await supabase
    .from("movies")
    .select("*");

  const movie = data?.find(
    (m) => String(m.id) === String(params.id)
  );

  if (!movie) {
    return (
      <h1
        style={{
          color: "white",
          background: "black",
          minHeight: "100vh",
          padding: 50,
        }}
      >
        Movie not found
      </h1>
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
        💰 Revenue: ${movie.revenue}
      </h2>

    </main>
  );
}