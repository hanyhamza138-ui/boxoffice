import { supabase } from "../../../../lib/supabase";
import { cookies } from "next/headers";
import ar from "../../../../translations/ar";
import en from "../../../../translations/en";

export default async function TodayMoviesPage() {
  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  const { data: movies } = await supabase
  
    .from("movies")
    .select("*")
    .eq("is_active", true)
    .order("revenue", { ascending: false });
const totalRevenue = (movies || []).reduce(
  (sum, movie) => sum + Number(movie.revenue || 0),
  0
);

const totalAudience = (movies || []).reduce(
  (sum, movie) => sum + Number(movie.audience || 0),
  0
);

const { count: totalCinemas } = await supabase
  .from("cinemas")
  .select("*", {
    count: "exact",
    head: true,
  });
  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1
        style={{
          marginBottom: "25px",
          fontSize: "34px",
          fontWeight: "700",
        }}
      >
        🎬
        {language === "ar"
          ? " أفلام اليوم"
          : " Today's Movies"}
      </h1>
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "25px",
  }}
>
  <div
    style={{
      background: "#181818",
      padding: "15px",
      borderRadius: "12px",
      border: "1px solid #2a2a2a",
    }}
  >
    <div>💰 إجمالي الإيراد</div>
    <h2>
      {totalRevenue.toLocaleString()}
    </h2>
  </div>

  <div
    style={{
      background: "#181818",
      padding: "15px",
      borderRadius: "12px",
      border: "1px solid #2a2a2a",
    }}
  >
    <div>🎟️ إجمالي الرواد</div>
    <h2>
      {totalAudience.toLocaleString()}
    </h2>
  </div>

  <div
    style={{
      background: "#181818",
      padding: "15px",
      borderRadius: "12px",
      border: "1px solid #2a2a2a",
    }}
  >
    <div>🏢 إجمالي السينمات</div>
    <h2>
      {totalCinemas.toLocaleString()}
    </h2>
  </div>

  <div
    style={{
      background: "#181818",
      padding: "15px",
      borderRadius: "12px",
      border: "1px solid #2a2a2a",
    }}
  >
    <div>🎬 عدد الأفلام</div>
    <h2>
      {movies?.length || 0}
    </h2>
  </div>
</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(180px,1fr))",
          gap: "15px",
        }}
      >
        {(movies || []).map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#181818",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #2a2a2a",
              boxShadow:
                "0 4px 15px rgba(0,0,0,.30)",
            }}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                padding: "10px",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  minHeight: "55px",
                  lineHeight: "1.4",
                }}
              >
                {movie.title}
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>
                  💰
                  {language === "ar"
                    ? " الإيراد"
                    : " Revenue"}
                </span>

                <strong
                  style={{
                    color: "#22c55e",
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {(movie.revenue || 0).toLocaleString()}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>
                  🎟️
                  {language === "ar"
                    ? " الرواد"
                    : " Audience"}
                </span>

                <strong
                  style={{
                    fontSize: "17px",
                    fontWeight: "600",
                  }}
                >
                  {(movie.audience || 0).toLocaleString()}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  borderTop: "1px solid #333",
                  paddingTop: "8px",
                }}
              >
                <span>
                  🏢
                  {language === "ar"
                    ? " السينمات"
                    : " Cinemas"}
                </span>

                <strong
                  style={{
                    fontSize: "17px",
                    fontWeight: "600",
                  }}
                >
                  {movie.cinemas || 0}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}