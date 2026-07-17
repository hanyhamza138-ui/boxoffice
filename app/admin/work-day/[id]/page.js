import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabase";
import {
  closeWorkDay,
  reopenWorkDay,
} from "../../../actions/workday";
import AdminNav from "../../../components/AdminNav";

import ar from "../../../../translations/ar";
import en from "../../../../translations/en";

export const dynamic = "force-dynamic";

export default async function WorkDayDetailsPage({
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

  // بيانات يوم العمل
  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();

  // السينمات
  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("*")
    .order("name");

  // الملخص
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

  const completedCinemaIds =
    new Set(
      rankedCinemas.map(
        (c) => c.cinema_id
      )
    );

  const completed =
    completedCinemaIds.size;

  const total =
    cinemas?.length || 0;

  const percent =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  return (
        <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 30,
      }}
    >
      <AdminNav />

      <h1
        style={{
          marginTop: 20,
          marginBottom: 25,
          fontSize: 36,
        }}
      >
        📅 {t.workDay}
      </h1>

      <div
        style={{
          background: "#1b1b1b",
          borderRadius: 16,
          padding: 25,
          marginBottom: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            {day?.work_date}
          </h2>

          <p
            style={{
              marginTop: 10,
              color:
                day?.status === "open"
                  ? "#22c55e"
                  : "#ef4444",
              fontWeight: "bold",
            }}
          >
            {day?.status === "open"
              ? `🟢 ${t.open}`
              : `🔴 ${t.closed}`}
          </p>
        </div>

        {day?.status === "open" ? (
          <form
            action={async () => {
              "use server";
              await closeWorkDay(id);
            }}
          >
            <button
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🔒 {t.closeWorkDay}
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
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🔓 {t.reopenWorkDay}
            </button>
          </form>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        <StatCard
          title={t.totalRevenue}
          value={Number(
            totals.revenue || 0
          ).toLocaleString()}
        />

        <StatCard
          title={t.totalTickets}
          value={Number(
            totals.tickets || 0
          ).toLocaleString()}
        />

        <StatCard
          title={t.totalCinemas}
          value={`${completed}/${total}`}
        />

        <StatCard
          title="Progress"
          value={`${percent}%`}
        />
      </div>

      <div
        style={{
          background: "#1b1b1b",
          borderRadius: 16,
          padding: 20,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          <span>Progress</span>

          <span>
            {completed} / {total}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: 14,
            background: "#333",
            borderRadius: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "#22c55e",
            }}
          />
        </div>
      </div>
            <Section title={t.movieRanking}>
        {rankedMovies.length === 0 ? (
          <p>{t.noData}</p>
        ) : (
          rankedMovies.map((movie, index) => (
            <Row
              key={movie.movie_id}
              left={
                <>
                  #{index + 1} {movie.code} - {movie.title}
                </>
              }
              right={Number(
                movie.revenue || 0
              ).toLocaleString()}
            />
          ))
        )}
      </Section>

      <Section title={t.cinemaRanking}>
        {rankedCinemas.length === 0 ? (
          <p>{t.noData}</p>
        ) : (
          rankedCinemas.map((cinema, index) => (
            <Row
              key={cinema.cinema_id}
              left={
                <>
                  #{index + 1} {cinema.code} - {cinema.name}
                </>
              }
              right={Number(
                cinema.revenue || 0
              ).toLocaleString()}
            />
          ))
        )}
      </Section>

      <h2 style={{ marginBottom: 20 }}>
        🎬 {t.cinemas}
      </h2>

      <div
        style={{
          display: "grid",
          gap: 15,
        }}
      >
        {cinemas?.map((cinema) => {
          const completedCinema =
            completedCinemaIds.has(cinema.id);

          return (
            <div
              key={cinema.id}
              style={{
                background: "#1b1b1b",
                borderRadius: 14,
                padding: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>
                  {cinema.code} - {cinema.name}
                </h3>

                <p
                  style={{
                    marginTop: 10,
                    color: completedCinema
                      ? "#22c55e"
                      : "#f59e0b",
                  }}
                >
                  {completedCinema
                    ? `✅ ${t.dataEntered}`
                    : `⏳ ${t.notEntered}`}
                </p>
              </div>

              {day?.status === "open" ? (
                <Link
                  href={`/admin/work-day/${id}/cinema/${cinema.id}`}
                >
                  <button
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {t.manageCinema}
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  style={{
                    background: "#444",
                    color: "#aaa",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: 10,
                  }}
                >
                  🔒 {t.closed}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 30 }}>
        <Link href="/admin/work-day">
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            ← {t.back}
          </button>
        </Link>
      </div>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#222",
        padding: 20,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#9ca3af",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: "bold",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 20,
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #333",
      }}
    >
      <div>{left}</div>

      <strong>{right}</strong>
    </div>
  );
}