import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import {
  closeWorkDay,
  reopenWorkDay,
} from "../../../actions/workday";

export default async function WorkDayDetailsPage({
  params,
}) {
  const { id } = await params;

  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();

  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("*")
    .order("name");

  const { data: reports } = await supabase
    .from("boxoffice_reports")
    .select(`
      cinema_id,
      movie_id,
      tickets,
      revenue,
      movies (
        id,
        title,
        code
      )
    `)
    .eq("day_id", id);

  const completedCinemaIds = [
    ...new Set(
      (reports || []).map(
        (r) => r.cinema_id
      )
    ),
  ];

  const totalRevenue = (reports || []).reduce(
    (sum, row) =>
      sum + Number(row.revenue || 0),
    0
  );

  const totalTickets = (reports || []).reduce(
    (sum, row) =>
      sum + Number(row.tickets || 0),
    0
  );

  const movieStats = {};

  (reports || []).forEach((row) => {
    const movieId = row.movie_id;

    if (!movieStats[movieId]) {
      movieStats[movieId] = {
        title:
          row.movies?.title ||
          "غير معروف",
        code:
          row.movies?.code || "",
        revenue: 0,
        tickets: 0,
      };
    }

    movieStats[movieId].revenue +=
      Number(row.revenue || 0);

    movieStats[movieId].tickets +=
      Number(row.tickets || 0);
  });

  const rankedMovies = Object.values(
    movieStats
  ).sort(
    (a, b) =>
      b.revenue - a.revenue
  );

  const cinemaStats = {};

  (reports || []).forEach((row) => {
    if (!cinemaStats[row.cinema_id]) {
      const cinema = cinemas?.find(
        (c) => c.id === row.cinema_id
      );

      cinemaStats[row.cinema_id] = {
        name:
          cinema?.name ||
          "غير معروف",
        code:
          cinema?.code || "",
        revenue: 0,
      };
    }

    cinemaStats[row.cinema_id].revenue +=
      Number(row.revenue || 0);
  });

  const rankedCinemas = Object.values(
    cinemaStats
  ).sort(
    (a, b) =>
      b.revenue - a.revenue
  );

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1>📅 يوم العمل</h1>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        <h2>{day?.work_date}</h2>

        <p>
          الحالة{" "}
          {day?.status === "open"
            ? "🟢 مفتوح"
            : "🔴 مغلق"}
        </p>

        <div
          style={{
            marginTop: "15px",
          }}
        >
          {day?.status === "open" ? (
            <form
              action={async () => {
                "use server";
                await closeWorkDay(id);
              }}
            >
              <button
                type="submit"
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "8px",
                  cursor: "pointer",
                }}
              >
                🔒 إغلاق يوم العمل
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await reopenWorkDay(id);
              }}
            >
              <button
                type="submit"
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "8px",
                  cursor: "pointer",
                }}
              >
                🔓 إعادة فتح اليوم
              </button>
            </form>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "#1c1c1c",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>💰 إجمالي الإيراد</h3>
          <h2>
            {totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>🎟️ إجمالي الرواد</h3>
          <h2>
            {totalTickets.toLocaleString()}
          </h2>
        </div>

        <div
          style={{
            background: "#1c1c1c",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>🏢 السينمات المنتهية</h3>
          <h2>
            {completedCinemaIds.length}
          </h2>
        </div>
      </div>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        <h2>🏆 ترتيب الأفلام</h2>

        {rankedMovies.length === 0 ? (
          <p>لا توجد بيانات بعد</p>
        ) : (
          rankedMovies.map(
            (movie, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  padding: "10px 0",
                  borderBottom:
                    "1px solid #333",
                }}
              >
                <div>
                  <strong>
                    #{index + 1}
                  </strong>{" "}
                  {movie.code} -{" "}
                  {movie.title}
                </div>

                <div>
                  {movie.revenue.toLocaleString()}
                </div>
              </div>
            )
          )
        )}
      </div>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        <h2>🏢 ترتيب السينمات</h2>

        {rankedCinemas.length === 0 ? (
          <p>لا توجد بيانات بعد</p>
        ) : (
          rankedCinemas.map(
            (cinema, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  padding: "10px 0",
                  borderBottom:
                    "1px solid #333",
                }}
              >
                <div>
                  <strong>
                    #{index + 1}
                  </strong>{" "}
                  {cinema.code} -{" "}
                  {cinema.name}
                </div>

                <div>
                  {cinema.revenue.toLocaleString()}
                </div>
              </div>
            )
          )
        )}
      </div>

      <h2>🎬 السينمات</h2>

      <div
        style={{
          display: "grid",
          gap: "15px",
        }}
      >
        {cinemas?.map((cinema) => {
          const completed =
            completedCinemaIds.includes(
              cinema.id
            );

          return (
            <div
              key={cinema.id}
              style={{
                background: "#1c1c1c",
                padding: "15px",
                borderRadius: "10px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>
                  {cinema.code} -{" "}
                  {cinema.name}
                </h3>

                <p>
                  {completed
                    ? "✅ تم الإدخال"
                    : "⏳ لم يتم الإدخال"}
                </p>
              </div>

              {day?.status === "open" ? (
                <Link
                  href={`/admin/work-day/${id}/cinema/${cinema.id}`}
                >
                  <button
                    style={{
                      background:
                        "#2563eb",
                      color: "white",
                      border: "none",
                      padding:
                        "10px 16px",
                      borderRadius:
                        "8px",
                      cursor:
                        "pointer",
                    }}
                  >
                    إدارة السينما
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  style={{
                    background:
                      "#444",
                    color: "#999",
                    border: "none",
                    padding:
                      "10px 16px",
                    borderRadius:
                      "8px",
                  }}
                >
                  🔒 مغلق
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}