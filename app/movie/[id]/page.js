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
    return <div>Movie Not Found</div>;
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#111]
        text-white
        p-8
      "
    >

      <img
        src={movie.poster}
        alt={movie.title}
        className="
          w-[300px]
          rounded-2xl
          mb-6
        "
      />

      <h1 className="text-5xl mb-4">
        {movie.title}
      </h1>

      <p className="text-xl">
        Revenue: ${movie.revenue}
      </p>

    </main>
  );
}