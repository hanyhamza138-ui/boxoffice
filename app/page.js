import { supabase } from "../lib/supabase";
import HomeContent from "./components/HomeContent";
import { cookies } from "next/headers";

import ar from "../translations/ar";
import en from "../translations/en";

export default async function HomePage() {
  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  /*
   * ==========================================================
   * 1) آخر يوم عمل مسجل
   * ==========================================================
   *
   * Manual 1 يحفظ البيانات داخل:
   * boxoffice_reports
   *
   * والربط الأساسي مع يوم العمل يكون عن طريق:
   * boxoffice_reports.day_id
   */

  const {
    data: latestDay,
    error: dayError,
  } = await supabase
    .from("boxoffice_days")
    .select("id, work_date, status")
    .order("work_date", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (dayError) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>
          {language === "ar"
            ? "خطأ في تحميل يوم العمل"
            : "Error Loading Work Day"}
        </h1>

        <p>{dayError.message}</p>
      </main>
    );
  }

  /*
   * ==========================================================
   * 2) قراءة بيانات Manual 1
   * ==========================================================
   *
   * لا نقرأ كل الأفلام الموجودة في movies.
   *
   * نقرأ فقط الأفلام التي لها تقارير فعلية في آخر يوم عمل.
   */

  let reports = [];

  if (latestDay?.id) {
    const {
      data,
      error: reportsError,
    } = await supabase
      .from("boxoffice_reports")
      .select(`
        id,
        day_id,
        cinema_id,
        movie_id,
        version_id,
        tickets,
        revenue,
        report_date
      `)
      .eq("day_id", latestDay.id);

    if (reportsError) {
      return (
        <main
          style={{
            background: "#111",
            color: "white",
            minHeight: "100vh",
            padding: 40,
          }}
        >
          <h1>
            {language === "ar"
              ? "خطأ في تحميل بيانات الإيرادات"
              : "Error Loading Box Office Data"}
          </h1>

          <p>{reportsError.message}</p>
        </main>
      );
    }

    reports = data || [];
  }

  /*
   * ==========================================================
   * 3) تجميع التقارير حسب الفيلم
   * ==========================================================
   *
   * نفس الفيلم ممكن يكون له:
   * 2D / 3D / IMAX / VIP ...
   *
   * لذلك نجمع كل النسخ تحت نفس movie_id.
   */

  const movieMap = new Map();

  for (const report of reports) {
    const movieId = Number(report.movie_id);

    if (!movieId) continue;

    if (!movieMap.has(movieId)) {
      movieMap.set(movieId, {
        movie_id: movieId,
        revenue: 0,
        audience: 0,
        tickets: 0,
        cinemaIds: new Set(),
      });
    }

    const item = movieMap.get(movieId);

    item.revenue += Number(report.revenue || 0);

    item.tickets += Number(report.tickets || 0);

    item.audience += Number(report.tickets || 0);

    if (report.cinema_id) {
      item.cinemaIds.add(Number(report.cinema_id));
    }
  }

  /*
   * ==========================================================
   * 4) جلب بيانات الأفلام الموجودة فعلياً في Manual 1 فقط
   * ==========================================================
   */

  const movieIds = Array.from(movieMap.keys());

  let movies = [];

  if (movieIds.length) {
    const {
      data,
      error: moviesError,
    } = await supabase
      .from("movies")
      .select("*")
      .in("id", movieIds);

    if (moviesError) {
      return (
        <main
          style={{
            background: "#111",
            color: "white",
            minHeight: "100vh",
            padding: 40,
          }}
        >
          <h1>
            {language === "ar"
              ? "خطأ في تحميل بيانات الأفلام"
              : "Error Loading Movies"}
          </h1>

          <p>{moviesError.message}</p>
        </main>
      );
    }

    movies = (data || [])
      .map((movie) => {
        const stats = movieMap.get(Number(movie.id));

        if (!stats) return null;

        return {
          ...movie,

          /*
           * الإيراد الحقيقي من Manual 1
           */
          revenue: stats.revenue,

          /*
           * عدد التذاكر الحقيقي من Manual 1
           */
          audience: stats.tickets,

          tickets: stats.tickets,

          /*
           * عدد السينمات التي ظهر فيها الفيلم
           * DISTINCT cinema_id
           */
          cinemas: stats.cinemaIds.size,

          /*
           * مفيد لو احتجناه لاحقاً
           */
          cinemaIds: Array.from(stats.cinemaIds),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(b.revenue || 0) -
          Number(a.revenue || 0)
      );
  }

  /*
   * ==========================================================
   * 5) العدد الحقيقي للسينمات في Manual 1
   * ==========================================================
   *
   * مهم جداً:
   * لا نستخدم movies.cinemas
   * ولا نجمع عدد السينمات لكل فيلم.
   *
   * نحسب DISTINCT cinema_id من boxoffice_reports.
   */

  const uniqueCinemaIds = new Set();

  for (const report of reports) {
    if (report.cinema_id) {
      uniqueCinemaIds.add(Number(report.cinema_id));
    }
  }

  const cinemasCount = uniqueCinemaIds.size;

  /*
   * ==========================================================
   * 6) إجمالي اليوم
   * ==========================================================
   */

  const totalRevenue = reports.reduce(
    (sum, report) =>
      sum + Number(report.revenue || 0),
    0
  );

  const totalAudience = reports.reduce(
    (sum, report) =>
      sum + Number(report.tickets || 0),
    0
  );

  /*
   * ==========================================================
   * 7) إرسال البيانات الحقيقية إلى HomeContent
   * ==========================================================
   */

  return (
    <HomeContent
      movies={movies}
      cinemasCount={cinemasCount}
      totalRevenue={totalRevenue}
      totalAudience={totalAudience}
      reportDate={latestDay?.work_date || null}
      t={t}
    />
  );
}