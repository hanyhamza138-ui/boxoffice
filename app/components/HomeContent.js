"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const fallback = {
  adminPanel: { ar: "لوحة التحكم", en: "Admin Panel" },
  all: { ar: "الكل", en: "All" },
  arabic: { ar: "عربي", en: "Arabic" },
  audience: { ar: "الجمهور", en: "Audience" },
  cinemas: { ar: "السينمات", en: "Cinemas" },
  details: { ar: "التفاصيل", en: "Details" },
  foreign: { ar: "أجنبي", en: "Foreign" },
  movies: { ar: "أفلام", en: "Movies" },
  noMovies: { ar: "لا توجد أفلام للعرض", en: "No movies to show" },
  revenue: { ar: "الإيراد", en: "Revenue" },
  topMovie: { ar: "الفيلم الأول", en: "Top Movie" },
};

const emoji = {
  audience: "👥",
  cinemas: "🎬",
  details: "🎬",
  movie: "🎬",
  revenue: "💰",
};

export default function HomeContent({
  movies = [],
  cinemasCount = 0,
  totalRevenue = null,
  totalAudience = null,
  reportDate = null,
  comparison = {},
  t = {},
}) {
  const { isArabic } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [reportType, setReportType] = useState("all");
  const [showReport, setShowReport] = useState(false);

  const font = isArabic
    ? "Cairo, Arial, sans-serif"
    : "Poppins, Arial, sans-serif";

  const text = (key, translationKey = key) =>
    t[translationKey] ||
    fallback[key]?.[isArabic ? "ar" : "en"] ||
    key;

  const allCount = movies.length;

  const arCount = movies.filter(
    (movie) => movie.language === "ar"
  ).length;

  const enCount = movies.filter(
    (movie) => movie.language === "en"
  ).length;

  const filteredMovies = useMemo(() => {
    const data =
      filter === "all"
        ? [...movies]
        : movies.filter(
            (movie) => movie.language === filter
          );

    return data.sort(
      (a, b) =>
        (Number(b.revenue) || 0) -
        (Number(a.revenue) || 0)
    );
  }, [movies, filter]);

  const topMovie = filteredMovies[0];

  const calculatedTotalRevenue = movies.reduce(
    (sum, movie) =>
      sum + (Number(movie.revenue) || 0),
    0
  );

  const displayTotalRevenue =
    Number.isFinite(Number(totalRevenue))
      ? Number(totalRevenue)
      : calculatedTotalRevenue;

  const calculatedTotalAudience = movies.reduce(
    (sum, movie) =>
      sum + (Number(movie.audience) || 0),
    0
  );

  const displayTotalAudience =
    Number.isFinite(Number(totalAudience))
      ? Number(totalAudience)
      : calculatedTotalAudience;

  const today = (reportDate ? new Date(`${reportDate}T00:00:00`) : new Date()).toLocaleDateString(
    isArabic ? "ar-EG" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const filters = [
    {
      count: allCount,
      label: text("all"),
      value: "all",
    },
    {
      count: arCount,
      label: text("arabic"),
      value: "ar",
    },
    {
      count: enCount,
      label: text("foreign"),
      value: "en",
    },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#050505,#101010,#0b0b0b)",
        color: "#fff",
        padding: 10,
        fontFamily: font,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        style={{
          marginBottom: 14,
          padding: "12px 14px",
          borderRadius: 16,
          background:
            "linear-gradient(135deg,#0b1220,#1e293b,#111827)",
          border: "1px solid #334155",
          overflow: "hidden",
          boxShadow:
            "0 8px 18px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              color: "#FFD54A",
              fontSize:
                "clamp(26px,4vw,46px)",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            BoxOffice Egypt
          </div>

          <div
            style={{
              color: "#CBD5E1",
              fontSize: 13,
              marginTop: 7,
            }}
          >
            {isArabic
              ? "متابعة الإيرادات والجمهور للسينمات"
              : "Cinema revenue and audience dashboard"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              color: "#E5E7EB",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            📅 {today}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <LanguageSwitcher />

            <Link
              href="/admin"
              style={{
                background:
                  "linear-gradient(135deg,#FFD54A,#EAB308)",
                color: "#111",
                padding: "8px 13px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxShadow:
                  "0 6px 18px rgba(255,215,0,.2)",
              }}
            >
              ⚙️ {text("adminPanel")}
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          GLOBAL STATS
      ================================================= */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(170px,1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <StatCard
          icon="💰"
          title={
            isArabic
              ? "إجمالي الإيرادات"
              : "Total Revenue"
          }
          value={formatMoney(displayTotalRevenue)}
          color="#22c55e"
        />

        <StatCard
          icon="👥"
          title={
            isArabic
              ? "إجمالي الجمهور"
              : "Total Audience"
          }
          value={formatNumber(displayTotalAudience)}
          color="#3b82f6"
        />

        <StatCard
          icon="🎬"
          title={isArabic ? "عدد الأفلام" : "Movies"}
          value={movies.length}
          color="#f59e0b"
        />

        <StatCard
          icon="🏢"
          title={
            isArabic ? "عدد السينمات" : "Cinemas"
          }
          value={cinemasCount.toLocaleString()}
          color="#ef4444"
        />

        <StatCard
          icon="📅"
          title={
            isArabic
              ? "آخر تحديث"
              : "Last Updated"
          }
          value={today}
          color="#a855f7"
        />
      </section>

      {/* =================================================
          TOP MOVIE
      ================================================= */}

      {topMovie ? (
        <section
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 16,
            background:
              "linear-gradient(135deg,#0b1220,#1e293b,#111827)",
            border: "1px solid #334155",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              flex: "1 1 280px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: "#FFD54A",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 7,
              }}
            >
              #1 {text("topMovie")}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize:
                  "clamp(18px,4vw,26px)",
                fontWeight: 700,
              }}
            >
              {topMovie.title}
            </h2>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <Metric
                color="#4ade80"
                icon={emoji.revenue}
                label={text("revenue")}
                value={topMovie.revenue}
              />

              <Metric
                icon={emoji.audience}
                label={text("audience")}
                value={topMovie.audience}
              />

              <Metric
                icon={emoji.cinemas}
                label={text("cinemas")}
                value={topMovie.cinemas}
              />
            </div>
          </div>

          {/* UNIFORM TOP POSTER */}

          <div
            style={{
              width: 120,
              aspectRatio: "2 / 3",
              flexShrink: 0,
              borderRadius: 12,
              overflow: "hidden",
              background: "#050505",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 12px 25px rgba(0,0,0,.45)",
            }}
          >
            <img
              src={
                topMovie.poster ||
                "https://placehold.co/300x450"
              }
              alt={
                topMovie.title ||
                "Top movie poster"
              }
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </section>
      ) : (
        <section
          style={{
            marginBottom: 18,
            padding: 24,
            borderRadius: 16,
            background: "#111827",
            border: "1px solid #334155",
            color: "#cbd5e1",
            fontWeight: 800,
          }}
        >
          {text("noMovies")}
        </section>
      )}

      {/* =================================================
          FILTERS
      ================================================= */}

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        {filters.map((item) => {
          const active =
            filter === item.value;

          return (
            <button
              key={item.value}
              onClick={() =>
                setFilter(item.value)
              }
              type="button"
              style={{
                border: active
                  ? "1px solid #FFD54A"
                  : "1px solid #2f2f2f",
                background: active
                  ? "#FFD54A"
                  : "#181818",
                color: active
                  ? "#111"
                  : "#fff",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 13,
                padding: "8px 12px",
              }}
            >
              {item.label} ({item.count})
            </button>
          );
        })}
      </div>

      {/* =================================================
          ONE-PAGE PDF REPORT
      ================================================= */}

      <section
        style={{
          marginBottom: 18,
          padding: 14,
          borderRadius: 16,
          background: "linear-gradient(135deg,#111827,#171717)",
          border: "1px solid #334155",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>
          {isArabic ? "تقرير PDF صفحة واحدة" : "One-Page PDF Report"}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 10 }}>
          {isArabic
            ? "اختر نوع الأفلام ثم اطبع التقرير واحفظه PDF — صفحة A4 واحدة."
            : "Choose the film group, then print/save as PDF — one A4 page."}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { value: "ar", label: isArabic ? "🇪🇬 عربي" : "🇪🇬 Arabic" },
            { value: "en", label: isArabic ? "🌍 أجنبي" : "🌍 Foreign" },
            { value: "all", label: isArabic ? "🎬 الكل" : "🎬 All" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => { setReportType(item.value); setShowReport(true); }}
              style={{
                border: "1px solid #475569",
                background: "#0f172a",
                color: "#fff",
                borderRadius: 10,
                padding: "9px 13px",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {showReport && (
        <MovieReport
          movies={movies}
          reportType={reportType}
          isArabic={isArabic}
          reportDate={reportDate}
          cinemasCount={cinemasCount}
          totalRevenue={displayTotalRevenue}
          totalAudience={displayTotalAudience}
          comparison={comparison}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* =================================================
          MOVIE GRID
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(190px,1fr))",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        {filteredMovies.map(
          (movie, index) => {
            const rank = index + 1;

            const badgeColor =
              index === 0
                ? "#FFD54A"
                : index === 1
                  ? "#cbd5e1"
                  : index === 2
                    ? "#f97316"
                    : "#334155";

            return (
              <article
                key={movie.id}
                style={{
                  background:
                    "linear-gradient(135deg,#151515,#1f1f1f)",
                  border:
                    index < 3
                      ? `1px solid ${badgeColor}`
                      : "1px solid #333",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow:
                    "0 8px 20px rgba(0,0,0,.38)",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                {/* ======================================
                    POSTER
                ====================================== */}

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "2 / 3",
                    background: "#050505",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={
                      movie.poster ||
                      "https://placehold.co/300x450"
                    }
                    alt={
                      movie.title ||
                      "Movie poster"
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />

                  {/* RANK */}

                  <div
                    style={{
                      position: "absolute",
                      top: 7,
                      left: isArabic
                        ? "auto"
                        : 7,
                      right: isArabic
                        ? 7
                        : "auto",
                      width: 25,
                      height: 25,
                      borderRadius: "50%",
                      background: badgeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      color:
                        index < 3
                          ? "#000"
                          : "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      boxShadow:
                        "0 3px 8px rgba(0,0,0,.35)",
                    }}
                  >
                    {rank}
                  </div>

                  {/* LANGUAGE */}

                  <div
                    style={{
                      position: "absolute",
                      bottom: 7,
                      left: isArabic
                        ? "auto"
                        : 7,
                      right: isArabic
                        ? 7
                        : "auto",
                      background:
                        movie.language === "ar"
                          ? "#16a34a"
                          : "#dc2626",
                      padding: "3px 8px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {movie.language === "ar"
                      ? text("arabic")
                      : text("foreign")}
                  </div>
                </div>

                {/* ======================================
                    CARD CONTENT
                ====================================== */}

                <div
                  style={{
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      textAlign: "center",
                      fontSize: 14,
                      lineHeight: 1.35,
                      minHeight: 38,
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      fontWeight: 800,
                      overflow: "hidden",
                    }}
                  >
                    {movie.title}
                  </h3>

                  {/* REVENUE */}

                  <div
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <SmallMetric
                      color="#4ade80"
                      icon={emoji.revenue}
                      label={text("revenue")}
                      value={movie.revenue}
                    />
                  </div>

                  {/* AUDIENCE + CINEMAS */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: 7,
                      marginTop: 7,
                    }}
                  >
                    <SmallMetric
                      centered
                      icon={emoji.audience}
                      label={text("audience")}
                      value={movie.audience}
                    />

                    <SmallMetric
                      centered
                      icon={emoji.cinemas}
                      label={text("cinemas")}
                      value={movie.cinemas}
                    />
                  </div>

                  {/* DETAILS */}

                  <Link
                    href={`/movie/${movie.id}`}
                    style={{
                      width: "100%",
                      marginTop: 8,
                      padding: "8px 6px",
                      borderRadius: 9,
                      background: "#2563eb",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: 12,
                      textDecoration:
                        "none",
                      textAlign: "center",
                      display: "block",
                      boxSizing: "border-box",
                    }}
                  >
                    {emoji.details}{" "}
                    {text("details")}
                  </Link>
                </div>
              </article>
            );
          }
        )}
      </div>
    </main>
  );
}

/* =========================================================
   ONE-PAGE REPORT
========================================================= */

function MovieReport({
  movies = [],
  reportType = "all",
  isArabic = false,
  reportDate = null,
  cinemasCount = 0,
  totalRevenue = 0,
  totalAudience = 0,
  comparison = {},
  onClose,
}) {
  const reportMovies = movies
    .filter((movie) =>
      reportType === "all" || movie.language === reportType
    )
    .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));

  const reportRevenue = reportMovies.reduce((s, m) => s + Number(m.revenue || 0), 0);
  const reportAudience = reportMovies.reduce((s, m) => s + Number(m.audience || 0), 0);

  const title =
    reportType === "ar"
      ? (isArabic ? "تقرير الأفلام العربية" : "Arabic Movies Report")
      : reportType === "en"
        ? (isArabic ? "تقرير الأفلام الأجنبية" : "Foreign Movies Report")
        : (isArabic ? "تقرير شباك التذاكر" : "Box Office Report");

  const dayChange = Number(comparison.dayChange || 0);
  const weekChange = Number(comparison.weekChange || 0);

  return (
    <div className="bo-report-overlay">
      <div className="bo-report-toolbar">
        <button type="button" onClick={onClose}>✕ {isArabic ? "إغلاق" : "Close"}</button>
        <button type="button" onClick={() => window.print()}>🖨️ {isArabic ? "طباعة / حفظ PDF" : "Print / Save PDF"}</button>
      </div>

      <div className="bo-report-page" dir={isArabic ? "rtl" : "ltr"}>
        <div className="bo-report-head">
          <div>
            <div className="bo-report-brand">BoxOffice Egypt</div>
            <div className="bo-report-title">{title}</div>
            <div className="bo-report-date">
              {reportDate || new Date().toISOString().slice(0, 10)}
            </div>
          </div>
          <div className="bo-report-summary">
            <div><b>{formatMoney(reportRevenue)}</b><span>{isArabic ? "إيراد التقرير" : "Report Revenue"}</span></div>
            <div><b>{formatNumber(reportAudience)}</b><span>{isArabic ? "التذاكر" : "Tickets"}</span></div>
            <div><b>{formatNumber(cinemasCount)}</b><span>{isArabic ? "السينمات" : "Cinemas"}</span></div>
          </div>
        </div>

        <div className="bo-report-comparison">
          <div><span>{isArabic ? "اليوم" : "Today"}</span><b>{formatMoney(Number(comparison.todayRevenue ?? totalRevenue))}</b></div>
          <div><span>{isArabic ? "أمس" : "Yesterday"}</span><b>{formatMoney(Number(comparison.yesterdayRevenue || 0))}</b></div>
          <div><span>{isArabic ? "الأسبوع الحالي" : "This Week"}</span><b>{formatMoney(Number(comparison.currentWeekRevenue || totalRevenue))}</b></div>
          <div><span>{isArabic ? "الأسبوع السابق" : "Previous Week"}</span><b>{formatMoney(Number(comparison.previousWeekRevenue || 0))}</b></div>
          <div><span>{isArabic ? "فرق اليوم" : "Day Change"}</span><b className={dayChange >= 0 ? "bo-up" : "bo-down"}>{formatPercent(dayChange)}</b></div>
          <div><span>{isArabic ? "فرق الأسبوع" : "Week Change"}</span><b className={weekChange >= 0 ? "bo-up" : "bo-down"}>{formatPercent(weekChange)}</b></div>
        </div>

        <div
          className="bo-report-grid"
          style={{
            gridTemplateColumns:
              reportMovies.length <= 8
                ? "repeat(8, 1fr)"
                : reportMovies.length <= 16
                  ? "repeat(8, 1fr)"
                  : reportMovies.length <= 24
                    ? "repeat(10, 1fr)"
                    : "repeat(12, 1fr)",
          }}
        >
          {reportMovies.map((movie, index) => (
            <div className="bo-report-movie" key={movie.id}>
              <div
                className="bo-report-poster"
                style={{
                  height:
                    reportMovies.length <= 8
                      ? "48mm"
                      : reportMovies.length <= 16
                        ? "40mm"
                        : reportMovies.length <= 24
                          ? "32mm"
                          : "27mm",
                }}
              >
                <img src={movie.poster || "https://placehold.co/180x270"} alt={movie.title || "Movie"} />
              </div>
              <div className="bo-report-rank">#{index + 1}</div>
              <div className="bo-report-movie-name">{movie.title}</div>
              <div className="bo-report-value">{formatMoney(movie.revenue)}</div>
              <div className="bo-report-small">👥 {formatNumber(movie.audience)} &nbsp; 🎬 {formatNumber(movie.cinemas)}</div>
            </div>
          ))}
        </div>

        <div className="bo-report-footer">
          <span>{isArabic ? "إجمالي كل الأفلام" : "All Movies Total"}: <b>{formatMoney(totalRevenue)}</b></span>
          <span>{isArabic ? "إجمالي الجمهور" : "Total Audience"}: <b>{formatNumber(totalAudience)}</b></span>
        </div>
      </div>

      <style jsx>{`
        .bo-report-overlay { position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,.92); overflow: auto; padding: 16px; }
        .bo-report-toolbar { display:flex; justify-content:center; gap:8px; margin:0 auto 10px; }
        .bo-report-toolbar button { border:1px solid #475569; background:#111827; color:#fff; border-radius:9px; padding:8px 12px; cursor:pointer; font-weight:800; }
        .bo-report-page { width:297mm; height:210mm; max-width:100%; margin:auto; box-sizing:border-box; background:#fff; color:#111; padding:7mm; overflow:hidden; font-family:Arial,sans-serif; }
        .bo-report-head { display:flex; justify-content:space-between; gap:8mm; border-bottom:2px solid #111; padding-bottom:4mm; }
        .bo-report-brand { font-size:22px; font-weight:900; }
        .bo-report-title { font-size:16px; font-weight:800; margin-top:2px; }
        .bo-report-date { font-size:10px; color:#555; margin-top:2px; }
        .bo-report-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:3mm; min-width:95mm; }
        .bo-report-summary div, .bo-report-comparison div { border:1px solid #bbb; border-radius:5px; padding:2.5mm; text-align:center; }
        .bo-report-summary b { display:block; font-size:14px; }
        .bo-report-summary span, .bo-report-comparison span { display:block; font-size:8px; color:#555; margin-top:1px; }
        .bo-report-comparison { display:grid; grid-template-columns:repeat(6,1fr); gap:2mm; margin:3mm 0; }
        .bo-report-comparison b { display:block; font-size:10px; margin-top:2px; }
        .bo-up { color:#15803d; } .bo-down { color:#b91c1c; }
        .bo-report-grid { display:grid; gap:2.5mm; align-items:start; }
        .bo-report-movie { position:relative; min-width:0; text-align:center; }
        .bo-report-poster { width:100%; height:46mm; background:#eee; border-radius:4px; overflow:hidden; }
        .bo-report-poster img { width:100%; height:100%; object-fit:cover; display:block; }
        .bo-report-rank { font-size:8px; color:#777; margin-top:1px; }
        .bo-report-movie-name { font-size:8.5px; font-weight:800; line-height:1.15; height:20px; overflow:hidden; margin-top:1px; }
        .bo-report-value { font-size:9px; font-weight:900; margin-top:2px; }
        .bo-report-small { font-size:7px; color:#555; margin-top:1px; white-space:nowrap; }
        .bo-report-footer { display:flex; justify-content:space-between; border-top:1px solid #999; margin-top:3mm; padding-top:2mm; font-size:9px; }
        @media print { @page { size:A4 landscape; margin:0; } body * { visibility:hidden !important; } .bo-report-overlay, .bo-report-overlay * { visibility:visible !important; } .bo-report-overlay { position:absolute !important; inset:0 !important; padding:0 !important; background:#fff !important; overflow:hidden !important; } .bo-report-toolbar { display:none !important; } .bo-report-page { width:297mm !important; height:210mm !important; max-width:none !important; margin:0 !important; box-shadow:none !important; } }
      `}</style>
    </div>
  );
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
  return rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00%";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

/* =========================================================
   TOP METRIC
========================================================= */

function Metric({
  color = "#fff",
  icon,
  label,
  value,
}) {
  return (
    <div>
      <div
        style={{
          color: "#94a3b8",
          fontSize: 12,
        }}
      >
        {icon} {label}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color,
          lineHeight: 1.1,
          marginTop: 3,
        }}
      >
        {formatNumber(value)}
      </div>
    </div>
  );
}

/* =========================================================
   MOVIE SMALL METRIC
========================================================= */

function SmallMetric({
  centered = false,
  color = "#fff",
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#202020,#181818)",
        borderRadius: 9,
        padding: centered
          ? "7px 5px"
          : "8px 9px",
        textAlign: centered
          ? "center"
          : "start",
        border:
          "1px solid #292929",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#9ca3af",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {icon} {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontWeight: 900,
          fontSize: centered
            ? 14
            : 19,
          color,
          lineHeight: 1.1,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {formatNumber(value)}
      </div>
    </div>
  );
}

/* =========================================================
   GLOBAL STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#171717,#222)",
        border: "1px solid #333",
        borderRadius: 14,
        padding: 14,
        boxShadow:
          "0 8px 22px rgba(0,0,0,.3)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 23,
          marginBottom: 7,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#9CA3AF",
          fontSize: 12,
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 23,
          fontWeight: 900,
          color,
          lineHeight: 1.15,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
} 