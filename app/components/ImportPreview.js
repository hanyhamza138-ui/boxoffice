"use client";

import CreateCinemaAliasButton from "./CreateCinemaAliasButton";
import CreateMovieAliasButton from "./CreateMovieAliasButton";
export default function ImportPreview({
  rows = [],
  cinemas = [],
  loading = false,
  onImport,
}) {
  const unknownCinemas = [
    ...new Map(
      rows
        .filter(
          (r) =>
            !r.matchedCinema &&
            (r.cinemaName || r.cinema)
        )
        .map((r) => [
          r.cinemaName || r.cinema,
          r,
        ])
    ).values(),
  ];

  const unknownMovies = [
    ...new Map(
      rows
        .filter(
          (r) =>
            !r.matchedMovie &&
            (r.movieName || r.movie)
        )
        .map((r) => [
          r.movieName || r.movie,
          r,
        ])
    ).values(),
  ];

  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: 16,
        padding: 24,
        marginTop: 25,
      }}
    >
      <h2>📋 Import Preview</h2>

      <p
        style={{
          color: "#9ca3af",
          marginBottom: 20,
        }}
      >
        Found <b>{rows.length}</b> records
      </p>

      {/* Unknown Movies */}

{unknownMovies.length > 0 && (
  <div
    style={{
      background: "#2b1818",
      border: "1px solid #7f1d1d",
      borderRadius: 12,
      padding: 20,
      marginBottom: 25,
    }}
  >
    <h3
      style={{
        color: "#ef4444",
        marginBottom: 20,
      }}
    >
      ❌ Unknown Movies ({unknownMovies.length})
    </h3>

    {unknownMovies.map((row) => (
      <div
        key={row.movieName}
        style={{
          paddingBottom: 20,
          marginBottom: 20,
          borderBottom: "1px solid #444",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 17,
          }}
        >
          🔴 {row.movieName}
        </div>

        <CreateMovieAliasButton
          alias={row.movieName}
          movies={movies}
        />
      </div>
    ))}
  </div>
)}

      {/* Preview Table */}

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={th}>Cinema</th>
              <th style={th}>Movie</th>
              <th style={th}>Tickets</th>
              <th style={th}>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                style={{
                  background:
                    index % 2
                      ? "#181818"
                      : "#141414",
                }}
              >
                <td style={td}>
                  <strong>
                    {row.cinemaName ||
                      row.cinema}
                  </strong>

                  <br />

                  {row.matchedCinema ? (
                    <span
                      style={{
                        color: "#22c55e",
                      }}
                    >
                      🟢 Matched
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#ef4444",
                      }}
                    >
                      🔴 Unknown
                    </span>
                  )}
                </td>

                <td style={td}>
                  <strong>
                    {row.movieName ||
                      row.movie}
                  </strong>

                  <br />

                  {row.matchedMovie ? (
                    <span
                      style={{
                        color: "#22c55e",
                      }}
                    >
                      🟢 Matched
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#ef4444",
                      }}
                    >
                      🔴 Unknown
                    </span>
                  )}
                </td>

                <td style={td}>
                  {Number(
                    row.audience || 0
                  ).toLocaleString()}
                </td>

                <td style={td}>
                  {Number(
                    row.revenue || 0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onImport}
        disabled={
          loading ||
          rows.length === 0
        }
        style={{
          marginTop: 25,
          width: "100%",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          padding: 15,
          borderRadius: 10,
          fontSize: 17,
          fontWeight: "bold",
          cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading
          ? "Importing..."
          : `✅ Import ${rows.length} Records`}
      </button>
    </div>
  );
}

const th = {
  padding: 14,
  background: "#222",
  textAlign: "left",
  borderBottom: "1px solid #444",
};

const td = {
  padding: 14,
  borderBottom: "1px solid #333",
};