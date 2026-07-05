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
  audience: "\uD83D\uDC65",
  cinemas: "\uD83C\uDFAC",
  details: "\uD83C\uDFAC",
  movie: "\uD83C\uDFAC",
  revenue: "\uD83D\uDCB0",
  settings: "\u2699\uFE0F",
};

export default function HomeContent({ movies = [], t = {} }) {
  const { isArabic } = useLanguage();
  const [filter, setFilter] = useState("all");

  const font = isArabic
    ? "Cairo, Arial, sans-serif"
    : "Poppins, Arial, sans-serif";

  const text = (key, translationKey = key) =>
    t[translationKey] || fallback[key]?.[isArabic ? "ar" : "en"] || key;

  const allCount = movies.length;
  const arCount = movies.filter((movie) => movie.language === "ar").length;
  const enCount = movies.filter((movie) => movie.language === "en").length;

  const filteredMovies = useMemo(() => {
    const data =
      filter === "all"
        ? [...movies]
        : movies.filter((movie) => movie.language === filter);

    return data.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  }, [movies, filter]);

  const topMovie = filteredMovies[0];

  const filters = [
    { count: allCount, label: text("all"), value: "all" },
    { count: arCount, label: text("arabic"), value: "ar" },
    { count: enCount, label: text("foreign"), value: "en" },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#050505,#101010,#0b0b0b)",
        color: "#fff",
        padding: 24,
        fontFamily: font,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 35,
          padding: "26px 30px",
          borderRadius: 24,
          background: "linear-gradient(135deg,#161616,#0b0b0b)",
          border: "1px solid #2b2b2b",
          boxShadow: "0 20px 50px rgba(0,0,0,.45)",
        }}
      >
        <div>
          <div
            style={{
              color: "#FFD54A",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            BOX OFFICE EGYPT
          </div>

          <h1
            style={{
              margin: "8px 0",
              fontSize: "clamp(34px, 6vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            {emoji.movie} {t.boxOfficeEgypt || "BoxOffice Egypt"}
          </h1>

          <div style={{ color: "#a3a3a3", fontSize: 17 }}>
            {filteredMovies.length} {text("movies")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <LanguageSwitcher />

          <Link
            href="/admin"
            style={{
              border: "none",
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff",
              padding: "13px 22px",
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 15,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span aria-hidden="true">{emoji.settings}</span>
            {text("adminPanel", "AdminPanel")}
          </Link>
        </div>
      </header>

      {topMovie ? (
        <section
          style={{
            marginBottom: 30,
            padding: 32,
            borderRadius: 26,
            background: "linear-gradient(135deg,#0b1220,#1e293b,#111827)",
            border: "1px solid #334155",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 30,
          }}
        >
          <div style={{ flex: "1 1 320px" }}>
            <div
              style={{
                color: "#FFD54A",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              #1 {text("topMovie")}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 900,
              }}
            >
              {topMovie.title}
            </h2>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 24,
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

          <img
            src={topMovie.poster || "https://placehold.co/300x450"}
            alt={topMovie.title || "Top movie poster"}
            style={{
              width: 220,
              maxWidth: "100%",
              borderRadius: 18,
              boxShadow: "0 20px 50px rgba(0,0,0,.45)",
            }}
          />
        </section>
      ) : (
        <section
          style={{
            marginBottom: 30,
            padding: 32,
            borderRadius: 26,
            background: "#111827",
            border: "1px solid #334155",
            color: "#cbd5e1",
            fontWeight: 800,
          }}
        >
          {text("noMovies")}
        </section>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        {filters.map((item) => {
          const active = filter === item.value;

          return (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              style={{
                border: active ? "1px solid #FFD54A" : "1px solid #2f2f2f",
                background: active ? "#FFD54A" : "#181818",
                color: active ? "#111" : "#fff",
                borderRadius: 14,
                cursor: "pointer",
                fontWeight: 900,
                padding: "12px 16px",
              }}
              type="button"
            >
              {item.label} ({item.count})
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: 24,
        }}
      >
        {filteredMovies.map((movie, index) => {
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
                background: "linear-gradient(135deg,#151515,#1f1f1f)",
                border: index < 3 ? `1px solid ${badgeColor}` : "1px solid #333",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 15px 36px rgba(0,0,0,.45)",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={movie.poster || "https://placehold.co/300x450"}
                  alt={movie.title || "Movie poster"}
                  style={{
                    width: "100%",
                    height: 250,
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: isArabic ? "auto" : 10,
                    right: isArabic ? 10 : "auto",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: badgeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: index < 3 ? "#000" : "#fff",
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  {rank}
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: isArabic ? "auto" : 10,
                    right: isArabic ? 10 : "auto",
                    background: movie.language === "ar" ? "#16a34a" : "#dc2626",
                    padding: "4px 10px",
                    borderRadius: 30,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {movie.language === "ar" ? text("arabic") : text("foreign")}
                </div>
              </div>

              <div style={{ padding: 14 }}>
                <h3
                  style={{
                    margin: 0,
                    textAlign: "center",
                    fontSize: 18,
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  {movie.title}
                </h3>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <SmallMetric
                    color="#4ade80"
                    icon={emoji.revenue}
                    label={text("revenue")}
                    value={movie.revenue}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
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

                  <Link
                    href={`/movie/${movie.id}`}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      padding: "12px",
                      borderRadius: 12,
                      background: "#2563eb",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: 15,
                      textDecoration: "none",
                      textAlign: "center",
                      display: "block",
                      boxSizing: "border-box",
                    }}
                  >
                    {emoji.details} {text("details")}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function Metric({ color = "#fff", icon, label, value }) {
  return (
    <div>
      <div style={{ color: "#94a3b8", fontSize: 13 }}>
        {icon} {label}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color,
        }}
      >
        {(value || 0).toLocaleString()}
      </div>
    </div>
  );
}

function SmallMetric({ centered = false, color = "#fff", icon, label, value }) {
  return (
    <div
      style={{
        background: "#202020",
        borderRadius: 12,
        padding: centered ? 10 : 12,
        textAlign: centered ? "center" : "start",
      }}
    >
      <div
        style={{
          fontSize: centered ? 11 : 12,
          color: "#9ca3af",
          marginBottom: centered ? 0 : 4,
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          marginTop: centered ? 6 : 0,
          fontWeight: 900,
          fontSize: centered ? 20 : 24,
          color,
        }}
      >
        {(value || 0).toLocaleString()}
      </div>
    </div>
  );
}
