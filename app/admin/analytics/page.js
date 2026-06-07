import { supabase } from "../../../lib/supabase";

export default async function AnalyticsPage() {
  const { data: dailyStats = [] } = await supabase
    .from("daily_stats")
    .select("*")
    .order("date", { ascending: false });

  const { data: cinemas = [] } = await supabase
    .from("cinemas")
    .select("*");

  const { data: movies = [] } = await supabase
    .from("movies")
    .select("*");

  const totalRevenue = dailyStats.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0
  );

  const totalAudience = dailyStats.reduce(
    (sum, item) => sum + (item.audience || 0),
    0
  );

  const totalRecords = dailyStats.length;
  const totalCinemas = cinemas.length;

  const movieMap = {};

  movies.forEach((movie) => {
    movieMap[String(movie.id)] = movie.title;
  });

  const cinemaMap = {};

  cinemas.forEach((cinema) => {
    cinemaMap[String(cinema.id)] = {
      name: cinema.name,
      city: cinema.city,
    };
  });

  const movieRevenueMap = {};

  dailyStats.forEach((item) => {
    const key = String(item.movie_id);

    movieRevenueMap[key] =
      (movieRevenueMap[key] || 0) +
      (item.revenue || 0);
  });

  const rankedMovies = movies
    .map((movie) => ({
      ...movie,
      revenue:
        movieRevenueMap[String(movie.id)] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const cinemaRevenueMap = {};

  dailyStats.forEach((item) => {
    const key = String(item.cinema_id);

    cinemaRevenueMap[key] =
      (cinemaRevenueMap[key] || 0) +
      (item.revenue || 0);
  });

  const rankedCinemas = cinemas
    .map((cinema) => ({
      ...cinema,
      revenue:
        cinemaRevenueMap[String(cinema.id)] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topMovie = rankedMovies[0];
  const topCinema = rankedCinemas[0];

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >
      <h1>📊 Analytics Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: 20,
          marginTop: 30,
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
          <h3>📋 Records</h3>
          <h2>{totalRecords}</h2>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3>🎥 Cinemas</h3>
          <h2>{totalCinemas}</h2>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3>🏆 Top Movie</h3>
          <h2>{topMovie?.title || "-"}</h2>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3>🎬 Top Cinema</h3>
          <h2>{topCinema?.name || "-"}</h2>
        </div>
      </div>

      <h2 style={{ marginBottom: 20 }}>
        🏆 Top 5 Movies By Revenue
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1c1c1c",
          marginBottom: 50,
        }}
      >
        <thead>
          <tr>
            <th style={{ padding: 15 }}>Rank</th>
            <th style={{ padding: 15 }}>Movie</th>
            <th style={{ padding: 15 }}>Revenue</th>
          </tr>
        </thead>

        <tbody>
          {rankedMovies.slice(0, 5).map((movie, index) => (
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
                {movie.revenue.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginBottom: 20 }}>
        🏆 Top 5 Cinemas By Revenue
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1c1c1c",
          marginBottom: 50,
        }}
      >
        <thead>
          <tr>
            <th style={{ padding: 15 }}>Rank</th>
            <th style={{ padding: 15 }}>Cinema</th>
            <th style={{ padding: 15 }}>City</th>
            <th style={{ padding: 15 }}>Revenue</th>
          </tr>
        </thead>

        <tbody>
          {rankedCinemas.slice(0, 5).map((cinema, index) => (
            <tr
              key={cinema.id}
              style={{
                borderTop: "1px solid #333",
              }}
            >
              <td style={{ padding: 15 }}>
                #{index + 1}
              </td>

              <td style={{ padding: 15 }}>
                {cinema.name}
              </td>

              <td style={{ padding: 15 }}>
                {cinema.city}
              </td>

              <td style={{ padding: 15 }}>
                {cinema.revenue.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginBottom: 20 }}>
        📅 Latest Daily Stats
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1c1c1c",
        }}
      >
        <thead>
          <tr>
            <th style={{ padding: 15 }}>Movie</th>
            <th style={{ padding: 15 }}>Cinema</th>
            <th style={{ padding: 15 }}>City</th>
            <th style={{ padding: 15 }}>Revenue</th>
            <th style={{ padding: 15 }}>Audience</th>
            <th style={{ padding: 15 }}>Date</th>
          </tr>
        </thead>

        <tbody>
          {dailyStats.slice(0, 20).map((row) => (
            <tr
              key={row.id}
              style={{
                borderTop: "1px solid #333",
              }}
            >
              <td style={{ padding: 15 }}>
                {movieMap[String(row.movie_id)] ||
                  "Unknown Movie"}
              </td>

              <td style={{ padding: 15 }}>
                {cinemaMap[String(row.cinema_id)]
                  ?.name || "Unknown Cinema"}
              </td>

              <td style={{ padding: 15 }}>
                {cinemaMap[String(row.cinema_id)]
                  ?.city || "-"}
              </td>

              <td style={{ padding: 15 }}>
                {(row.revenue || 0).toLocaleString()}
              </td>

              <td style={{ padding: 15 }}>
                {(row.audience || 0).toLocaleString()}
              </td>

              <td style={{ padding: 15 }}>
                {row.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}