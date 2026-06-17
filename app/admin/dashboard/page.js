import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default async function Dashboard() {
  const { data: movies = [] } = await supabase
    .from("movies")
    .select("*");

  const { data: cinemas = [] } = await supabase
    .from("cinemas")
    .select("*");

  const { data: dailyStats = [] } = await supabase
    .from("daily_stats")
    .select("*");

  const totalMovies = movies.length;
  const totalCinemas = cinemas.length;
  const totalRecords = dailyStats.length;

  const totalRevenue = movies.reduce(
    (sum, movie) => sum + (movie.revenue || 0),
    0
  );

  const totalAudience = movies.reduce(
    (sum, movie) => sum + (movie.audience || 0),
    0
  );

  const topMovie = [...movies].sort(
    (a, b) => (b.revenue || 0) - (a.revenue || 0)
  )[0];

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 42,
          marginBottom: 30,
        }}
      >
        📊 Admin Dashboard
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
        <Card
          title="🎬 Movies / الأفلام"
          value={totalMovies}
        />

        <Card
          title="🎥 Cinemas / السينمات"
          value={totalCinemas}
        />

        <Card
          title="📅 Daily Stats / الإحصائيات"
          value={totalRecords}
        />

        <Card
          title="💰 Revenue / الإيرادات"
          value={totalRevenue.toLocaleString()}
        />

        <Card
          title="👥 Audience / الجمهور"
          value={totalAudience.toLocaleString()}
        />

        <Card
          title="🏆 Top Movie / الفيلم الأول"
          value={topMovie?.title || "N/A"}
        />
      </div>

      <h2
        style={{
          marginBottom: 20,
          fontSize: 28,
        }}
      >
        ⚡ Quick Access
      </h2>

      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          marginBottom: 50,
        }}
      >
        <Link href="/admin/movies">
          <button style={buttonStyle}>
            🎬 Movies
          </button>
        </Link>

        <Link href="/admin/cinemas">
          <button style={buttonStyle}>
            🎥 Cinemas
          </button>
        </Link>

        <Link href="/admin/daily-stats">
          <button style={buttonStyle}>
            📅 Daily Stats
          </button>
        </Link>

        <Link href="/admin/analytics">
          <button style={buttonStyle}>
            📊 Analytics
          </button>
        </Link>
      </div>

      <h2
        style={{
          marginBottom: 20,
          fontSize: 28,
        }}
      >
        🎬 Latest Movies
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
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Revenue</th>
              <th style={thStyle}>Audience</th>
              <th style={thStyle}>Language</th>
            </tr>
          </thead>

          <tbody>
            {movies.slice(0, 10).map((movie) => (
              <tr
                key={movie.id}
                style={{
                  borderTop: "1px solid #333",
                }}
              >
                <td style={tdStyle}>{movie.id}</td>

                <td style={tdStyle}>
                  {movie.title}
                </td>

                <td style={tdStyle}>
                  {(movie.revenue || 0).toLocaleString()}
                </td>

                <td style={tdStyle}>
                  {(movie.audience || 0).toLocaleString()}
                </td>

                <td style={tdStyle}>
                  {movie.language || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#1c1c1c",
        padding: 25,
        borderRadius: 12,
        boxShadow: "0 0 10px rgba(0,0,0,.3)",
      }}
    >
      <h3
        style={{
          marginBottom: 10,
        }}
      >
        {title}
      </h3>

      <h2>{value}</h2>
    </div>
  );
}

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "14px 24px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
  minWidth: 180,
};

const thStyle = {
  padding: 15,
  textAlign: "left",
  background: "#222",
};

const tdStyle = {
  padding: 15,
};