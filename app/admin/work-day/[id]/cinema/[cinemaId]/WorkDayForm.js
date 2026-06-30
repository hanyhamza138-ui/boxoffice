"use client";

import { useEffect, useState } from "react";
import {
  saveWorkDayRevenue,
  deleteWorkDayReport,
} from "../../../../../actions/workday";

export default function WorkDayForm({
  dayId,
  cinemaId,
  movies,
  versions,
  existingReports = [],
  t,
}) {
  

  const [rows, setRows] = useState([
    {
      id: null,
      movieId: "",
      versionId: "",
      tickets: "",
      revenue: "",
    },
  ]);

  const [deletedIds, setDeletedIds] =
    useState([]);

  useEffect(() => {
    if (!existingReports.length) {
      return;
    }

    setRows(
      existingReports
        .filter(
          (report) =>
            !deletedIds.includes(
              report.id
            )
        )
        .map((report) => ({
          id: report.id,

          movieId: String(
            report.movie_id
          ),

          versionId:
            report.version_id
              ? String(
                  report.version_id
                )
              : "",

          tickets: String(
            report.tickets ?? ""
          ),

          revenue: String(
            report.revenue ?? ""
          ),
        }))
    );
  }, [
    existingReports,
    deletedIds,
  ]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: null,
        movieId: "",
        versionId: "",
        tickets: "",
        revenue: "",
      },
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

  async function removeRow(
    index
  ) {
    const row = rows[index];

    if (!row) return;

    if (row.id) {
      const ok = confirm(
        t.confirmDeleteMovie
      );

      if (!ok) return;

      setDeletedIds((prev) => [
        ...prev,
        row.id,
      ]);
    }

    setRows((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  async function handleSave() {
    const payload = [];

    const usedReports =
      new Set();

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

      const reportKey =
        `${movieId}_${versionId}`;

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