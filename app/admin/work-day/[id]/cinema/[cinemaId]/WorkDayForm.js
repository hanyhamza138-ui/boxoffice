"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveWorkDayRevenue } from "../../../../../actions/workday";

const blankRow = {
  id: null,
  movieId: "",
  versionId: "",
  tickets: "",
  revenue: "",
};

function createBlankRow() {
  return { ...blankRow };
}

function reportToRow(report) {
  return {
    id: report.id,
    movieId: String(report.movie_id),
    versionId: report.version_id
      ? String(report.version_id)
      : "",
    tickets: String(report.tickets ?? ""),
    revenue: String(report.revenue ?? ""),
  };
}

function numberValue(value) {
  return Number(value || 0).toLocaleString();
}

function normalizeVersionName(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[‐-‒–—]/g, "-")
    .replace(/\s+/g, " ");
}

function versionLabel(version, t) {
  const name = String(version?.name || "").trim();
  const normalized = normalizeVersionName(name);

  if (
    normalized === "english" ||
    normalized === "english movie" ||
    normalized === "eng" ||
    normalized.includes("english movie")
  ) {
    return "English Movie";
  }

  if (
    normalized === "arabic" ||
    normalized === "arabic movie" ||
    normalized === "ar"
  ) {
    return "Arabic";
  }

  if (
    normalized === "2d" ||
    normalized === "2-d"
  ) {
    return "2D";
  }

  if (
    normalized === "3d" ||
    normalized === "3-d"
  ) {
    return "3D";
  }

  if (
    normalized === "imax" ||
    normalized === "imax 2d" ||
    normalized === "imax 3d"
  ) {
    return "IMAX";
  }

  return name;
}

function versionOrder(version) {
  const normalized = normalizeVersionName(
    version?.name
  );

  if (
    normalized === "arabic" ||
    normalized === "arabic movie" ||
    normalized === "ar"
  ) {
    return 1;
  }

  if (
    normalized === "english" ||
    normalized === "english movie" ||
    normalized === "eng"
  ) {
    return 2;
  }

  if (
    normalized === "2d" ||
    normalized === "2-d"
  ) {
    return 3;
  }

  if (
    normalized === "3d" ||
    normalized === "3-d"
  ) {
    return 4;
  }

  if (
    normalized === "imax" ||
    normalized === "imax 2d" ||
    normalized === "imax 3d"
  ) {
    return 5;
  }

  return 99;
}

export default function WorkDayForm({
  dayId,
  cinemaId,
  movies = [],
  versions = [],
  existingReports = [],
  cinemas = [],
  currentCinema = null,
  t,
}) {
  const router = useRouter();

  const [rows, setRows] = useState(() =>
    existingReports.length
      ? existingReports
          .map(reportToRow)
          .sort((a, b) => {
            const movieA =
              movies.find(
                (movie) =>
                  String(movie.id) ===
                  String(a.movieId)
              );

            const movieB =
              movies.find(
                (movie) =>
                  String(movie.id) ===
                  String(b.movieId)
              );

            return String(
              movieA?.title || ""
            ).localeCompare(
              String(movieB?.title || ""),
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );
          })
      : [createBlankRow()]
  );

  const [deletedIds, setDeletedIds] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [cinemaSearch, setCinemaSearch] =
    useState("");

  const sortedVersions = useMemo(() => {
    return [...versions].sort(
      (a, b) =>
        versionOrder(a) -
        versionOrder(b)
    );
  }, [versions]);

  const filteredCinemas = useMemo(() => {
    const search = cinemaSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return cinemas.slice(0, 30);
    }

    return cinemas
      .filter((cinema) =>
        [
          cinema.name,
          cinema.code,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(search)
          )
      )
      .slice(0, 30);
  }, [cinemas, cinemaSearch]);

  const totals = useMemo(() => {
    return rows.reduce(
      (sum, row) => ({
        tickets:
          sum.tickets +
          Number(row.tickets || 0),

        revenue:
          sum.revenue +
          Number(row.revenue || 0),

        filled:
          sum.filled +
          (row.movieId ||
          row.versionId ||
          row.tickets ||
          row.revenue
            ? 1
            : 0),
      }),
      {
        tickets: 0,
        revenue: 0,
        filled: 0,
      }
    );
  }, [rows]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      createBlankRow(),
    ]);
  }

  function updateRow(
    index,
    field,
    value
  ) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function removeRow(index) {
    const row = rows[index];

    if (!row) {
      return;
    }

    if (row.id) {
      const ok = confirm(
        t.confirmDeleteMovie
      );

      if (!ok) {
        return;
      }

      setDeletedIds((prev) => [
        ...prev,
        row.id,
      ]);
    }

    setRows((prev) => {
      const next = prev.filter(
        (_, i) => i !== index
      );

      return next.length
        ? next
        : [createBlankRow()];
    });
  }

  function openCinema(id) {
    if (!id) {
      return;
    }

    router.push(
      `/admin/work-day/${dayId}/cinema/${id}`
    );
  }

  async function handleSave() {
    const payload = [];
    const usedReports = new Set();

    for (const row of rows) {
      const movieId = String(
        row.movieId || ""
      ).trim();

      const versionId = String(
        row.versionId || ""
      ).trim();

      const tickets = String(
        row.tickets || ""
      ).trim();

      const revenue = String(
        row.revenue || ""
      ).trim();

      const hasAnyData =
        movieId ||
        versionId ||
        tickets ||
        revenue;

      if (!hasAnyData) {
        continue;
      }

      if (!movieId) {
        alert(t.selectMovieFirst);
        return;
      }

      const reportKey =
        `${movieId}_${versionId}`;

      if (usedReports.has(reportKey)) {
        alert(t.duplicateMovie);
        return;
      }

      usedReports.add(reportKey);

      payload.push({
        id: row.id,
        day_id: Number(dayId),
        cinema_id: Number(cinemaId),
        movie_id: Number(movieId),
        version_id: versionId
          ? Number(versionId)
          : null,
        tickets: Number(tickets || 0),
        revenue: Number(revenue || 0),
      });
    }

    if (!payload.length) {
      alert(t.enterAtLeastOneMovie);
      return;
    }

    setSaving(true);

    try {
      const result =
        await saveWorkDayRevenue(
          JSON.stringify({
            rows: payload,
            deletedIds,
          })
        );

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(t.savedSuccessfully);

      /*
        بعد الحفظ نعيد تحميل الصفحة من قاعدة البيانات.
        بهذا الشكل أي بيانات محفوظة تظل موجودة حتى بعد
        إغلاق الصفحة أو المتصفح.
      */
      router.refresh();
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={shellStyle}>
      {/* ==================================================
          CINEMA SEARCH
      ================================================== */}

      <div style={cinemaSearchBoxStyle}>
        <div>
          <p style={eyebrowStyle}>
            Cinema Selection
          </p>

          <h3 style={cinemaSearchTitleStyle}>
            🏢 {currentCinema?.name || "Cinema"}
          </h3>
        </div>

        <div style={cinemaSearchControlsStyle}>
          <input
            type="search"
            value={cinemaSearch}
            onChange={(e) =>
              setCinemaSearch(
                e.target.value
              )
            }
            placeholder="🔎 Search cinema name..."
            style={cinemaSearchInputStyle}
          />

          {cinemaSearch.trim() && (
            <div style={cinemaResultsStyle}>
              {filteredCinemas.length ? (
                filteredCinemas.map(
                  (cinema) => (
                    <button
                      key={cinema.id}
                      type="button"
                      onClick={() =>
                        openCinema(
                          cinema.id
                        )
                      }
                      style={{
                        ...cinemaResultButtonStyle,
                        ...(String(
                          cinema.id
                        ) ===
                        String(cinemaId)
                          ? selectedCinemaButtonStyle
                          : {}),
                      }}
                    >
                      <strong>
                        {cinema.name}
                      </strong>

                      {cinema.code && (
                        <span>
                          {cinema.code}
                        </span>
                      )}
                    </button>
                  )
                )
              ) : (
                <div style={noCinemaResultStyle}>
                  No cinema found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            Manual Entry
          </p>

          <h2 style={titleStyle}>
            🎬 {t.enterRevenue}
          </h2>
        </div>

        <div style={summaryGridStyle}>
          <SummaryCard
            label={t.addMovie}
            value={totals.filled}
          />

          <SummaryCard
            label={t.totalTickets}
            value={numberValue(
              totals.tickets
            )}
          />

          <SummaryCard
            label={t.totalRevenue}
            value={numberValue(
              totals.revenue
            )}
          />
        </div>
      </div>

      {/* ==================================================
          MOVIE ROWS
      ================================================== */}

      <div style={rowsStyle}>
        {rows.map((row, index) => {
          const selectedMovie =
            movies.find(
              (movie) =>
                String(movie.id) ===
                String(row.movieId)
            );

          return (
            <article
              key={
                row.id ??
                `new-${index}`
              }
              style={rowCardStyle}
            >
              <div style={rowHeaderStyle}>
                <strong>
                  #{index + 1}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    removeRow(index)
                  }
                  style={
                    deleteButtonStyle
                  }
                >
                  🗑️ {t.delete}
                </button>
              </div>

              <div style={fieldsGridStyle}>
                {/* MOVIE */}

                <label style={fieldStyle}>
                  <span style={labelStyle}>
                    {t.selectMovie}
                  </span>

                  <select
                    value={row.movieId}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "movieId",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      {t.selectMovie}
                    </option>

                    {movies.map(
                      (movie) => (
                        <option
                          key={movie.id}
                          value={movie.id}
                        >
                          {movie.code}
                          {" - "}
                          {movie.title}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {/* VERSION */}

                <label style={fieldStyle}>
                  <span style={labelStyle}>
                    Movie Type / Version
                  </span>

                  <select
                    value={row.versionId}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "versionId",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      {t.selectVersion}
                    </option>

                    {sortedVersions.map(
                      (version) => (
                        <option
                          key={version.id}
                          value={version.id}
                        >
                          {versionLabel(
                            version,
                            t
                          )}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {/* TICKETS */}

                <label style={fieldStyle}>
                  <span style={labelStyle}>
                    {t.totalTickets}
                  </span>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={row.tickets}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "tickets",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </label>

                {/* REVENUE */}

                <label style={fieldStyle}>
                  <span style={labelStyle}>
                    {t.totalRevenue}
                  </span>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={row.revenue}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "revenue",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </label>
              </div>

              {selectedMovie && (
                <div style={moviePreviewStyle}>
                  {selectedMovie.poster && (
                    <img
                      src={
                        selectedMovie.poster
                      }
                      alt={
                        selectedMovie.title
                      }
                      style={posterStyle}
                    />
                  )}

                  <div>
                    <strong>
                      {selectedMovie.title}
                    </strong>

                    <p
                      style={
                        mutedTextStyle
                      }
                    >
                      {selectedMovie.code}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div style={actionsStyle}>
        <button
          type="button"
          onClick={addRow}
          style={addButtonStyle}
        >
          ➕ {t.addMovie}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            ...saveButtonStyle,
            opacity: saving ? 0.65 : 1,
          }}
        >
          {saving
            ? "Saving..."
            : `💾 ${t.save}`}
        </button>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <div style={summaryCardStyle}>
      <span style={summaryLabelStyle}>
        {label}
      </span>

      <strong style={summaryValueStyle}>
        {value}
      </strong>
    </div>
  );
}

/* ==========================================================
   STYLES
========================================================== */

const shellStyle = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 22,
};

const cinemaSearchBoxStyle = {
  background: "#0b1220",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  display: "grid",
  gridTemplateColumns:
    "minmax(220px,0.7fr) minmax(280px,1.3fr)",
  gap: 18,
  alignItems: "start",
};

const cinemaSearchTitleStyle = {
  margin: "7px 0 0",
  fontSize: 20,
};

const cinemaSearchControlsStyle = {
  position: "relative",
};

const cinemaSearchInputStyle = {
  width: "100%",
  minHeight: 46,
  padding: "10px 14px",
  borderRadius: 9,
  border: "1px solid #475569",
  background: "#111827",
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const cinemaResultsStyle = {
  marginTop: 8,
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 9,
  maxHeight: 280,
  overflowY: "auto",
  padding: 6,
};

const cinemaResultButtonStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 7,
  border: "1px solid transparent",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
};

const selectedCinemaButtonStyle = {
  background: "#1d4ed8",
  border: "1px solid #3b82f6",
};

const noCinemaResultStyle = {
  padding: 14,
  color: "#9ca3af",
  textAlign: "center",
};

const headerStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(260px,1fr))",
  gap: 18,
  alignItems: "start",
  marginBottom: 20,
};

const eyebrowStyle = {
  margin: 0,
  color: "#facc15",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
};

const titleStyle = {
  margin: "8px 0 0",
  fontSize: 28,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(120px,1fr))",
  gap: 10,
};

const summaryCardStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: 12,
};

const summaryLabelStyle = {
  display: "block",
  color: "#9ca3af",
  fontSize: 12,
  marginBottom: 6,
};

const summaryValueStyle = {
  color: "#fff",
  fontSize: 20,
};

const rowsStyle = {
  display: "grid",
  gap: 14,
};

const rowCardStyle = {
  background: "#0f172a",
  border: "1px solid #263244",
  borderRadius: 10,
  padding: 16,
};

const rowHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 14,
};

const fieldsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const fieldStyle = {
  display: "grid",
  gap: 6,
};

const labelStyle = {
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 800,
};

const inputStyle = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#111827",
  color: "#fff",
  boxSizing: "border-box",
};

const moviePreviewStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginTop: 14,
  paddingTop: 14,
  borderTop: "1px solid #263244",
};

const posterStyle = {
  width: 54,
  height: 76,
  objectFit: "cover",
  borderRadius: 6,
};

const mutedTextStyle = {
  margin: "6px 0 0",
  color: "#9ca3af",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 20,
};

const addButtonStyle = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};

const saveButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};

const deleteButtonStyle = {
  background: "#7f1d1d",
  color: "white",
  border: "1px solid #991b1b",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};