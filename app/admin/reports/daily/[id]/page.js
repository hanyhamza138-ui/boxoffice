import { supabase } from "../../../../../lib/supabase";
import ReportActions from "../../../../../components/ReportActions";
import Link from "next/link";
import { cookies } from "next/headers";
import ar from "../../../../../translations/ar";
import en from "../../../../../translations/en";
export const dynamic = "force-dynamic";

export default async function DailyReportPage({
  params,
}) {
  const { id } = await params;

const cookieStore = await cookies();

const language =
  cookieStore.get("language")?.value || "en";

const t =
  language === "ar"
    ? ar
    : en;
  const { data: day } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("id", id)
      .single();

  const { data: summary } =
    await supabase.rpc(
      "get_workday_summary",
      {
        p_day_id: Number(id),
      }
    );

  const totals =
    summary?.totals || {};

  const rankedMovies =
    summary?.movies || [];

  const rankedCinemas =
    summary?.cinemas || [];

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1>
  {t.boxOfficeEgypt}
</h1>

          <p>
  {t.dailyReport} - {day?.work_date}
</p>
        </div>

        <ReportActions
  day={day?.work_date}
  totals={totals}
  movies={rankedMovies}
  cinemas={rankedCinemas}
/>
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
        <Box
          title={t.totalRevenue}
          value={Number(
            totals.revenue || 0
          ).toLocaleString()}
        />

        <Box
           title={t.totalTickets}
          value={Number(
            totals.tickets || 0
          ).toLocaleString()}
        />

        <Box
          title={t.totalCinemas}
          value={
            totals.cinemas || 0
          }
        />
      </div>
            <Section title={t.movieRanking}>
        {rankedMovies.length === 0 ? (
          <p>{t.noData}</p>
        ) : (
          rankedMovies.map(
            (movie, index) => (
              <Row
                key={movie.movie_id}
                left={
                  <>
                    #{index + 1}{" "}
                    {movie.code}
                    {" - "}
                    {movie.title}
                  </>
                }
                right={Number(
                  movie.revenue || 0
                ).toLocaleString()}
              />
            )
          )
        )}
      </Section>

      <Section title={t.cinemaRanking}>
        {rankedCinemas.length === 0 ? (
          <p>{t.noData}</p>
        ) : (
          rankedCinemas.map(
            (
              cinema,
              index
            ) => (
              <Row
                key={
                  cinema.cinema_id
                }
                left={
                  <>
                    #{index + 1}{" "}
                    {cinema.code}
                    {" - "}
                    {cinema.name}
                  </>
                }
                right={Number(
                  cinema.revenue || 0
                ).toLocaleString()}
              />
            )
          )
        )}
      </Section>

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <Link
          href="/admin/reports/daily"
        >
          <button
            style={buttonStyle}
          >
            ← {t.backToReports}
          </button>
        </Link>
      </div>
          </main>
  );
}

function Box({
  title,
  value,
}) {
  return (
    <div
      style={{
        background: "#1c1c1c",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h3>{title}</h3>

      <h2>{value}</h2>
    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <div
      style={{
        background: "#1c1c1c",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "30px",
      }}
    >
      <h2
        style={{
          marginBottom: "15px",
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

function Row({
  left,
  right,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom:
          "1px solid #333",
      }}
    >
      <div>{left}</div>

      <strong>{right}</strong>
    </div>
  );
}

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const disabledButtonStyle = {
  background: "#444",
  color: "#bbb",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "not-allowed",
};