import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { cookies } from "next/headers";
import AdminNav from "../../components/AdminNav";
import ar from "../../../translations/ar";
import en from "../../../translations/en";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  const { data } =
    await supabase.rpc(
      "get_dashboard_summary"
    );

  const totals =
    data?.totals || {};

  const topMovie =
    data?.top_movie || {};

  const latestMovies =
    data?.latest_movies || [];

  const { data: openDay } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("status", "open")
      .maybeSingle();

  return (
    <main
      style={{
        background: "#0b1120",
        minHeight: "100vh",
        color: "#fff",
        padding: 35,
        maxWidth: 1500,
        margin: "0 auto",
      }}
    >
      <AdminNav />

      <h1
        style={{
          fontSize: 42,
          marginTop: 20,
          marginBottom: 30,
        }}
      >
        📊 {t.dashboard}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
          gap: 18,
          marginBottom: 30,
        }}
      >
        <Card
          title={`🎬 ${t.movies}`}
          value={totals.movies || 0}
        />

        <Card
          title={`🏢 ${t.cinemas}`}
          value={totals.cinemas || 0}
        />

        <Card
          title={`💰 ${t.revenue}`}
          value={Number(
            totals.revenue || 0
          ).toLocaleString()}
        />

        <Card
          title={`🎟 ${t.audience}`}
          value={Number(
            totals.audience || 0
          ).toLocaleString()}
        />

        <Card
          title="🏆 Top Movie"
          value={topMovie.title || "-"}
        />

        <Card
          title="📅 Work Day"
          value={
            openDay
              ? openDay.work_date
              : "No Open Day"
          }
        />
      </div>
            <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr",
          gap: 20,
          marginBottom: 35,
        }}
      >
        <div
          style={{
            background: "#111827",
            borderRadius: 16,
            padding: 25,
            border: "1px solid #374151",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 20,
            }}
          >
            ⚡
            {language === "ar"
              ? " الوصول السريع"
              : " Quick Access"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 15,
            }}
          >
            <QuickButton
              href="/admin/work-day"
              title="📅 Work Day"
            />

            <QuickButton
              href="/admin/movies"
              title={`🎬 ${t.movies}`}
            />

            <QuickButton
              href="/admin/Adminstats/cinemas"
              title={`🏢 ${t.cinemas}`}
            />

            <QuickButton
              href="/admin/daily-stats"
              title={`📈 ${t.dailyStats}`}
            />

            <QuickButton
              href="/admin/analytics"
              title={`📊 ${t.analytics}`}
            />
          </div>
        </div>

        <div
          style={{
            background: "#111827",
            borderRadius: 16,
            padding: 25,
            border: "1px solid #374151",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            🏆
            {language === "ar"
              ? " أفضل فيلم"
              : " Top Movie"}
          </h2>

          <h1
            style={{
              fontSize: 28,
              marginTop: 25,
            }}
          >
            {topMovie.title || "-"}
          </h1>

          <p
            style={{
              color: "#9ca3af",
              marginTop: 20,
            }}
          >
            💰{" "}
            {Number(
              topMovie.revenue || 0
            ).toLocaleString()}
          </p>

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            🎟{" "}
            {Number(
              topMovie.audience || 0
            ).toLocaleString()}
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#111827",
          borderRadius: 16,
          padding: 25,
          border: "1px solid #374151",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
          }}
        >
          🎬
          {language === "ar"
            ? " أحدث الأفلام"
            : " Latest Movies"}
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>
                {language === "ar"
                  ? "العنوان"
                  : "Title"}
              </th>
              <th style={thStyle}>
                {t.revenue}
              </th>
              <th style={thStyle}>
                {t.audience}
              </th>
              <th style={thStyle}>
                {t.language}
              </th>
            </tr>
          </thead>

          <tbody>
            {latestMovies.map((movie) => (
              <tr key={movie.id}>
                <td style={tdStyle}>
                  {movie.id}
                </td>

                <td style={tdStyle}>
                  {movie.title}
                </td>

                <td style={tdStyle}>
                  {Number(
                    movie.revenue || 0
                  ).toLocaleString()}
                </td>

                <td style={tdStyle}>
                  {Number(
                    movie.audience || 0
                  ).toLocaleString()}
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
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: 16,
        padding: 24,
        textAlign: "center",
        transition: ".2s",
      }}
    >
      <div
        style={{
          color: "#9ca3af",
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function QuickButton({ href, title }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
      }}
    >
      <div
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: 18,
          borderRadius: 12,
          textAlign: "center",
          fontWeight: "bold",
          cursor: "pointer",
          transition: ".2s",
        }}
      >
        {title}
      </div>
    </Link>
  );
}

const thStyle = {
  padding: 16,
  background: "#1f2937",
  textAlign: "left",
  borderBottom: "1px solid #374151",
};

const tdStyle = {
  padding: 16,
  borderBottom: "1px solid #374151",
};