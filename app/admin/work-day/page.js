import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function WorkDayPage() {

  const { data: openDay } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("status", "open")
    .maybeSingle();

  async function createWorkDay() {
    "use server";

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const { data: existing } = await supabase
      .from("boxoffice_days")
      .select("id")
      .eq("work_date", today)
      .maybeSingle();

    if (existing) return;

    await supabase
      .from("boxoffice_days")
      .insert({
        work_date: today,
        status: "open"
      });
  }

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1>📅 يوم العمل</h1>

      {!openDay && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#1c1c1c",
            borderRadius: "10px",
          }}
        >
          <h2>لا يوجد يوم عمل مفتوح</h2>

          <form action={createWorkDay}>
            <button
              type="submit"
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ➕ فتح يوم عمل جديد
            </button>
          </form>
        </div>
      )}

      {openDay && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#1c1c1c",
            borderRadius: "10px",
          }}
        >
          <h2>🟢 يوجد يوم عمل مفتوح</h2>

          <p>
            <strong>التاريخ:</strong>{" "}
            {openDay.work_date}
          </p>

          <p>
            <strong>الحالة:</strong>{" "}
            {openDay.status}
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <Link
              href={`/admin/work-day/${openDay.id}`}
            >
              <button
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                🎬 إدارة اليوم
              </button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}