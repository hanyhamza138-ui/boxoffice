
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

/* ==========================================================
   SETTINGS
========================================================== */

const MIN_WORK_DATE = "2026-01-01";

/* ==========================================================
   HELPERS
========================================================== */

function formatDate(date) {
  if (!date) return "";

  const value = String(date);

  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;

  return `${day}/${month}/${year}`;
}

function numberValue(value) {
  return Number(value || 0).toLocaleString();
}

/* ==========================================================
   PAGE
========================================================== */

export default async function WorkDayDetailsPage({
  params,
}) {
  const { id } = await params;

  /* ========================================================
     LANGUAGE
  ======================================================== */

  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  /* ========================================================
     CURRENT WORK DAY
  ======================================================== */

  const { data: day } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("id", id)
      .single();

  /* ========================================================
     CINEMAS
  ======================================================== */

  const { data: cinemas } =
    await supabase
      .from("cinemas")
      .select("*")
      .order("name");

  /* ========================================================
     SUMMARY
     
     نفس الـ RPC الموجود في الملف الأصلي
  ======================================================== */

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

  /* ========================================================
     COMPLETED CINEMAS
  ======================================================== */

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

  /* ========================================================
     PREVIOUS WORK DAY
     
     يبدأ البحث من 2026-01-01
     ويعتمد على التاريخ وليس ID
  ======================================================== */

  let previousDay = null;

  if (
    day?.work_date &&
    day.work_date > MIN_WORK_DATE
  ) {
    const { data } =
      await supabase
        .from("boxoffice_days")
        .select(
          "id,work_date,status"
        )
        .gte(
          "work_date",
          MIN_WORK_DATE
        )
        .lt(
          "work_date",
          day.work_date
        )
        .order("work_date", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    previousDay = data || null;
  }

  /* ========================================================
     NEXT WORK DAY
     
     يعتمد على أول يوم موجود بعد اليوم الحالي
  ======================================================== */

  let nextDay = null;

  if (day?.work_date) {
    const { data } =
      await supabase
        .from("boxoffice_days")
        .select(
          "id,work_date,status"
        )
        .gte(
          "work_date",
          MIN_WORK_DATE
        )
        .gt(
          "work_date",
          day.work_date
        )
        .order("work_date", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

    nextDay = data || null;
  }

  /* ========================================================
     PAGE
  ======================================================== */

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

      {/* ==================================================
          TITLE
      ================================================== */}

      <h1
        style={{
          marginTop: 20,
          marginBottom: 25,
          fontSize: 36,
        }}
      >
        📅 {t.workDay}
      </h1>

      {/* ==================================================
          DATE NAVIGATION
      ================================================== */}

      <div
        style={{
          background: "#181818",
          border: "1px solid #333",
          borderRadius: 16,
          padding: 18,
          marginBottom: 25,
          display: "grid",
          gridTemplateColumns:
            "1fr auto 1fr",
          alignItems: "center",
          gap: 15,
        }}
      >
        {/* PREVIOUS */}

        <div>
          {previousDay ? (
            <Link
              href={`/admin/work-day/${previousDay.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#292929",
                color: "#fff",
                padding:
                  "11px 16px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              ← السابق

              <span
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                {formatDate(
                  previousDay.work_date
                )}
              </span>
            </Link>
          ) : (
            <span
              style={{
                color: "#666",
                fontSize: 14,
              }}
            >
              ← بداية السجل
            </span>
          )}
        </div>

        {/* CURRENT */}

        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#9ca3af",
              fontSize: 12,
              marginBottom: 5,
            }}
          >
            WORK DAY
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            {formatDate(
              day?.work_date
            )}
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {day?.work_date}
          </div>
        </div>

        {/* NEXT */}

        <div
          style={{
            textAlign: "right",
          }}
        >
          {nextDay ? (
            <Link
              href={`/admin/work-day/${nextDay.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#2563eb",
                color: "#fff",
                padding:
                  "11px 16px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  color: "#dbeafe",
                  fontSize: 13,
                }}
              >
                {formatDate(
                  nextDay.work_date
                )}
              </span>

              التالي →
            </Link>
          ) : (
            <span
              style={{
                color: "#666",
                fontSize: 14,
              }}
            >
              آخر يوم →
            </span>
          )}
        </div>
      </div>

      {/* ==================================================
          CURRENT DAY HEADER
      ================================================== */}

      <div
        style={{
          background: "#1b1b1b",
          borderRadius: 16,
          padding: 25,
          marginBottom: 25,
          display: "flex",
          justifyContent:
            "space-between",
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

              await closeWorkDay(
                id
              );
            }}
          >
            <button
              type="submit"
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding:
                  "12px 20px",
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

              await reopenWorkDay(
                id
              );
            }}
          >
            <button
              type="submit"
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding:
                  "12px 20px",
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

      {/* ==================================================
          STATS
      ================================================== */}

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
          value={numberValue(
            totals.revenue
          )}
        />

        <StatCard
          title={t.totalTickets}
          value={numberValue(
            totals.tickets
          )}
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

      {/* ==================================================
          PROGRESS
      ================================================== */}

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
            justifyContent:
              "space-between",
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          <span>
            Progress
          </span>

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

      {/* ==================================================
          MOVIE RANKING
      ================================================== */}

      <Section
        title={t.movieRanking}
      >
        {rankedMovies.length ===
        0 ? (
          <p>{t.noData}</p>
        ) : (
          rankedMovies.map(
            (movie, index) => (
              <Row
                key={
                  movie.movie_id
                }
                left={
                  <>
                    #{index + 1}{" "}
                    {movie.code} -{" "}
                    {movie.title}
                  </>
                }
                right={numberValue(
                  movie.revenue
                )}
              />
            )
          )
        )}
      </Section>

      {/* ==================================================
          CINEMA RANKING
      ================================================== */}

      <Section
        title={t.cinemaRanking}
      >
        {rankedCinemas.length ===
        0 ? (
          <p>{t.noData}</p>
        ) : (
          rankedCinemas.map(
            (cinema, index) => (
              <Row
                key={
                  cinema.cinema_id
                }
                left={
                  <>
                    #{index + 1}{" "}
                    {cinema.code} -{" "}
                    {cinema.name}
                  </>
                }
                right={numberValue(
                  cinema.revenue
                )}
              />
            )
          )
        )}
      </Section>

      {/* ==================================================
          CINEMAS
      ================================================== */}

      <h2
        style={{
          marginBottom: 20,
        }}
      >
        🎬 {t.cinemas}
      </h2>

      <div
        style={{
          display: "grid",
          gap: 15,
        }}
      >
        {cinemas?.map(
          (cinema) => {
            const completedCinema =
              completedCinemaIds.has(
                cinema.id
              );

            return (
              <div
                key={
                  cinema.id
                }
                style={{
                  background:
                    "#1b1b1b",
                  borderRadius: 14,
                  padding: 18,
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  flexWrap:
                    "wrap",
                  gap: 20,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    {cinema.code} -{" "}
                    {cinema.name}
                  </h3>

                  <p
                    style={{
                      marginTop: 10,
                      color:
                        completedCinema
                          ? "#22c55e"
                          : "#f59e0b",
                    }}
                  >
                    {completedCinema
                      ? `✅ ${t.dataEntered}`
                      : `⏳ ${t.notEntered}`}
                  </p>
                </div>

                {day?.status ===
                "open" ? (
                  <Link
                    href={`/admin/work-day/${id}/cinema/${cinema.id}`}
                  >
                    <button
                      type="button"
                      style={{
                        background:
                          "#2563eb",
                        color:
                          "#fff",
                        border:
                          "none",
                        padding:
                          "12px 20px",
                        borderRadius:
                          10,
                        cursor:
                          "pointer",
                        fontWeight:
                          700,
                      }}
                    >
                      {
                        t.manageCinema
                      }
                    </button>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      background:
                        "#444",
                      color:
                        "#aaa",
                      border:
                        "none",
                      padding:
                        "12px 20px",
                      borderRadius:
                        10,
                    }}
                  >
                    🔒{" "}
                    {t.closed}
                  </button>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* ==================================================
          BOTTOM
      ================================================== */}

      <div
        style={{
          marginTop: 30,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/work-day"
          style={{
            background: "#2563eb",
            color: "#fff",
            padding:
              "12px 20px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← {t.back}
        </Link>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {previousDay && (
            <Link
              href={`/admin/work-day/${previousDay.id}`}
              style={{
                background:
                  "#374151",
                color: "#fff",
                padding:
                  "12px 18px",
                borderRadius: 10,
                textDecoration:
                  "none",
                fontWeight: 700,
              }}
            >
              ← السابق
            </Link>
          )}

          {nextDay && (
            <Link
              href={`/admin/work-day/${nextDay.id}`}
              style={{
                background:
                  "#2563eb",
                color: "#fff",
                padding:
                  "12px 18px",
                borderRadius: 10,
                textDecoration:
                  "none",
                fontWeight: 700,
              }}
            >
              التالي →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

/* ==========================================================
   STAT CARD
========================================================== */

function StatCard({
  title,
  value,
}) {
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

/* ==========================================================
   SECTION
========================================================== */

function Section({
  title,
  children,
}) {
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

/* ==========================================================
   ROW
========================================================== */

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
        gap: 15,
      }}
    >
      <div>{left}</div>

      <strong>
        {right}
      </strong>
    </div>
  );
}
