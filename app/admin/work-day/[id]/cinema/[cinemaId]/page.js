
import { cookies } from "next/headers";
import Link from "next/link";
import { supabase } from "../../../../../../lib/supabase";
import WorkDayForm from "./WorkDayForm";
import AdminNav from "../../../../../components/AdminNav";
import ar from "../../../../../../translations/ar";
import en from "../../../../../../translations/en";

export const dynamic = "force-dynamic";

export default async function CinemaPage({
  params,
}) {
  const { id, cinemaId } = await params;

  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  /* ==========================================================
     WORK DAY
  ========================================================== */

  const { data: day } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("id", id)
      .single();

  /* ==========================================================
     CURRENT CINEMA
  ========================================================== */

  const { data: cinema } =
    await supabase
      .from("cinemas")
      .select("*")
      .eq("id", cinemaId)
      .single();

  /* ==========================================================
     ALL CINEMAS
     تستخدم للبحث والاختيار
  ========================================================== */

  const { data: cinemas } =
    await supabase
      .from("cinemas")
      .select(
        "id,code,name"
      )
      .order("name");

  const cinemaList =
    cinemas || [];

  /* ==========================================================
     MOVIES
  ========================================================== */

  const { data: movies } =
    await supabase
      .from("movies")
      .select(
        "id,title,code,poster"
      )
      .eq(
        "is_active",
        true
      )
      .order("title");

  /* ==========================================================
     MOVIE VERSIONS

     Arabic
     English Movie
     2D
     3D
     IMAX
  ========================================================== */

  const { data: versions } =
    await supabase
      .from("movie_versions")
      .select("*")
      .order("name");

  /* ==========================================================
     EXISTING REPORTS

     البيانات المحفوظة بالفعل في قاعدة البيانات
     ستظهر مرة أخرى عند فتح نفس السينما.
  ========================================================== */

  const { data: existingReports } =
    await supabase
      .from("boxoffice_reports")
      .select("*")
      .eq(
        "day_id",
        id
      )
      .eq(
        "cinema_id",
        cinemaId
      );

  /* ==========================================================
     CINEMA NAVIGATION
  ========================================================== */

  const cinemaIndex =
    cinemaList.findIndex(
      (item) =>
        String(item.id) ===
        String(cinemaId)
    );

  const previousCinema =
    cinemaIndex > 0
      ? cinemaList[
          cinemaIndex - 1
        ]
      : null;

  const nextCinema =
    cinemaIndex >= 0 &&
    cinemaIndex <
      cinemaList.length - 1
      ? cinemaList[
          cinemaIndex + 1
        ]
      : null;

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

      {/* ======================================================
          TOP NAVIGATION
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
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
              ←{" "}
              {previousCinema.name}
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

      {/* ======================================================
          PAGE TITLE
      ====================================================== */}

      <h1
        style={{
          marginTop: 0,
        }}
      >
        🎬 {t.manageCinema}
      </h1>

      {/* ======================================================
          CINEMA INFORMATION
      ====================================================== */}

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
      </div>

      {/* ======================================================
          MANUAL ENTRY FORM

          نمرر قائمة السينمات حتى يستطيع المستخدم البحث
          والانتقال إلى أي سينما مباشرة.
      ====================================================== */}

      <WorkDayForm
        dayId={id}
        cinemaId={cinemaId}
        movies={movies || []}
        versions={versions || []}
        existingReports={
          existingReports || []
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

