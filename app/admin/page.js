import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { deleteMovie } from "../actions";

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";

  // Movies query (مع search)
  let query = supabase
    .from("movies")
    .select("*")
    .order("revenue", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data: movies, error } = await query;

  // Daily stats
  const { data: dailyStats, error: statsError } = await supabase
    .from("daily_stats")
    .select("*");

  console.log("STATS ERROR =", statsError);
  console.log("DAILY_STATS =", dailyStats);

  if (error) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>Error Loading Movies</h1>
        <p>{error.message}</p>
      </main>
    );
  }
  const totalMovies = movies?.length || 0;
const totalRevenue =
movies?.reduce(
(sum, movie) => sum + (movie.revenue || 0),
0
) || 0;

const totalAudience =
movies?.reduce(
(sum, movie) => sum + (movie.audience || 0),
0
) || 0;

const weeklyRevenue =
dailyStats?.reduce(
(sum, item) => sum + (item.revenue || 0),
0
) || 0;

const weeklyAudience =
dailyStats?.reduce(
(sum, item) => sum + (item.audience || 0),
0
) || 0;

const totalRecords = dailyStats?.length || 0;

const movieRevenueMap = {};

dailyStats?.forEach((item) => {
movieRevenueMap[item.movie_id] =
(movieRevenueMap[item.movie_id] || 0) +
(item.revenue || 0);
});

let weeklyTopMovie = null;

if (Object.keys(movieRevenueMap).length > 0) {
const topMovieId = Object.keys(movieRevenueMap).reduce(
(a, b) =>
movieRevenueMap[a] > movieRevenueMap[b]
? a
: b
);


weeklyTopMovie = movies?.find(
  (movie) => movie.id === Number(topMovieId)
);


}

const topMovie = movies?.[0];

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
>
<h1
style={{
fontSize: 40,
margin: 0,
}}
>
⚙️ Admin Dashboard </h1>

<form
  method="GET"
  style={{
    display: "flex",
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  }}
>
  <input
    type="text"
    name="search"
    defaultValue={search}
    placeholder="Search movies..."
    style={{
      padding: 10,
      borderRadius: 8,
      border: "1px solid #444",
      background: "#222",
      color: "white",
      minWidth: 250,
    }}
  />

  <button
    type="submit"
    style={{
      padding: "10px 15px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      background: "#2563eb",
      color: "white",
    }}
  >
    🔍 Search
  </button>

  <Link href="/admin">
    <button
      type="button"
      style={{
        padding: "10px 15px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: "#444",
        color: "white",
      }}
    >
      Clear
    </button>
  </Link>
</form>
    <Link href="/admin/add">
      <button
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ➕ Add Movie
      </button>
    </Link>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(220px,1fr))",
      gap: 20,
      marginBottom: 25,
    }}
  >
    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>📅 Weekly Revenue</h3>
      <h2>{weeklyRevenue.toLocaleString()}</h2>
    </div>

    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>👥 Weekly Audience</h3>
      <h2>{weeklyAudience.toLocaleString()}</h2>
    </div>

    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>📊 Records</h3>
      <h2>{totalRecords}</h2>
    </div>

    <div
      style={{
        background: "#0f172a",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>🏆 Top Movie (7 Days)</h3>
      <h2>{weeklyTopMovie?.title || "-"}</h2>
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(220px,1fr))",
      gap: 20,
      marginBottom: 40,
    }}
  >
    <div
      style={{
        background: "#1c1c1c",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>🎬 Movies</h3>
      <h2>{totalMovies}</h2>
    </div>

    <div
      style={{
        background: "#1c1c1c",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>💰 Total Revenue</h3>
      <h2>{totalRevenue.toLocaleString()}</h2>
    </div>

    <div
      style={{
        background: "#1c1c1c",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>👥 Total Audience</h3>
      <h2>{totalAudience.toLocaleString()}</h2>
    </div>

    <div
      style={{
        background: "#1c1c1c",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h3>🏆 All Time Top Movie</h3>
      <h2>{topMovie?.title || "-"}</h2>
    </div>
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
        <th style={{ padding: 15, textAlign: "left" }}>
          Rank
        </th>
        <th style={{ padding: 15, textAlign: "left" }}>
          Title
        </th>
        <th style={{ padding: 15, textAlign: "left" }}>
          Revenue
        </th>
        <th style={{ padding: 15, textAlign: "left" }}>
          Audience
        </th>
        <th style={{ padding: 15, textAlign: "left" }}>
          Actions
        </th>
      </tr>
    </thead>

    <tbody>
      {movies?.map((movie, index) => (
        <tr
          key={movie.id}
          style={{
            borderTop: "1px solid #333",
          }}
        >
          <td style={{ padding: 15 }}>
            #{index + 1}
          </td>

          <td style={{ padding: 15 }}>
            {movie.title}
          </td>

          <td style={{ padding: 15 }}>
            {movie.revenue?.toLocaleString() || 0}
          </td>

          <td style={{ padding: 15 }}>
            {movie.audience?.toLocaleString() || 0}
          </td>

          <td style={{ padding: 15 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <Link href={`/admin/edit/${movie.id}`}>
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

              <form action={deleteMovie}>
                <input
                  type="hidden"
                  name="id"
                  value={movie.id}
                />

                <button
                  type="submit"
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </form>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</main>

);
}