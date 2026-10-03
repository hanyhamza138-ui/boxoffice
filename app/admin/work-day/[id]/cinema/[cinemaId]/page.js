import { cookies } from "next/headers";
import Link from "next/link";

import { supabase } from "../../../../../../lib/supabase";

import WorkDayForm from "./WorkDayForm";
import AdminNav from "../../../../../components/AdminNav";

import ar from "../../../../../../translations/ar";
import en from "../../../../../../translations/en";

export const dynamic = "force-dynamic";

export default async function CinemaPage({ params }) {
  const { id, cinemaId } = await params;

  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  /*
   * ==========================================================
   * WORK DAY
   * ==========================================================
   */

  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();

  /*
   * ==========================================================
   * CURRENT CINEMA
   * ==========================================================
   */

  const { data: cinema } = await supabase
    .from("cinemas")
    .select("*")
    .eq("id", cinemaId)
    .single();

  /*
   * ==========================================================
   * ALL CINEMAS
   *
   * تستخدم للتنقل بين السينمات.
   * ==========================================================
   */

  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("id,code,name")
    .order("name");

  const cinemaList = cinemas || [];

  /*
   * ==========================================================
   * ACTIVE MOVIES
   * ==========================================================
   *
   * كل الأفلام الموجودة في جدول movies تظل كما هي.
   * لا نحذف ولا نعدل أي فيلم.
   *
   * هذه القائمة تستخدم عندما نحتاج لإضافة فيلم جديد للسينما.
   * ==========================================================
   */

  const { data: movies } = await supabase
    .from("movies")
    .select("id,title,code,poster")
    .eq("is_active", true)
    .order("title");

  const movieList = movies || [];

  /*
   * ==========================================================
   * MOVIE VERSIONS
   * ==========================================================
   */

  const { data: versions } = await supabase
    .from("movie_versions")
    .select("*")
    .order("name");

  const versionList = versions || [];

  /*
   * ==========================================================
   * CURRENT DAY REPORTS
   * ==========================================================
   *
   * هذه هي البيانات الفعلية لليوم الحالي.
   * التذاكر والإيراد هنا تخص هذا اليوم فقط.
   * ==========================================================
   */

  const { data: currentReports } = await supabase
    .from("boxoffice_reports")
    .select("*")
    .eq("day_id", id)
    .eq("cinema_id", cinemaId);

  const todayReports = currentReports || [];

  /*
   * ==========================================================
   * HISTORICAL CINEMA MOVIES
   * ==========================================================
   *
   * هنا النقطة الأساسية:
   *
   * نبحث في كل الأيام السابقة عن الأفلام التي سبق إدخالها
   * لهذه السينما.
   *
   * بالتالي:
   *
   * اليوم الأول:
   *   تدخل 10 أفلام.
   *
   * اليوم الثاني:
   *   نفس الـ10 أفلام تظهر تلقائيًا.
   *
   * اليوم الثالث:
   *   نفس القائمة تظهر.
   *
   * لو أضفت فيلمًا جديدًا:
   *   يصبح جزءًا من قائمة السينما مستقبلًا.
   *
   * لا يتم حذف أي شيء من جدول movies.
   * ==========================================================
   */

  const { data: historicalReports } = await supabase
    .from("boxoffice_reports")
    .select("movie_id,version_id")
    .eq("cinema_id", cinemaId);

  const history = historicalReports || [];

  /*
   * ==========================================================
   * BUILD UNIQUE CINEMA MOVIE TEMPLATE
   * ==========================================================
   */

  const templateMap = new Map();

  for (const report of history) {
    if (!report.movie_id) {
      continue;
    }

    const movieId = Number(report.movie_id);

    const versionId = report.version_id
      ? Number(report.version_id)
      : null;

    const key =
      `${movieId}_${versionId ?? "null"}`;

    if (!templateMap.has(key)) {
      templateMap.set(key, {
        movie_id: movieId,
        version_id: versionId,
      });
    }
  }

  /*
   * ==========================================================
   * MERGE CURRENT REPORTS
   * ==========================================================
   *
   * بيانات اليوم الحالي لها الأولوية.
   *
   * لا ننسخ تذاكر أو إيرادات الأيام السابقة.
   * ==========================================================
   */

  const mergedMap = new Map();

  /*
   * أولًا: القائمة التاريخية
   * مع صفر لليوم الحالي.
   */

  for (const item of templateMap.values()) {
    const key =
      `${item.movie_id}_${item.version_id ?? "null"}`;

    mergedMap.set(key, {
      id: null,

      day_id: Number(id),

      cinema_id: Number(cinemaId),

      movie_id: item.movie_id,

      version_id: item.version_id,

      tickets: 0,

      revenue: 0,

      report_date:
        day?.work_date || null,

      source: "manual",
    });
  }

  /*
   * ثانيًا:
   * بيانات اليوم الحالي تستبدل الصف التاريخي.
   */

  for (const report of todayReports) {
    if (!report.movie_id) {
      continue;
    }

    const key =
      `${Number(report.movie_id)}_${
        report.version_id
          ? Number(report.version_id)
          : "null"
      }`;

    mergedMap.set(key, {
      ...report,

      day_id: Number(id),

      cinema_id: Number(cinemaId),

      movie_id: Number(report.movie_id),

      version_id:
        report.version_id
          ? Number(report.version_id)
          : null,

      tickets: Number(report.tickets || 0),

      revenue: Number(report.revenue || 0),
    });
  }

  /*
   * ==========================================================
   * FINAL REPORT LIST
   * ==========================================================
   */

  const cinemaMovieReports =
    Array.from(mergedMap.values());

  /*
   * ==========================================================
   * CINEMA NAVIGATION
   * ==========================================================
   */

  const cinemaIndex =
    cinemaList.findIndex(
      (item) =>
        String(item.id) === String(cinemaId)
    );

  const previousCinema =
    cinemaIndex > 0
      ? cinemaList[cinemaIndex - 1]
      : null;

  const nextCinema =
    cinemaIndex >= 0 &&
    cinemaIndex < cinemaList.length - 1
      ? cinemaList[cinemaIndex + 1]
      : null;

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <AdminNav />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <Link
          href={`/admin/work-day/${id}`}
          style={navLink}
        >
          ← {t.back}
        </Link>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {previousCinema && (
            <Link
              href={`/admin/work-day/${id}/cinema/${previousCinema.id}`}
              style={mutedNavLink}
            >
              ← {previousCinema.name}
            </Link>
          )}

          {nextCinema && (
            <Link
              href={`/admin/work-day/${id}/cinema/${nextCinema.id}`}
              style={navLink}
            >
              {nextCinema.name} →
            </Link>
          )}
        </div>
      </div>

      <h1 style={{ marginTop: 0 }}>
        🎬 {t.manageCinema}
      </h1>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2>
          📅 {day?.work_date}
        </h2>

        <h3>
          {cinema?.code}
          {" - "}
          {cinema?.name}
        </h3>

        <p
          style={{
            color: "#9ca3af",
            marginTop: "8px",
          }}
        >
          {t.workDay}
        </p>

        <p
          style={{
            color: "#9ca3af",
            marginTop: "6px",
            marginBottom: 0,
          }}
        >
          🎬 أفلام هذه السينما المحفوظة:
          {" "}
          <strong style={{ color: "#fff" }}>
            {cinemaMovieReports.length}
          </strong>
        </p>
      </div>

      <WorkDayForm
        dayId={id}
        cinemaId={cinemaId}

        movies={movieList}

        versions={versionList}

        existingReports={
          cinemaMovieReports
        }

        cinemas={cinemaList}

        currentCinema={
          cinema || null
        }

        t={t}
      />
    </main>
  );
}

const navLink = {
  background: "#2563eb",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 800,
};

const mutedNavLink = {
  ...navLink,
  background: "#374151",
};