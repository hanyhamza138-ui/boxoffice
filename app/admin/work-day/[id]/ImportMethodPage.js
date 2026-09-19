import { cookies } from "next/headers";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

import AdminNav from "../../../components/AdminNav";
import ImportCenter from "../../../components/ImportCenter";

import ar from "../../../../translations/ar";
import en from "../../../../translations/en";

const methodConfig = {
  excel: {
    title: "Excel Import",
    accept: ".xlsx,.xls",
    description: "Upload the cinema Excel sheet, review the matched rows, then save them to this work day.",
    features: ["Excel .xlsx", "Excel .xls", "Automatic cinema and movie matching"],
  },
  csv: {
    title: "CSV Import",
    accept: ".csv",
    description: "Upload a CSV report with cinema, movie, tickets, and revenue columns.",
    features: ["CSV files", "Fast preview", "Alias fixes before saving"],
  },
  pdf: {
    title: "PDF Import",
    accept: ".pdf",
    description: "Upload a PDF report and let the import engine extract rows for review.",
    features: ["PDF reports", "Table extraction", "Manual review before save"],
  },
  paste: {
    title: "Text / Paste Import",
    accept: ".txt",
    description: "Save pasted report text as a .txt file, then upload it here for parsing.",
    features: ["TXT files", "WhatsApp-style messages", "Quick row detection"],
  },
  api: {
    title: "API / JSON Import",
    accept: ".json,.xml",
    description: "Upload JSON or XML exports from another system and review them before saving.",
    features: ["JSON exports", "XML exports", "Structured report import"],
  },
};

export default async function ImportMethodPage({
  params,
  method = "excel",
}) {
  const { id } = await params;
  const config = methodConfig[method] || methodConfig.excel;

  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = language === "ar" ? ar : en;

  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <main style={pageStyle}>
      <AdminNav />

      <div style={topBarStyle}>
        <Link href={`/admin/work-day/${id}`} style={backLinkStyle}>
          ← {t.back}
        </Link>

        <div style={datePillStyle}>
          📅 {day?.work_date || "-"}
        </div>
      </div>

      <section style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>Work Day Import</p>
          <h1 style={titleStyle}>📥 {config.title}</h1>
          <p style={descriptionStyle}>{config.description}</p>
        </div>

        <div style={featureGridStyle}>
          {config.features.map((feature) => (
            <div key={feature} style={featureStyle}>
              ✅ {feature}
            </div>
          ))}
        </div>
      </section>

      <MethodTabs id={id} active={method} />

      <section style={panelStyle}>
        <ImportCenter
          dayId={id}
          title={config.title}
          description={config.description}
          accept={config.accept}
        />
      </section>
    </main>
  );
}

function MethodTabs({ id, active }) {
  const methods = [
    ["excel", "Excel"],
    ["csv", "CSV"],
    ["pdf", "PDF"],
    ["paste", "Text"],
    ["api", "API"],
  ];

  return (
    <nav style={tabsStyle}>
      {methods.map(([key, label]) => {
        const href =
          key === "excel"
            ? `/admin/work-day/${id}/excel`
            : `/admin/work-day/${id}/${key}`;

        return (
          <Link
            key={key}
            href={href}
            style={{
              ...tabStyle,
              ...(active === key ? activeTabStyle : {}),
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

const pageStyle = {
  background: "#0b0f19",
  color: "#fff",
  minHeight: "100vh",
  padding: 30,
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const backLinkStyle = {
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 800,
};

const datePillStyle = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#d1d5db",
  fontWeight: 700,
};

const heroStyle = {
  marginTop: 22,
  marginBottom: 18,
  padding: 24,
  borderRadius: 8,
  background: "#111827",
  border: "1px solid #263244",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(260px,1fr))",
  gap: 20,
};

const eyebrowStyle = {
  margin: 0,
  color: "#facc15",
  fontWeight: 800,
  textTransform: "uppercase",
  fontSize: 12,
};

const titleStyle = {
  margin: "8px 0 10px",
  fontSize: 34,
  lineHeight: 1.15,
};

const descriptionStyle = {
  color: "#cbd5e1",
  margin: 0,
  lineHeight: 1.7,
};

const featureGridStyle = {
  display: "grid",
  gap: 10,
};

const featureStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: 12,
  color: "#bbf7d0",
  fontWeight: 700,
};

const tabsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 18,
};

const tabStyle = {
  color: "#d1d5db",
  textDecoration: "none",
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 800,
};

const activeTabStyle = {
  color: "#111827",
  background: "#facc15",
  borderColor: "#facc15",
};

const panelStyle = {
  background: "#111827",
  border: "1px solid #263244",
  borderRadius: 8,
  padding: 20,
};
