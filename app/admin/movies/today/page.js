import { supabase } from "../../../../lib/supabase";
import { cookies } from "next/headers";
import ar from "../../../../translations/ar";
import en from "../../../../translations/en";

export default async function TodayMoviesPage({
  searchParams,
}) {
  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value ||
    "en";

  const t =
    language === "ar"
      ? ar
      : en;

  const params =
    await searchParams;

  const filter =
    params?.lang || "all";

  //----------------------------------
  // Get Open Work Day
  //----------------------------------

  const { data: openDay } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("status", "open")
      .maybeSingle();

  //----------------------------------
  // Movies
  //----------------------------------

  let moviesQuery = supabase
    .from("movies")
    .select("*")
    .eq("is_active", true);

  const normalizeLanguage = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase();

const arabicValues = [
  "ar",
  "arabic",
  "عربي",
];

const englishValues = [
  "en",
  "eng",
  "english",
];

  const {
    data: allMovies,
  } =
    await moviesQuery.order(
      "title"
    );

  let movies =
    allMovies || [];

  if (filter === "ar") {
  movies = movies.filter(
    (movie) => movie.language === "ar"
  );
}

if (filter === "en") {
  movies = movies.filter(
    (movie) => movie.language === "en"
  );
}
  //----------------------------------
  // Reports
  //----------------------------------

  let reports = [];

  if (openDay) {
    const {
      data: reportsData,
    } = await supabase
      .from("boxoffice_reports")
      .select(`
        movie_id,
        cinema_id,
        tickets,
        revenue
      `)
      .eq(
        "day_id",
        openDay.id
      );

    reports =
      reportsData || [];
  }

  //----------------------------------
  // Merge Movies + Reports
  //----------------------------------

  const finalMovies =
    movies.map((movie) => {
      const movieReports =
        reports.filter(
          (report) =>
            report.movie_id ===
            movie.id
        );

      const revenue =
        movieReports.reduce(
          (
            sum,
            row
          ) =>
            sum +
            Number(
              row.revenue || 0
            ),
          0
        );

      const tickets =
        movieReports.reduce(
          (
            sum,
            row
          ) =>
            sum +
            Number(
              row.tickets || 0
            ),
          0
        );

      const cinemas =
        new Set(
          movieReports.map(
            (row) =>
              row.cinema_id
          )
        ).size;

      return {
        ...movie,

        revenue:
          movieReports.length
            ? revenue
            : Number(
                movie.revenue || 0
              ),

        audience:
          movieReports.length
            ? tickets
            : Number(
                movie.audience || 0
              ),

        cinemas:
          movieReports.length
            ? cinemas
            : Number(
                movie.cinemas || 0
              ),
      };
    });

  //----------------------------------
  // Sort
  //----------------------------------

  finalMovies.sort(
    (a, b) =>
      b.revenue -
      a.revenue
  );

  //----------------------------------
  // Statistics
  //----------------------------------

  const totalRevenue =
    finalMovies.reduce(
      (
        sum,
        movie
      ) =>
        sum +
        Number(
          movie.revenue || 0
        ),
      0
    );

  const totalAudience =
    finalMovies.reduce(
      (
        sum,
        movie
      ) =>
        sum +
        Number(
          movie.audience || 0
        ),
      0
    );

  const totalMovieCount =
    finalMovies.length;

  const totalCinemaCount =
    new Set(
      reports.map(
        (r) =>
          r.cinema_id
      )
    ).size;
      return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(210px,1fr))",
    gap: "18px",
  }}
  >
        <div>
          <h1
            style={{
              fontSize: "34px",
              margin: 0,
            }}
          >
            🎬{" "}
            {language === "ar"
              ? "أفلام اليوم"
              : "Today's Movies"}
          </h1>

          <p
            style={{
              color: "#888",
              marginTop: "8px",
            }}
          >
            {openDay
              ? `📅 ${openDay.work_date}`
              : language === "ar"
              ? "لا يوجد يوم عمل مفتوح"
              : "No Open Work Day"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <a href="/admin/movies/today">
            <button
              style={{
                padding:
                  "10px 18px",
                borderRadius:
                  "8px",
                border: "none",
                cursor: "pointer",
                background:
                  filter === "all"
                    ? "#2563eb"
                    : "#333",
                color: "white",
              }}
            >
              🌍 الكل
            </button>
          </a>

          <a href="/admin/movies/today?lang=ar">
            <button
              style={{
                padding:
                  "10px 18px",
                borderRadius:
                  "8px",
                border: "none",
                cursor: "pointer",
                background:
                  filter === "ar"
                    ? "#16a34a"
                    : "#333",
                color: "white",
              }}
            >
              🇪🇬 عربي
            </button>
          </a>

          <a href="/admin/movies/today?lang=en">
            <button
              style={{
                padding:
                  "10px 18px",
                borderRadius:
                  "8px",
                border: "none",
                cursor: "pointer",
                background:
                  filter === "en"
                    ? "#dc2626"
                    : "#333",
                color: "white",
              }}
            >
              🌎 English
            </button>
          </a>
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
            background:
              "#1c1c1c",
            borderRadius:
              "12px",
            padding: "20px",
          }}
        >
          <div>
            💰 إجمالي الإيراد
          </div>

          <h2>
            {totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div
          style={{
            background:
              "#1c1c1c",
            borderRadius:
              "12px",
            padding: "20px",
          }}
        >
          <div>
            🎟️ إجمالي الرواد
          </div>

          <h2>
            {totalAudience.toLocaleString()}
          </h2>
        </div>

        <div
          style={{
            background:
              "#1c1c1c",
            borderRadius:
              "12px",
            padding: "20px",
          }}
        >
          <div>
            🏢 السينمات
          </div>

          <h2>
            {totalCinemaCount}
          </h2>
        </div>

        <div
          style={{
            background:
              "#1c1c1c",
            borderRadius:
              "12px",
            padding: "20px",
          }}
        >
          <div>
            🎬 عدد الأفلام
          </div>

          <h2>
            {totalMovieCount}
          </h2>
        </div>
      </div>

        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(210px,1fr))",
          gap: "18px",
        }}
      >
        {finalMovies.map(
          (
            movie,
            index
          ) => (
            <div
              key={movie.id}
              style={{
                background:
                  "#1c1c1c",
                borderRadius:
                  "14px",
                overflow:
                  "hidden",
                border:
                  "1px solid #2f2f2f",
              }}
            >
              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <img
                  src={
                    movie.poster
                  }
                  alt={
                    movie.title
                  }
                  style={{
                    width:
                      "100%",
                    height:
                      "300px",
                    objectFit:
                      "cover",
                  }}
                />

                {index < 3 && (
                  <div
                    style={{
                      position:
                        "absolute",
                      top: 10,
                      left: 10,
                      background:
                        "#111",
                      padding:
                        "6px 10px",
                      borderRadius:
                        "20px",
                      fontWeight:
                        "bold",
                    }}
                  >
                    {index ===
                      0 &&
                      "🥇"}

                    {index ===
                      1 &&
                      "🥈"}

                    {index ===
                      2 &&
                      "🥉"}
                  </div>
                )}

                <div
                  style={{
                    position:
                      "absolute",
                    right: 10,
                    top: 10,
                    background:
                      "#2563eb",
                    padding:
                      "5px 10px",
                    borderRadius:
                      "15px",
                  }}
                >
                  #
                  {index + 1}
                </div>
              </div>

              <div
                style={{
                  padding:
                    "15px",
                }}
              >
                <h3
                  style={{
                    minHeight:
                      "55px",
                    marginBottom:
                      "15px",
                  }}
                >
                  {movie.title}
                </h3>
                                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    💰{" "}
                    {language === "ar"
                      ? "الإيراد"
                      : "Revenue"}
                  </span>

                  <strong
                    style={{
                      color: "#22c55e",
                      fontSize: "20px",
                    }}
                  >
                    {Number(
                      movie.revenue || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    🎟️{" "}
                    {language === "ar"
                      ? "الرواد"
                      : "Tickets"}
                  </span>

                  <strong>
                    {Number(
                      movie.audience || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    🏢{" "}
                    {language === "ar"
                      ? "السينمات"
                      : "Cinemas"}
                  </span>

                  <strong>
                    {movie.cinemas}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <span>
                    🌐{" "}
                    {language === "ar"
                      ? "اللغة"
                      : "Language"}
                  </span>

                  <strong>
                    {movie.language ||
                      "-"}
                  </strong>
                </div>

                <div
                  style={{
                    height: "8px",
                    background:
                      "#333",
                    borderRadius:
                      "999px",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      height:
                        "100%",
                      width: `${
                        totalRevenue
                          ? Math.min(
                              100,
                              (
                                (movie.revenue ||
                                  0) /
                                totalRevenue
                              ) *
                                100
                            )
                          : 0
                      }%`,
                      background:
                        "#22c55e",
                      transition:
                        "0.3s",
                    }}
                  />
                </div>

                <div
                  style={{
                    textAlign:
                      "center",
                    marginTop:
                      "8px",
                    color:
                      "#999",
                    fontSize:
                      "13px",
                  }}
                >
                  {totalRevenue
                    ? (
                        ((movie.revenue ||
                          0) /
                          totalRevenue) *
                        100
                      ).toFixed(
                        1
                      )
                    : "0.0"}
                  %{" "}
                  {language === "ar"
                    ? "من إجمالي الإيراد"
                    : "of Total Revenue"}
                </div>
              </div>
            </div>
          )
        )}

        {finalMovies.length ===
          0 && (
          <div
            style={{
              gridColumn:
                "1/-1",
              textAlign:
                "center",
              padding:
                "60px 20px",
              background:
                "#1c1c1c",
              borderRadius:
                "12px",
            }}
          >
            <h2>
              😔{" "}
              {language === "ar"
                ? "لا توجد أفلام"
                : "No Movies Found"}
            </h2>
          </div>
        )}

    </main>
  );
}