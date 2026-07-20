import { cookies } from "next/headers";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";

import AdminNav from "../../../../components/AdminNav";
import ImportCenter from "../../../../components/ImportCenter";

import ar from "../../../../../translations/ar";
import en from "../../../../../translations/en";

export const dynamic = "force-dynamic";

export default async function ImportPage({
  params,
}) {
  const { id } = await params;

  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

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

  return (
    <main
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: 30,
      }}
    >
      <AdminNav />

      <Link
        href={`/admin/work-day/${id}`}
        style={{
          color: "#60a5fa",
          textDecoration: "none",
        }}
      >
        ← {t.back}
      </Link>

      <h1
        style={{
          marginTop: 20,
          fontSize: 36,
        }}
      >
        📥 Smart Import Center
      </h1>

      <div
        style={{
          background: "#1c1c1c",
          borderRadius: 14,
          padding: 25,
          marginTop: 25,
        }}
      >
        <h2>📅 {day?.work_date}</h2>

        <p
          style={{
            color: "#9ca3af",
            marginBottom: 20,
          }}
        >
          يدعم جميع أنواع الملفات الخاصة بالسينمات
        </p>

        <ul
          style={{
            color: "#4ade80",
            lineHeight: 2,
            marginBottom: 25,
          }}
        >
          <li>✅ Excel (.xlsx / .xls)</li>
          <li>✅ CSV</li>
          <li>✅ PDF</li>
          <li>✅ Images (PNG / JPG)</li>
          <li>✅ TXT</li>
          <li>✅ WhatsApp Messages</li>
        </ul>

        <ImportCenter dayId={id} />
      </div>
    </main>
  );
}