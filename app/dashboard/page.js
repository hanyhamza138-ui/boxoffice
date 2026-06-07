import { supabase } from "../../lib/supabase";

export default async function Dashboard() {
  const { data: movies } = await supabase
    .from("movies")
    .select("*");

  const totalMovies = movies?.length || 0;

  const totalRevenue =
    movies?.reduce(
      (sum, movie) => sum + (movie.revenue || 0),
      0
    ) || 0;

  const topMovie = [...(movies || [])].sort(
    (a, b) => b.revenue - a.revenue
  )[0];

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
        📊 Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
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
          <h2>🎬 Movies</h2>
          <p
            style={{
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            {totalMovies}
          </p>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h2>💰 Revenue</h2>
          <p
            style={{
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            {totalRevenue.toLocaleString()}
          </p>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h2>🏆 Top Movie</h2>
          <p
            style={{
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            {topMovie?.title || "N/A"}
          </p>
        </div>
      </div>

      <h2
        style={{
          marginBottom: 20,
        }}
      >
        🎬 Movies List
      </h2>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#1c1c1c",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: 15 }}>ID</th>
              <th style={{ padding: 15 }}>Title</th>
              <th style={{ padding: 15 }}>Revenue</th>
              <th style={{ padding: 15 }}>Language</th>
            </tr>
          </thead>

          <tbody>
            {movies?.map((movie) => (
              <tr
                key={movie.id}
                style={{
                  borderTop: "1px solid #333",
                }}
              >
                <td style={{ padding: 15 }}>
                  {movie.id}
                </td>

                <td style={{ padding: 15 }}>
                  {movie.title}
                </td>

                <td style={{ padding: 15 }}>
                  {movie.revenue?.toLocaleString()}
                </td>

                <td style={{ padding: 15 }}>
                  {movie.language}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}