import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function DailyReportsPage() {

  const { data: workDays } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .order("work_date", {
        ascending: false,
      });

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
        📅 التقارير اليومية
      </h1>

      <div
        style={{
          marginTop: "25px",
          background: "#1c1c1c",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#222",
              }}
            >
              <th style={th}>
                التاريخ
              </th>

              <th style={th}>
                الحالة
              </th>

              <th style={th}>
                التقرير
              </th>
            </tr>
          </thead>

          <tbody>
            {workDays?.map((day) => (
              <tr
                key={day.id}
                style={{
                  borderBottom:
                    "1px solid #333",
                }}
              >
                <td style={td}>
                  {day.work_date}
                </td>

                <td style={td}>
                  {day.status === "open"
                    ? "🟢 مفتوح"
                    : "🔴 مغلق"}
                </td>

                <td style={td}>
                  <Link
                    href={`/admin/reports/daily/${day.id}`}
                  >
                    <button
                      style={{
                        background:
                          "#2563eb",
                        color:
                          "white",
                        border:
                          "none",
                        padding:
                          "8px 14px",
                        borderRadius:
                          "8px",
                        cursor:
                          "pointer",
                      }}
                    >
                      👁️ عرض التقرير
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const th = {
  padding: "15px",
  textAlign: "left",
};

const td = {
  padding: "15px",
};