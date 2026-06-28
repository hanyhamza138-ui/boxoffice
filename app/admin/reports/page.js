import Link from "next/link";

export default function ReportsPage() {
  const reports = [
    {
      title: "📅 التقرير اليومي",
      description: "عرض تفاصيل يوم عمل واحد",
      href: "/admin/reports/daily",
      color: "#2563eb",
    },
    {
      title: "📆 التقرير الأسبوعي",
      description: "ملخص أسبوع كامل",
      href: "/admin/reports/weekly",
      color: "#16a34a",
    },
    {
      title: "🗓️ التقرير الشهري",
      description: "ملخص شهر كامل",
      href: "/admin/reports/monthly",
      color: "#ca8a04",
    },
    {
      title: "📈 التقرير السنوي",
      description: "ملخص سنة كاملة",
      href: "/admin/reports/yearly",
      color: "#9333ea",
    },
  ];

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1
        style={{
          marginBottom: "30px",
        }}
      >
        📊 التقارير
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: "20px",
        }}
      >
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            style={{
              textDecoration: "none",
            }}
          >
            <div
              style={{
                background: "#1c1c1c",
                padding: "25px",
                borderRadius: "12px",
                borderTop: `5px solid ${report.color}`,
                transition: ".2s",
                cursor: "pointer",
              }}
            >
              <h2>{report.title}</h2>

              <p
                style={{
                  color: "#bbb",
                }}
              >
                {report.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}