import { redirect } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function ManualPage({
  params,
}) {
  const { id } = await params;

  // أول سينما
  const { data: cinema } = await supabase
    .from("cinemas")
    .select("id")
    .order("name")
    .limit(1)
    .single();

  if (!cinema) {
    return (
      <main
        style={{
          background: "#111",
          color: "#fff",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <h2>لا توجد سينمات.</h2>
      </main>
    );
  }

  redirect(
    `/admin/work-day/${id}/cinema/${cinema.id}`
  );
}