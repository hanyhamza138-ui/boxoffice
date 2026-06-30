import { cookies } from "next/headers";
import { supabase } from "../../../../../../lib/supabase";
import WorkDayForm from "./WorkDayForm";
import ar from "../../../../../../translations/ar";
import en from "../../../../../../translations/en";

export const dynamic = "force-dynamic";

export default async function CinemaPage({
  params,
}) {
  const { id, cinemaId } =
    await params;

  const cookieStore =
    await cookies();

  const language =
    cookieStore.get("language")?.value ||
    "en";

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

  const { data: cinema } =
    await supabase
      .from("cinemas")
      .select("*")
      .eq("id", cinemaId)
      .single();

  const { data: movies } =
    await supabase
      .from("movies")
      .select(
        "id,title,code,poster"
      )
      .eq("is_active", true)
      .order("title");

  const { data: versions } =
    await supabase
      .from("movie_versions")
      .select("*")
      .order("name");

  const { data: existingReports } =
    await supabase
      .from("boxoffice_reports")
      .select("*")
      .eq("day_id", id)
      .eq("cinema_id", cinemaId);

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1>
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
      </div>

      <WorkDayForm
  dayId={id}
  cinemaId={cinemaId}
  movies={movies || []}
  versions={versions || []}
  existingReports={existingReports || []}
  t={t}
/>

    </main>
  );
}