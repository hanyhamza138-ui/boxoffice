import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function DailyStatsPage() {
const { data: stats = [] } = await supabase
.from("daily_stats")
.select("*")
.order("date", { ascending: false });

const { data: movies = [] } = await supabase
.from("movies")
.select("id,title");

const { data: cinemas = [] } = await supabase
.from("cinemas")
.select("id,name,city");

const movieMap = {};
movies.forEach((movie) => {
movieMap[movie.id] = movie.title;
});

const cinemaMap = {};
cinemas.forEach((cinema) => {
cinemaMap[cinema.id] = cinema;
});

return (
<main
style={{
background: "#111",
color: "white",
minHeight: "100vh",
padding: 40,
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 30,
}}
> <h1>📅 Daily Stats</h1>

    <Link href="/admin/daily-stats/add">
      <button
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        ➕ Add Daily Stat
      </button>
    </Link>
  </div>

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      background: "#1c1c1c",
      borderRadius: 10,
      overflow: "hidden",
    }}
  >
    <thead>
      <tr>
        <th style={{ padding: 15 }}>ID</th>
        <th style={{ padding: 15 }}>Movie</th>
        <th style={{ padding: 15 }}>Cinema</th>
        <th style={{ padding: 15 }}>City</th>
        <th style={{ padding: 15 }}>Revenue</th>
        <th style={{ padding: 15 }}>Audience</th>
        <th style={{ padding: 15 }}>Date</th>
        <th style={{ padding: 15 }}>Action</th>
      </tr>
    </thead>

    <tbody>
      {stats.map((item) => (
        <tr
          key={item.id}
          style={{
            borderTop: "1px solid #333",
          }}
        >
          <td style={{ padding: 15 }}>
            {item.id}
          </td>

          <td style={{ padding: 15 }}>
            {movieMap[item.movie_id] || "-"}
          </td>

          <td style={{ padding: 15 }}>
            {cinemaMap[item.cinema_id]?.name || "-"}
          </td>

          <td style={{ padding: 15 }}>
            {cinemaMap[item.cinema_id]?.city || "-"}
          </td>

          <td style={{ padding: 15 }}>
            {(item.revenue || 0).toLocaleString()}
          </td>

          <td style={{ padding: 15 }}>
            {(item.audience || 0).toLocaleString()}
          </td>

          <td style={{ padding: 15 }}>
            {item.date}
          </td>

          <td style={{ padding: 15 }}>
            <Link
              href={`/admin/daily-stats/edit/${item.id}`}
            >
              <button
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                ✏️ Edit
              </button>
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</main>
);
}
