import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "../../../lib/supabase";
import AdminNav from "../../components/AdminNav";

export const dynamic = "force-dynamic";

export default async function WorkDayPage() {
  // البحث عن يوم العمل المفتوح
  const { data: openDay } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("status", "open")
    .maybeSingle();

  // إذا وجد يوم مفتوح افتحه مباشرة
  if (openDay) {
    redirect(`/admin/work-day/${openDay.id}`);
  }

  async function createWorkDay() {
    "use server";

    const today = new Date().toISOString().split("T")[0];

    // هل يوجد يوم بنفس التاريخ؟
    const { data: existing } = await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("work_date", today)
      .maybeSingle();

    // لو موجود افتحه
    if (existing) {
      if (existing.status !== "open") {
        await supabase
          .from("boxoffice_days")
          .update({ status: "open" })
          .eq("id", existing.id);
      }

      revalidatePath("/admin/work-day");
      redirect(`/admin/work-day/${existing.id}`);
    }

    // إنشاء يوم جديد
    const { data: newDay } = await supabase
      .from("boxoffice_days")
      .insert({
        work_date: today,
        status: "open",
      })
      .select()
      .single();

    revalidatePath("/admin/work-day");

    redirect(`/admin/work-day/${newDay.id}`);
  }

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 30,
      }}
    >
      <h1>📅 يوم العمل</h1>

      <AdminNav />

      <div
        style={{
          marginTop: 30,
          background: "#1c1c1c",
          padding: 25,
          borderRadius: 12,
          maxWidth: 650,
        }}
      >
        <h2>لا يوجد يوم عمل مفتوح</h2>

        <p style={{ color: "#aaa" }}>
          اضغط الزر لبدء يوم عمل جديد.
        </p>

        <form action={createWorkDay}>
          <button
            type="submit"
            style={{
              marginTop: 20,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding: "14px 22px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ فتح يوم عمل جديد
          </button>
        </form>

        <div style={{ marginTop: 20 }}>
          <Link
            href="/admin/dashboard"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
            }}
          >
            ← العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </main>
  );
}