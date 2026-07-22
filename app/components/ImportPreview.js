"use client";

import CreateCinemaAliasButton from "./CreateCinemaAliasButton";
import CreateMovieAliasButton from "./CreateMovieAliasButton";

export default function ImportPreview(props) {
  const {
    rows = [],
    cinemas = [],
    movies = [],
    onImport,
    loading = false,
  } = props || {};

  const matchedRows = rows.filter(
    (r) => r.matchedCinema && r.matchedMovie
  ).length;

  const cinemaNotMatched = rows.filter(
    (r) => !r.matchedCinema
  ).length;

  const movieNotMatched = rows.filter(
    (r) => !r.matchedMovie
  ).length;

  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: 16,
        padding: 24,
        marginTop: 25,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>
        📋 Import Preview
      </h2>

      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          marginBottom: 25,
        }}
      >
        <Card title="📄 Records" value={rows.length} />
        <Card title="✅ Ready" value={matchedRows} />
        <Card title="🎬 Cinema Missing" value={cinemaNotMatched} />
        <Card title="🎥 Movie Missing" value={movieNotMatched} />
      </div>

      <div
        style={{
          overflowX: "auto",
          maxHeight: 650,
          overflowY: "auto",
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
            {rows.map((row, index) => {
              const cinema =
                row.cinemaName || row.cinema || "";

              const movie =
                row.movieName || row.movie || "";

              return (
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
                    <b>{cinema}</b>

                    {row.matchedCinema ? (
                      <div style={ok}>
                        🟢 Matched
                      </div>
                    ) : (
                      <>
                        <div style={bad}>
                          🔴 Not Found
                        </div>

                        <CreateCinemaAliasButton
                          alias={cinema}
                          cinemas={cinemas || []}
                        />
                      </>
                    )}
                  </td>

                  <td style={td}>
                    <b>{movie}</b>

                    {row.matchedMovie ? (
                      <div style={ok}>
                        🟢 Matched
                      </div>
                    ) : (
                      <>
                        <div style={bad}>
                          🔴 Not Found
                        </div>

                        <CreateMovieAliasButton
                          alias={movie}
                          movies={movies || []}
                        />
                      </>
                    )}
                  </td>

                  <td style={td}>
                    {Number(
                      row.tickets ??
                        row.audience ??
                        0
                    ).toLocaleString()}
                  </td>

                  <td style={td}>
                    {Number(
                      row.revenue ?? 0
                    ).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={onImport}
        disabled={
          loading || matchedRows === 0
        }
        style={{
          marginTop: 25,
          width: "100%",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          padding: 15,
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 16,
          opacity:
            loading || matchedRows === 0
              ? 0.6
              : 1,
        }}
      >
        {loading
          ? "Importing..."
          : `✅ Import ${matchedRows} Records`}
      </button>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={infoCard}>
      <div>{title}</div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const ok = {
  color: "#22c55e",
  marginTop: 5,
  fontSize: 13,
};

const bad = {
  color: "#ef4444",
  marginTop: 5,
  fontSize: 13,
};

const infoCard = {
  background: "#222",
  padding: 16,
  borderRadius: 12,
  minWidth: 160,
  textAlign: "center",
  border: "1px solid #333",
};

const th = {
  padding: 14,
  background: "#222",
  textAlign: "left",
};

const td = {
  padding: 14,
  borderBottom: "1px solid #333",
  verticalAlign: "top",
};