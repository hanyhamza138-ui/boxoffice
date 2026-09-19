
"use client";

import { useEffect, useMemo, useState } from "react";
import { saveWorkDayRevenue } from "../../../../../actions/workday";

/* ==========================================================
   CONSTANTS
========================================================== */

const STORAGE_PREFIX = "boxoffice_workday_draft_v2";

const blankRow = {
  id: null,
  movieId: "",
  versionId: "",
  tickets: "",
  revenue: "",
};

/* ==========================================================
   HELPERS
========================================================== */

function createBlankRow() {
  return {
    ...blankRow,
    _key: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
  };
}

function reportToRow(report) {
  return {
    id: report.id,
    movieId:
      report.movie_id !== null &&
      report.movie_id !== undefined
        ? String(report.movie_id)
        : "",
    versionId:
      report.version_id !== null &&
      report.version_id !== undefined
        ? String(report.version_id)
        : "",
    tickets:
      report.tickets !== null &&
      report.tickets !== undefined
        ? String(report.tickets)
        : "",
    revenue:
      report.revenue !== null &&
      report.revenue !== undefined
        ? String(report.revenue)
        : "",
    _key: `saved-${report.id}`,
  };
}

function numberValue(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function moneyValue(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function safeNumber(value) {
  const normalized = String(value ?? "")
    .replace(/,/g, "")
    .replace(/٬/g, "")
    .replace(/٫/g, ".")
    .trim();

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeVersionName(name) {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function getVersionInfo(name) {
  const original = normalizeVersionName(name);

  const lower = original.toLowerCase();

  let language = "";
  let format = "";

  if (
    lower.includes("english") ||
    lower.includes("eng") ||
    original.includes("إنجليزي") ||
    original.includes("انجليزي") ||
    original.includes("أجنبي") ||
    original.includes("اجنبي")
  ) {
    language = "English";
  } else if (
    lower.includes("arabic") ||
    lower.includes("arab") ||
    original.includes("عربي") ||
    original.includes("العربية") ||
    original.includes("العربي")
  ) {
    language = "Arabic";
  } else if (
    lower.includes("subtitle") ||
    lower.includes("subtitled") ||
    lower.includes("sub")
  ) {
    language = "Subtitle";
  } else if (
    lower.includes("dubbed") ||
    lower.includes("dub")
  ) {
    language = "Dubbed";
  }

  if (lower.includes("imax")) {
    format = "IMAX";
  } else if (/\b3d\b/i.test(original)) {
    format = "3D";
  } else if (/\b2d\b/i.test(original)) {
    format = "2D";
  } else if (
    lower.includes("dubbed") ||
    lower.includes("dub")
  ) {
    format = "Dubbed";
  }

  return {
    original,
    language,
    format,
  };
}

function versionDisplayName(version) {
  const info = getVersionInfo(version?.name);

  if (!info.original) {
    return "Standard";
  }

  if (info.language && info.format) {
    return `${info.language} • ${info.format}`;
  }

  if (info.language) {
    return info.language;
  }

  if (info.format) {
    return info.format;
  }

  return info.original;
}

function versionSearchText(version) {
  const info = getVersionInfo(version?.name);

  return [
    info.original,
    info.language,
    info.format,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getStorageKey(dayId, cinemaId) {
  return `${STORAGE_PREFIX}:${dayId}:${cinemaId}`;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function WorkDayForm({
  dayId,
  cinemaId,
  movies = [],
  versions = [],
  existingReports = [],
  t = {},
}) {
  const savedRows = useMemo(
    () =>
      existingReports.length
        ? existingReports.map(reportToRow)
        : [],
    [existingReports]
  );

  const [rows, setRows] = useState(() =>
    savedRows.length
      ? savedRows
      : [createBlankRow()]
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

  function updateMovie(index, movieId) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              movieId,
              versionId: "",
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
      );

      return next.length
        ? next
        : [createBlankRow()];
    });
  }

  /* ========================================================
     DUPLICATE CHECK
  ======================================================== */

  function findDuplicateRows() {
    const seen = new Map();
    const duplicates = [];

    rows.forEach((row, index) => {
      const movieId =
        String(row.movieId || "").trim();

      const versionId =
        String(row.versionId || "").trim();

      if (!movieId) {
        return;
      }

      const key =
        `${movieId}__${versionId}`;

      if (seen.has(key)) {
        duplicates.push({
          first: seen.get(key),
          second: index,
          key,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates;
  }

  /* ========================================================
     SAVE
  ======================================================== */

  async function handleSave() {
    if (saving) {
      return;
    }

    const payload = [];
    const usedReports = new Set();

    for (const row of rows) {
      const movieId =
        String(row.movieId || "").trim();

      const versionId =
        String(row.versionId || "").trim();

      const tickets =
        String(row.tickets || "").trim();

      const revenue =
        String(row.revenue || "").trim();

      const hasAnyData =
        movieId ||
        versionId ||
        tickets ||
        revenue;

      if (!hasAnyData) {
        continue;
      }

      if (!movieId) {
        window.alert(
          t.selectMovieFirst ||
            "Please select a movie first."
        );
        return;
      }

      const ticketNumber =
        safeNumber(tickets);

      const revenueNumber =
        safeNumber(revenue);

      if (
        ticketNumber < 0 ||
        revenueNumber < 0
      ) {
        window.alert(
          "Tickets and revenue cannot be negative."
        );
        return;
      }

      const reportKey =
        `${movieId}__${versionId}`;

      if (usedReports.has(reportKey)) {
        window.alert(
          t.duplicateMovie ||
            "The same movie/version cannot be entered twice."
        );
        return;
      }

      usedReports.add(reportKey);

      payload.push({
        id: row.id || undefined,

        day_id: Number(dayId),

        cinema_id: Number(cinemaId),

        movie_id: Number(movieId),

        version_id: versionId
          ? Number(versionId)
          : null,

        tickets: ticketNumber,

        revenue: revenueNumber,
      });
    }

    if (!payload.length) {
      window.alert(
        t.enterAtLeastOneMovie ||
          "Please enter at least one movie."
      );
      return;
    }

    const duplicateRows =
      findDuplicateRows();

    if (duplicateRows.length) {
      window.alert(
        t.duplicateMovie ||
          "Duplicate movie/version detected."
      );
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

      if (!result?.success) {
        window.alert(
          result?.message ||
            "Unable to save the report."
        );

        return;
      }

      /*
        Save succeeded.
        The database is now the official source.
      */
      try {
        const key = getStorageKey(
          dayId,
          cinemaId
        );

        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(
          "Unable to clear local draft:",
          error
        );
      }

      window.alert(
        t.savedSuccessfully ||
          "Saved successfully."
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Work Day Save Error:",
        error
      );

      window.alert(
        error?.message ||
          "An unexpected error occurred while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ========================================================
     CLEAR DRAFT
  ======================================================== */

  function clearDraft() {
    const ok = window.confirm(
      "Clear the current unsaved draft?"
    );

    if (!ok) {
      return;
    }

    try {
      const key = getStorageKey(
        dayId,
        cinemaId
      );

      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(
        "Unable to clear draft:",
        error
      );
    }

    setRows(
      existingReports.length
        ? existingReports.map(reportToRow)
        : [createBlankRow()]
    );

    setDeletedIds([]);
  }

  /* ========================================================
     DISPLAY FILTER
  ======================================================== */

  const displayedRows =
    showOnlyFilled
      ? rows.filter(
          (row) =>
            row.movieId ||
            row.versionId ||
            row.tickets ||
            row.revenue
        )
      : rows;

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <section style={shellStyle}>
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            BOXOFFICE • MANUAL ENTRY
          </p>

          <h2 style={titleStyle}>
            🎬{" "}
            {t.enterRevenue ||
              "Enter Box Office Revenue"}
          </h2>

          <p style={subTitleStyle}>
            Enter each movie once per version.
            2D, 3D, IMAX and language versions
            remain separate for accurate reporting.
          </p>
        </div>

        <div style={summaryGridStyle}>
          <SummaryCard
            icon="🎬"
            label={
              t.addMovie ||
              "Movies"
            }
            value={totals.filled}
          />

          <SummaryCard
            icon="🎟️"
            label={
              t.totalTickets ||
              "Tickets"
            }
            value={numberValue(
              totals.tickets
            )}
          />

          <SummaryCard
            icon="💰"
            label={
              t.totalRevenue ||
              "Revenue"
            }
            value={moneyValue(
              totals.revenue
            )}
          />
        </div>
      </div>

      {/* ====================================================
          TOOLBAR
      ==================================================== */}

      <div style={toolbarStyle}>
        <div style={toolbarLeftStyle}>
          <button
            type="button"
            onClick={addRow}
            style={addButtonStyle}
          >
            ➕{" "}
            {t.addMovie ||
              "Add Movie"}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowOnlyFilled(
                (value) => !value
              )
            }
            style={
              showOnlyFilled
                ? activeFilterButtonStyle
                : filterButtonStyle
            }
          >
            {showOnlyFilled
              ? "👁️ Showing Filled"
              : "👁️ Show Filled Only"}
          </button>
        </div>

        <div style={draftStatusStyle}>
          <span style={draftDotStyle} />

          <span>
            Draft saved automatically
          </span>
        </div>
      </div>

      {/* ====================================================
          ROWS
      ==================================================== */}

      <div style={rowsStyle}>
        {displayedRows.map(
          (row, displayIndex) => {
            const realIndex =
              rows.findIndex(
                (item) =>
                  item._key ===
                  row._key
              );

            const selectedMovie =
              getMovie(row.movieId);

            const movieVersions =
              getMovieVersions(
                row.movieId
              );

            const selectedVersion =
              getVersion(
                row.versionId
              );

            return (
              <article
                key={
                  row._key ||
                  row.id ||
                  `row-${displayIndex}`
                }
                style={
                  rowCardStyle
                }
              >
                {/* ==========================================
                    ROW HEADER
                ========================================== */}

                <div
                  style={
                    rowHeaderStyle
                  }
                >
                  <div
                    style={
                      rowNumberWrapStyle
                    }
                  >
                    <span
                      style={
                        rowNumberStyle
                      }
                    >
                      {realIndex + 1}
                    </span>

                    <div>
                      <strong
                        style={
                          rowTitleStyle
                        }
                      >
                        {selectedMovie
                          ?.title ||
                          "New Movie Entry"}
                      </strong>

                      {selectedMovie
                        ?.code && (
                        <span
                          style={
                            rowCodeStyle
                          }
                        >
                          {selectedMovie.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeRow(
                        realIndex
                      )
                    }
                    style={
                      deleteButtonStyle
                    }
                  >
                    🗑️{" "}
                    {t.delete ||
                      "Delete"}
                  </button>
                </div>

                {/* ==========================================
                    MAIN FIELDS
                ========================================== */}

                <div
                  style={
                    fieldsGridStyle
                  }
                >
                  {/* MOVIE */}

                  <label
                    style={
                      fieldStyle
                    }
                  >
                    <span
                      style={
                        labelStyle
                      }
                    >
                      🎬{" "}
                      {t.selectMovie ||
                        "Movie"}
                    </span>

                    <select
                      value={
                        row.movieId
                      }
                      onChange={(e) =>
                        updateMovie(
                          realIndex,
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    >
                      <option value="">
                        {t.selectMovie ||
                          "Select movie"}
                      </option>

                      {movies.map(
                        (movie) => (
                          <option
                            key={
                              movie.id
                            }
                            value={
                              movie.id
                            }
                          >
                            {movie.code
                              ? `${movie.code} - `
                              : ""}
                            {
                              movie.title
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  {/* VERSION */}

                  <label
                    style={
                      fieldStyle
                    }
                  >
                    <span
                      style={
                        labelStyle
                      }
                    >
                      🎞️{" "}
                      {t.selectVersion ||
                        "Version / Format"}
                    </span>

                    <select
                      value={
                        row.versionId
                      }
                      onChange={(e) =>
                        updateRow(
                          realIndex,
                          "versionId",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                      disabled={
                        !row.movieId
                      }
                    >
                      <option value="">
                        {!row.movieId
                          ? "Select movie first"
                          : t.selectVersion ||
                            "Select version"}
                      </option>

                      {movieVersions.map(
                        (version) => {
                          const info =
                            getVersionInfo(
                              version.name
                            );

                          return (
                            <option
                              key={
                                version.id
                              }
                              value={
                                version.id
                              }
                            >
                              {versionDisplayName(
                                version
                              )}
                            </option>
                          );
                        }
                      )}
                    </select>
                  </label>

                  {/* TICKETS */}

                  <label
                    style={
                      fieldStyle
                    }
                  >
                    <span
                      style={
                        labelStyle
                      }
                    >
                      🎟️{" "}
                      {t.totalTickets ||
                        "Tickets"}
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      placeholder="0"
                      value={
                        row.tickets
                      }
                      onChange={(e) =>
                        updateRow(
                          realIndex,
                          "tickets",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </label>

                  {/* REVENUE */}

                  <label
                    style={
                      fieldStyle
                    }
                  >
                    <span
                      style={
                        labelStyle
                      }
                    >
                      💰{" "}
                      {t.totalRevenue ||
                        "Revenue"}
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={
                        row.revenue
                      }
                      onChange={(e) =>
                        updateRow(
                          realIndex,
                          "revenue",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </label>
                </div>

                {/* ==========================================
                    MOVIE INFORMATION
                ========================================== */}

                {selectedMovie && (
                  <div
                    style={
                      moviePreviewStyle
                    }
                  >
                    {selectedMovie.poster ? (
                      <img
                        src={
                          selectedMovie.poster
                        }
                        alt={
                          selectedMovie.title ||
                          "Movie"
                        }
                        style={
                          posterStyle
                        }
                        onError={(
                          e
                        ) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div
                        style={
                          posterPlaceholderStyle
                        }
                      >
                        🎬
                      </div>
                    )}

                    <div
                      style={
                        movieInfoStyle
                      }
                    >
                      <div
                        style={
                          movieNameStyle
                        }
                      >
                        {
                          selectedMovie.title
                        }
                      </div>

                      {selectedMovie.code && (
                        <div
                          style={
                            mutedTextStyle
                          }
                        >
                          {
                            selectedMovie.code
                          }
                        </div>
                      )}

                      {selectedVersion && (
                        <div
                          style={
                            versionBadgeRowStyle
                          }
                        >
                          <span
                            style={
                              versionBadgeStyle
                            }
                          >
                            🎞️{" "}
                            {versionDisplayName(
                              selectedVersion
                            )}
                          </span>

                          {getVersionInfo(
                            selectedVersion.name
                          ).language && (
                            <span
                              style={
                                secondaryBadgeStyle
                              }
                            >
                              {
                                getVersionInfo(
                                  selectedVersion.name
                                ).language
                              }
                            </span>
                          )}

                          {getVersionInfo(
                            selectedVersion.name
                          ).format && (
                            <span
                              style={
                                secondaryBadgeStyle
                              }
                            >
                              {
                                getVersionInfo(
                                  selectedVersion.name
                                ).format
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      style={
                        rowTotalsStyle
                      }
                    >
                      <div>
                        <span
                          style={
                            miniLabelStyle
                          }
                        >
                          Tickets
                        </span>

                        <strong
                          style={
                            miniValueStyle
                          }
                        >
                          {numberValue(
                            row.tickets
                          )}
                        </strong>
                      </div>

                      <div>
                        <span
                          style={
                            miniLabelStyle
                          }
                        >
                          Revenue
                        </span>

                        <strong
                          style={
                            miniValueStyle
                          }
                        >
                          {moneyValue(
                            row.revenue
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          }
        )}
      </div>

      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {!displayedRows.length && (
        <div
          style={
            emptyStateStyle
          }
        >
          <div
            style={
              emptyIconStyle
            }
          >
            🎬
          </div>

          <strong>
            No entries to display
          </strong>

          <span>
            Add a movie to start entering
            the box office report.
          </span>

          <button
            type="button"
            onClick={addRow}
            style={
              addButtonStyle
            }
          >
            ➕ Add Movie
          </button>
        </div>
      )}

      {/* ====================================================
          FOOTER ACTIONS
      ==================================================== */}

      <div
        style={
          footerStyle
        }
      >
        <div
          style={
            footerSummaryStyle
          }
        >
          <div>
            <span
              style={
                footerLabelStyle
              }
            >
              Total Tickets
            </span>

            <strong
              style={
                footerValueStyle
              }
            >
              {numberValue(
                totals.tickets
              )}
            </strong>
          </div>

          <div>
            <span
              style={
                footerLabelStyle
              }
            >
              Total Revenue
            </span>

            <strong
              style={
                footerRevenueStyle
              }
            >
              💰{" "}
              {moneyValue(
                totals.revenue
              )}
            </strong>
          </div>
        </div>

        <div
          style={
            footerButtonsStyle
          }
        >
          <button
            type="button"
            onClick={clearDraft}
            disabled={saving}
            style={
              clearButtonStyle
            }
          >
            ↩️ Reset Draft
          </button>

          <button
            type="button"
            onClick={addRow}
            disabled={saving}
            style={
              addButtonStyle
            }
          >
            ➕{" "}
            {t.addMovie ||
              "Add Movie"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...saveButtonStyle,
              opacity: saving
                ? 0.6
                : 1,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            {saving
              ? "⏳ Saving..."
              : `💾 ${
                  t.save ||
                  "Save Report"
                }`}
          </button>
        </div>
      </div>
    </section>
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
