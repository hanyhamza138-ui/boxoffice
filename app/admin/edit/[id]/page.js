import { supabase } from "../../../../lib/supabase";
import { updateMovie } from "../../../actions";

export default async function EditMoviePage({ params }) {
  const { id } = await params;

  const { data: movie, error } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !movie) {
    return (
      <main style={{ padding: 40 }}>
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
      <h1 style={{ fontSize: 40, marginBottom: 30 }}>
        ✏️ Edit Movie
      </h1>

      <form
        action={updateMovie}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 600,
        }}
      >
        <input
          type="hidden"
          name="id"
          value={movie.id}
        />

        <input
          name="title"
          defaultValue={movie.title}
          placeholder="Movie Title"
        />

        <input
          name="revenue"
          type="number"
          defaultValue={movie.revenue}
          placeholder="Revenue"
        />

        <input
          name="audience"
          type="number"
          defaultValue={movie.audience || 0}
          placeholder="Audience"
        />

        <input
          name="cinemas"
          type="number"
          defaultValue={movie.cinemas || 0}
          placeholder="Cinemas"
        />

        <input
          name="poster"
          defaultValue={movie.poster}
          placeholder="Poster URL"
        />

        <input
          name="language"
          defaultValue={movie.language}
          placeholder="Language"
        />

        <input
          name="trailer"
          defaultValue={movie.trailer}
          placeholder="Trailer URL"
        />

        <button
          type="submit"
          style={{
            padding: 14,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}