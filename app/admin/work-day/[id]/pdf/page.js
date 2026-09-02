import { cookies } from "next/headers";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";

import AdminNav from "../../../../components/AdminNav";
import ImportCenter from "../../../../components/ImportCenter";

import ar from "../../../../../translations/ar";
import en from "../../../../../translations/en";

export const dynamic = "force-dynamic";

export default async function WorkDayPdfPage({
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

  const { data: day, error } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("id", id)
      .single();

  return (
    <main
      style={{
        background:
          "linear-gradient(135deg,#020617,#0f172a,#111827)",
        color: "#fff",
        minHeight: "100vh",
        padding: 30,
      }}
    >
      <AdminNav />

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <Link
          href={`/admin/work-day/${id}`}
          style={{
            display: "inline-block",
            marginBottom: 20,
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← {t.back || "Back"}
        </Link>

        <div
          style={{
            background:
              "linear-gradient(135deg,#111827,#1e293b)",
            border:
              "1px solid #334155",
            borderRadius: 20,
            padding: 28,
            boxShadow:
              "0 10px 35px rgba(0,0,0,.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: 800,
                }}
              >
                📄 PDF Smart Import
              </h1>

              <p
                style={{
                  color: "#94a3b8",
                  marginTop: 10,
                  marginBottom: 0,
                  fontSize: 16,
                }}
              >
                قراءة تقارير السينمات من ملفات PDF
                وتحويلها إلى بيانات BoxOffice
              </p>
            </div>

            <div
              style={{
                background: "#020617",
                border:
                  "1px solid #334155",
                borderRadius: 14,
                padding:
                  "12px 18px",
                minWidth: 180,
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  marginBottom: 5,
                }}
              >
                📅 Work Day
              </div>

              <strong
                style={{
                  fontSize: 20,
                  color: "#facc15",
                }}
              >
                {day?.work_date || id}
              </strong>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 12,
                background: "#450a0a",
                border:
                  "1px solid #991b1b",
                color: "#fca5a5",
              }}
            >
              ⚠️ تعذر تحميل بيانات يوم العمل.
            </div>
          )}

          <div
            style={{
              marginTop: 25,
              padding: 20,
              borderRadius: 16,
              background: "#0f172a",
              border:
                "1px solid #334155",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 12,
                fontSize: 22,
              }}
            >
              📥 Smart Import Center
            </h2>

            <p
              style={{
                color: "#94a3b8",
                lineHeight: 1.8,
                marginTop: 0,
              }}
            >
              ارفع ملف PDF الخاص بالتقرير.
              النظام سيحاول استخراج أسماء السينمات
              والأفلام والتذاكر والصافي تلقائيًا.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: 12,
                marginTop: 20,
                marginBottom: 25,
              }}
            >
              <div
                style={featureStyle}
              >
                📄
                <span>
                  PDF نصي
                </span>
              </div>

              <div
                style={featureStyle}
              >
                🏢
                <span>
                  اكتشاف السينما
                </span>
              </div>

              <div
                style={featureStyle}
              >
                🎬
                <span>
                  مطابقة الأفلام
                </span>
              </div>

              <div
                style={featureStyle}
              >
                🎟️
                <span>
                  التذاكر
                </span>
              </div>

              <div
                style={featureStyle}
              >
                💰
                <span>
                  صافي الإيراد
                </span>
              </div>
            </div>

            <ImportCenter dayId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}

const featureStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 14,
  borderRadius: 12,
  background: "#111827",
  border: "1px solid #334155",
  color: "#e2e8f0",
  fontWeight: 700,
};