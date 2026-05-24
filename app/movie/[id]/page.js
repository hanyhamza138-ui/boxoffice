import { supabase } from "../../../lib/supabase";

export default async function MoviePage({
  params,
}) {

  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!movie) {
    return (
      <main
        className="
          min-h-screen
          bg-[#111]
          text-white
          p-10
        "
      >
        Movie not found
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#111]
        text-white
        p-10
      "
    >

      <div
        className="
          grid
          md:grid-cols-2
          gap-10
        "
      >

        <img
          src={movie.poster}
          alt={movie.title}
          className="
            rounded-2xl
            w-full
            max-w-[400px]
          "
        />

        <div>

          <h1
            className="
              text-5xl
              font-bold
              mb-6
            "
          >
            {movie.title}
          </h1>

          <p
            className="
              text-gray-300
              text-lg
              mb-6
            "
          >
            {movie.description}
          </p>

          <div
            className="
              text-2xl
              text-green-400
              mb-6
            "
          >
            💰 Revenue:
            {" "}
            ${movie.revenue}
          </div>

        </div>

      </div>

    </main>
  );
}