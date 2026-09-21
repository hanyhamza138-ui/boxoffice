import { redirect } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
export const dynamic = "force-dynamic";

export default async function ManualPage({ params }) {
  const { id } = await params;

  const { data: cinema, error } = await supabase
    .from("cinemas")
    .select("id")
    .order("name")
    .limit(1)
    .single();

  if (error || !cinema) {
    return (
      <main
        style={{
          background: "#111",
          color: "#fff",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "30px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>لا توجد سينمات.</h2>

          {error && (
            <p style={{ color: "#ef4444", marginTop: "10px" }}>
              {error.message}
            </p>
          )}
        </div>
      </main>
    );
  }

  redirect(`/admin/work-day/${id}/cinema/${cinema.id}`);
}

