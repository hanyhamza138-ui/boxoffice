import { supabase } from "../../../../../../lib/supabase";
import WorkDayForm from "./WorkDayForm";
export const dynamic = "force-dynamic";
export default async function CinemaPage({
  params,
}) {
  const { id, cinemaId } = await params;

  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();

  const { data: cinema } = await supabase
    .from("cinemas")
    .select("*")
    .eq("id", cinemaId)
    .single();

  const { data: movies } = await supabase
    .from("movies")
    .select("id,title,code,poster")
    .eq("is_active", true)
    .order("title");

  const { data: versions } = await supabase
    .from("movie_versions")
    .select("*")
    .order("name");

  const { data: existingReports } = await supabase
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
      <h1>🎬 إدارة السينما</h1>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2>📅 {day?.work_date}</h2>

        <h3>
          {cinema?.code} - {cinema?.name}
        </h3>
      </div>

      <WorkDayForm
        dayId={id}
        cinemaId={cinemaId}
        movies={movies || []}
        versions={versions || []}
        existingReports={existingReports || []}
      />
    </main>
  );
}