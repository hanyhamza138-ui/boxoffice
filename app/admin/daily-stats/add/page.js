import { supabase } from "../../../../lib/supabase";
import { addDailyStat } from "../../../actions";

export default async function AddDailyStatPage() {
  const { data: movies } = await supabase
    .from("movies")
    .select("id,title")
    .order("title");

  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("id,name,city")
    .order("name");

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >
      <h1
        style={{
          fontSize: 40,
          marginBottom: 30,
        }}
      >
        📅 Add Daily Stat
      </h1>

      <form
        action={addDailyStat}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 600,
        }}
      >
        <select
          name="movie_id"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        >
          <option value="">
            Select Movie
          </option>

          {movies?.map((movie) => (
            <option
              key={movie.id}
              value={movie.id}
            >
              {movie.title}
            </option>
          ))}
        </select>

        <select
          name="cinema_id"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        >
          <option value="">
            Select Cinema
          </option>

          {cinemas?.map((cinema) => (
            <option
              key={cinema.id}
              value={cinema.id}
            >
              {cinema.name} - {cinema.city}
            </option>
          ))}
        </select>

        <input
          name="revenue"
          type="number"
          placeholder="Revenue"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="audience"
          type="number"
          placeholder="Audience"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="date"
          type="date"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <button
          type="submit"
          style={{
            padding: 14,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Save Daily Stat
        </button>
      </form>
    </main>
  );
}