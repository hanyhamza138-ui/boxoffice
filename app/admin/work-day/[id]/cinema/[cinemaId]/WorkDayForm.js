
"use client";

import { useState } from "react";
import {
  saveWorkDayRevenue,
  deleteWorkDayReport,
} from "../../../../../actions/workday";

const blankRow = {
  id: null,
  movieId: "",
  versionId: "",
  tickets: "",
  revenue: "",
};

function reportToRow(report) {
  return {
    id: report.id,
    movieId: String(report.movie_id),
    versionId: report.version_id ? String(report.version_id) : "",
    tickets: String(report.tickets ?? ""),
    revenue: String(report.revenue ?? ""),
  };
}

export default function WorkDayForm({
  dayId,
  cinemaId,
  movies = [],
  versions = [],
  existingReports = [],
  t,
}) {
  

  const [rows, setRows] = useState(() =>
    existingReports.length
      ? existingReports.map(reportToRow)
      : [blankRow]
  );

  const [deletedIds, setDeletedIds] = useState([]);

  const [saving, setSaving] = useState(false);

  const [draftLoaded, setDraftLoaded] = useState(false);

  const [showOnlyFilled, setShowOnlyFilled] =
    useState(false);

  /* ========================================================
     LOAD LOCAL DRAFT
  ======================================================== */

  useEffect(() => {
    if (draftLoaded) {
      return;
    }

    try {
      const key = getStorageKey(
        dayId,
        cinemaId
      );

      const raw =
        window.localStorage.getItem(key);

      if (!raw) {
        setDraftLoaded(true);
        return;
      }

      const draft = JSON.parse(raw);

      if (
        !draft ||
        !Array.isArray(draft.rows)
      ) {
        setDraftLoaded(true);
        return;
      }

      /*
        إذا كانت هناك بيانات محفوظة بالفعل في DB،
        نعتمد DB باعتبارها المصدر الرسمي.
      */
      if (existingReports.length) {
        setDraftLoaded(true);
        return;
      }

      if (draft.rows.length) {
        setRows(
          draft.rows.map((row, index) => ({
            ...blankRow,
            ...row,
            _key:
              row._key ||
              `draft-${index}-${Date.now()}`,
          }))
        );
      }

      if (Array.isArray(draft.deletedIds)) {
        setDeletedIds(draft.deletedIds);
      }
    } catch (error) {
      console.warn(
        "Unable to load Work Day draft:",
        error
      );
    } finally {
      setDraftLoaded(true);
    }
  }, [
    dayId,
    cinemaId,
    existingReports.length,
    draftLoaded,
  ]);

  /* ========================================================
     AUTO SAVE LOCAL DRAFT
  ======================================================== */

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    try {
      const key = getStorageKey(
        dayId,
        cinemaId
      );

      const draft = {
        rows,
        deletedIds,
        savedAt: new Date().toISOString(),
      };

      window.localStorage.setItem(
        key,
        JSON.stringify(draft)
      );
    } catch (error) {
      console.warn(
        "Unable to save Work Day draft:",
        error
      );
    }
  }, [
    rows,
    deletedIds,
    dayId,
    cinemaId,
    draftLoaded,
  ]);

  /* ========================================================
     TOTALS
  ======================================================== */

  const totals = useMemo(() => {
    return rows.reduce(
      (sum, row) => {
        const hasData =
          row.movieId ||
          row.versionId ||
          row.tickets ||
          row.revenue;

        return {
          tickets:
            sum.tickets +
            safeNumber(row.tickets),

          revenue:
            sum.revenue +
            safeNumber(row.revenue),

          filled:
            sum.filled +
            (hasData ? 1 : 0),
        };
      },
      {
        tickets: 0,
        revenue: 0,
        filled: 0,
      }
    );
  }, [rows]);

  /* ========================================================
     MOVIE / VERSION HELPERS
  ======================================================== */

  function getMovie(movieId) {
    return movies.find(
      (movie) =>
        String(movie.id) ===
        String(movieId)
    );
  }

  function getMovieVersions(movieId) {
    if (!movieId) {
      return versions;
    }

    const movieSpecific =
      versions.filter(
        (version) =>
          version.movie_id === undefined ||
          version.movie_id === null ||
          String(version.movie_id) ===
            String(movieId)
      );

    return movieSpecific;
  }

  function getVersion(versionId) {
    return versions.find(
      (version) =>
        String(version.id) ===
        String(versionId)
    );
  }

  /* ========================================================
     ROW OPERATIONS
  ======================================================== */

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

  function updateRow(index, field, value) {
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

  async function removeRow(
    index
  ) {
    const row = rows[index];

    if (!row) {
      return;
    }

    if (row.id) {
      const confirmMessage =
        t.confirmDeleteMovie ||
        "Delete this saved movie entry?";

      const ok = window.confirm(
        confirmMessage
      );

      if (!ok) {
        return;
      }

      setDeletedIds((prev) => {
        if (prev.includes(row.id)) {
          return prev;
        }

        return [...prev, row.id];
      });
    }

    setRows((prev) => {
      const next = prev.filter(
        (_, i) => i !== index
      )
    );
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    const payload = [];
    const usedReports = new Set();

    for (const row of rows) {
      const movieId =
        String(
          row.movieId || ""
        ).trim();

      const versionId =
        String(
          row.versionId || ""
        ).trim();

      const tickets =
        String(
          row.tickets || ""
        ).trim();

      const revenue =
        String(
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
        alert(
          t.selectMovieFirst
        );
        return;
      }

      const ticketNumber =
        safeNumber(tickets);

      const revenueNumber =
        safeNumber(revenue);

      if (
        usedReports.has(
          reportKey
        )
      ) {
        alert(
          t.duplicateMovie
        );
        return;
      }

      usedReports.add(
        reportKey
      );

      payload.push({
        id: row.id,

        day_id:
          Number(dayId),

        cinema_id:
          Number(cinemaId),

        movie_id:
          Number(movieId),

        version_id:
          versionId
            ? Number(versionId)
            : null,

        tickets: Number(
          tickets || 0
        ),

        revenue: Number(
          revenue || 0
        ),
      });
    }

    if (!payload.length) {
      alert(
        t.enterAtLeastOneMovie
      );
      return;
    }

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

    alert(
      t.savedSuccessfully
    );

    window.location.reload();
  }
    return (
    <div
      style={{
        background: "#1c1c1c",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h2>
        🎬 {t.enterRevenue}
      </h2>

      {rows.map((row, index) => {
        const selectedMovie =
          movies.find(
            (movie) =>
              String(movie.id) ===
              String(row.movieId)
          );

        return (
          <div
            key={
              row.id ??
              `new-${index}`
            }
            style={{
              border:
                "1px solid #333",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <select
              value={row.movieId}
              onChange={(e) =>
                updateRow(
                  index,
                  "movieId",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
              }}
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

            {selectedMovie && (
              <div
                style={{
                  marginTop:
                    "15px",
                  textAlign:
                    "center",
                }}
              >
                <img
                  src={
                    selectedMovie.poster
                  }
                  alt={
                    selectedMovie.title
                  }
                  style={{
                    width: "180px",
                    borderRadius:
                      "10px",
                  }}
                />

                <h3>
                  {
                    selectedMovie.title
                  }
                </h3>

                <p>
                  {
                    selectedMovie.code
                  }
                </p>
              </div>
            )}

            <select
              value={
                row.versionId
              }
              onChange={(e) =>
                updateRow(
                  index,
                  "versionId",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop:
                  "10px",
              }}
            >
              <option value="">
                {t.selectVersion}
              </option>

              {versions.map(
                (version) => (
                  <option
                    key={
                      version.id
                    }
                    value={
                      version.id
                    }
                  >
                    {
                      version.name
                    }
                  </option>
                )
              )}
            </select>

            <input
              type="number"
              placeholder={
                t.totalTickets
              }
              value={row.tickets}
              onChange={(e) =>
                updateRow(
                  index,
                  "tickets",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop:
                  "10px",
              }}
            />

            <input
              type="number"
              placeholder={
                t.totalRevenue
              }
              value={row.revenue}
              onChange={(e) =>
                updateRow(
                  index,
                  "revenue",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop:
                  "10px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                removeRow(index)
              }
              style={{
                marginTop:
                  "10px",
                background:
                  "#dc2626",
                color: "white",
                border: "none",
                padding:
                  "10px",
                borderRadius:
                  "6px",
                cursor:
                  "pointer",
              }}
            >
              🗑️ {t.delete}
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        style={{
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        ➕ {t.addMovie}
      </button>

      <button
        type="button"
        onClick={handleSave}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        💾 {t.save}
      </button>
    </div>
  );
}

/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={
        summaryCardStyle
      }
    >
      <div
        style={
          summaryIconStyle
        }
      >
        {icon}
      </div>

      <div>
        <span
          style={
            summaryLabelStyle
          }
        >
          {label}
        </span>

        <strong
          style={
            summaryValueStyle
          }
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

/* ==========================================================
   STYLES
========================================================== */

const shellStyle = {
  background:
    "linear-gradient(145deg,#0b1220 0%,#111827 55%,#0b1220 100%)",
  border:
    "1px solid rgba(148,163,184,.20)",
  borderRadius: 18,
  padding: 22,
  boxShadow:
    "0 20px 50px rgba(0,0,0,.28)",
};

const headerStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(280px,1.25fr) minmax(320px,1fr)",
  gap: 22,
  alignItems: "center",
  marginBottom: 22,
};

const eyebrowStyle = {
  margin: 0,
  color: "#facc15",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
  textTransform: "uppercase",
};

const titleStyle = {
  margin:
    "7px 0 8px",
  fontSize: 29,
  lineHeight: 1.15,
  fontWeight: 950,
  color: "#fff",
};

const subTitleStyle = {
  margin: 0,
  maxWidth: 720,
  color: "#94a3b8",
  lineHeight: 1.6,
  fontSize: 13,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3,minmax(100px,1fr))",
  gap: 10,
};

const summaryCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 76,
  padding: "13px 14px",
  borderRadius: 13,
  background:
    "linear-gradient(145deg,#111c30,#0c1424)",
  border:
    "1px solid rgba(148,163,184,.16)",
};

const summaryIconStyle = {
  width: 38,
  height: 38,
  display: "grid",
  placeItems: "center",
  borderRadius: 11,
  background:
    "rgba(250,204,21,.10)",
  fontSize: 19,
};

const summaryLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 800,
  marginBottom: 4,
};

const summaryValueStyle = {
  color: "#fff",
  fontSize: 20,
  fontWeight: 950,
};

const toolbarStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding:
    "12px 14px",
  marginBottom: 14,
  borderRadius: 13,
  background:
    "rgba(15,23,42,.72)",
  border:
    "1px solid rgba(148,163,184,.13)",
};

const toolbarLeftStyle = {
  display: "flex",
  gap: 9,
  flexWrap: "wrap",
};

const draftStatusStyle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 700,
};

const draftDotStyle = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow:
    "0 0 10px rgba(34,197,94,.55)",
};

const rowsStyle = {
  display: "grid",
  gap: 13,
};

const rowCardStyle = {
  background:
    "linear-gradient(145deg,#111827,#0d1626)",
  border:
    "1px solid rgba(148,163,184,.15)",
  borderRadius: 15,
  padding: 16,
};

const rowHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 15,
};

const rowNumberWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  minWidth: 0,
};

const rowNumberStyle = {
  width: 34,
  height: 34,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: 10,
  background:
    "rgba(37,99,235,.16)",
  border:
    "1px solid rgba(59,130,246,.25)",
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 950,
};

const rowTitleStyle = {
  display: "block",
  color: "#fff",
  fontSize: 14,
  fontWeight: 900,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 450,
};

const rowCodeStyle = {
  display: "inline-block",
  marginTop: 3,
  color: "#64748b",
  fontSize: 10,
  fontWeight: 800,
};

const fieldsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(220px,1.5fr) minmax(190px,1.15fr) minmax(130px,.7fr) minmax(150px,.8fr)",
  gap: 12,
};

const fieldStyle = {
  display: "grid",
  gap: 7,
};

const labelStyle = {
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 850,
};

const inputStyle = {
  width: "100%",
  minHeight: 46,
  boxSizing: "border-box",
  padding:
    "10px 12px",
  borderRadius: 10,
  border:
    "1px solid #334155",
  background:
    "#0a1220",
  color: "#fff",
  outline: "none",
  fontSize: 13,
  fontWeight: 650,
};

const moviePreviewStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginTop: 14,
  paddingTop: 14,
  borderTop:
    "1px solid rgba(148,163,184,.12)",
};

const posterStyle = {
  width: 52,
  height: 72,
  flexShrink: 0,
  objectFit: "cover",
  borderRadius: 9,
  border:
    "1px solid rgba(255,255,255,.12)",
};

const posterPlaceholderStyle = {
  width: 52,
  height: 72,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  borderRadius: 9,
  background:
    "linear-gradient(145deg,#1e293b,#0f172a)",
  border:
    "1px solid rgba(255,255,255,.08)",
  fontSize: 22,
};

const movieInfoStyle = {
  minWidth: 0,
  flex: 1,
};

const movieNameStyle = {
  color: "#fff",
  fontSize: 14,
  fontWeight: 900,
};

const mutedTextStyle = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 10,
  fontWeight: 750,
};

const versionBadgeRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 8,
};

const versionBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding:
    "5px 8px",
  borderRadius: 7,
  background:
    "rgba(37,99,235,.13)",
  border:
    "1px solid rgba(59,130,246,.22)",
  color: "#93c5fd",
  fontSize: 10,
  fontWeight: 850,
};

const secondaryBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding:
    "5px 8px",
  borderRadius: 7,
  background:
    "rgba(148,163,184,.08)",
  border:
    "1px solid rgba(148,163,184,.14)",
  color: "#cbd5e1",
  fontSize: 10,
  fontWeight: 800,
};

const rowTotalsStyle = {
  display: "flex",
  gap: 18,
  flexShrink: 0,
};

const miniLabelStyle = {
  display: "block",
  color: "#64748b",
  fontSize: 9,
  fontWeight: 800,
  marginBottom: 3,
};

const miniValueStyle = {
  color: "#e2e8f0",
  fontSize: 13,
  fontWeight: 900,
};

const toolbarButtonBase = {
  minHeight: 40,
  padding:
    "9px 13px",
  borderRadius: 9,
  fontSize: 11,
  fontWeight: 850,
  cursor: "pointer",
};

const addButtonStyle = {
  ...toolbarButtonBase,
  background:
    "linear-gradient(135deg,#16a34a,#15803d)",
  color: "#fff",
  border:
    "1px solid rgba(74,222,128,.25)",
  boxShadow:
    "0 8px 18px rgba(22,163,74,.16)",
};

const filterButtonStyle = {
  ...toolbarButtonBase,
  background:
    "#111827",
  color: "#cbd5e1",
  border:
    "1px solid #334155",
};

const activeFilterButtonStyle = {
  ...filterButtonStyle,
  background:
    "rgba(37,99,235,.16)",
  color: "#93c5fd",
  border:
    "1px solid rgba(59,130,246,.35)",
};

const deleteButtonStyle = {
  ...toolbarButtonBase,
  minHeight: 36,
  padding:
    "7px 11px",
  background:
    "rgba(127,29,29,.24)",
  color: "#fca5a5",
  border:
    "1px solid rgba(248,113,113,.20)",
};

const clearButtonStyle = {
  ...toolbarButtonBase,
  background:
    "#111827",
  color: "#94a3b8",
  border:
    "1px solid #334155",
};

const saveButtonStyle = {
  ...toolbarButtonBase,
  minHeight: 46,
  padding:
    "11px 22px",
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  border:
    "1px solid rgba(96,165,250,.28)",
  boxShadow:
    "0 10px 24px rgba(37,99,235,.20)",
  fontSize: 12,
};

const footerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 18,
  flexWrap: "wrap",
  marginTop: 18,
  paddingTop: 17,
  borderTop:
    "1px solid rgba(148,163,184,.14)",
};

const footerSummaryStyle = {
  display: "flex",
  alignItems: "center",
  gap: 28,
  flexWrap: "wrap",
};

const footerLabelStyle = {
  display: "block",
  color: "#64748b",
  fontSize: 10,
  fontWeight: 800,
  marginBottom: 4,
};

const footerValueStyle = {
  color: "#fff",
  fontSize: 17,
  fontWeight: 950,
};

const footerRevenueStyle = {
  color: "#facc15",
  fontSize: 17,
  fontWeight: 950,
};

const footerButtonsStyle = {
  display: "flex",
  gap: 9,
  flexWrap: "wrap",
};

const emptyStateStyle = {
  minHeight: 230,
  display: "grid",
  placeItems: "center",
  alignContent: "center",
  gap: 9,
  padding: 30,
  borderRadius: 14,
  background:
    "rgba(15,23,42,.55)",
  border:
    "1px dashed rgba(148,163,184,.22)",
  color: "#94a3b8",
  textAlign: "center",
};

const emptyIconStyle = {
  fontSize: 42,
  marginBottom: 4,
};

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