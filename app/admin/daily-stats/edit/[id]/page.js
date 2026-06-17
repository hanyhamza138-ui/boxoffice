import { supabase } from "../../../../../lib/supabase";
import { updateDailyStat } from "../../../../actions";

export default async function EditDailyStatPage({
  params,
}) {
  const { id } = await params;

  const { data: stat, error } = await supabase
  .from("daily_stats")
  .select("*")
  .eq("id", Number(id))
  .single();

console.log("ID =", id);
console.log("STAT =", stat);
console.log("ERROR =", error);

  const { data: movies = [] } = await supabase
    .from("movies")
    .select("id,title")
    .order("title");

  const { data: cinemas = [] } = await supabase
    .from("cinemas")
    .select("id,name,city")
    .order("name");

  if (error || !stat) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>Daily Stat Not Found</h1>
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
      <h1
        style={{
          fontSize: 40,
          marginBottom: 30,
        }}
      >
        ✏️ Edit Daily Stat
      </h1>

      <form
        action={updateDailyStat}
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
          value={stat.id}
        />

        <select
          name="movie_id"
          defaultValue={stat.movie_id}
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        >
          {movies.map((movie) => (
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
          defaultValue={stat.cinema_id}
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        >
          {cinemas.map((cinema) => (
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
          defaultValue={stat.revenue}
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="audience"
          type="number"
          defaultValue={stat.audience}
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="date"
          type="date"
          defaultValue={stat.date}
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
          Save Changes
        </button>
      </form>
    </main>
  );
}