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
  t = {},
}) {
  const { isArabic } = useLanguage();
  const [filter, setFilter] = useState("all");

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

  const totalRevenue = movies.reduce(
    (sum, movie) =>
      sum + (Number(movie.revenue) || 0),
    0
  );

  const totalAudience = movies.reduce(
    (sum, movie) =>
      sum + (Number(movie.audience) || 0),
    0
  );

  const today = new Date().toLocaleDateString(
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
          value={totalRevenue.toLocaleString()}
          color="#22c55e"
        />

        <StatCard
          icon="👥"
          title={
            isArabic
              ? "إجمالي الجمهور"
              : "Total Audience"
          }
          value={totalAudience.toLocaleString()}
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
        {(Number(value) || 0).toLocaleString()}
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
        {(Number(value) || 0).toLocaleString()}
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