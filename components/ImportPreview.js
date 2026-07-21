"use client";

export default function ImportPreview({
  rows = [],
  onImport,
  loading = false,
}) {
  const matchedRows = rows.filter(
    (r) => r.matchedCinema && r.matchedMovie
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
      <h2>📋 Preview</h2>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div style={infoCard}>
          📄 Records
          <br />
          <strong>{rows.length}</strong>
        </div>

        <div style={infoCard}>
          ✅ Matched
          <br />
          <strong>{matchedRows}</strong>
        </div>

        <div style={infoCard}>
          ❌ Not Matched
          <br />
          <strong>{rows.length - matchedRows}</strong>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
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
              <tr key={index}>
                <td style={td}>
                  <strong>
                    {row.cinemaName || row.cinema}
                  </strong>

                  <br />

                  <span
                    style={{
                      color: row.matchedCinema
                        ? "#22c55e"
                        : "#ef4444",
                      fontSize: 13,
                    }}
                  >
                    {row.matchedCinema
                      ? "🟢 Matched"
                      : "🔴 Not Found"}
                  </span>
                </td>

                <td style={td}>
                  <strong>
                    {row.movieName || row.movie}
                  </strong>

                  <br />

                  <span
                    style={{
                      color: row.matchedMovie
                        ? "#22c55e"
                        : "#ef4444",
                      fontSize: 13,
                    }}
                  >
                    {row.matchedMovie
                      ? "🟢 Matched"
                      : "🔴 Not Found"}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onImport}
        disabled={loading || matchedRows === 0}
        style={{
          marginTop: 25,
          background: "#16a34a",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          borderRadius: 10,
          cursor:
            loading || matchedRows === 0
              ? "default"
              : "pointer",
          fontWeight: 700,
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

const infoCard = {
  background: "#222",
  padding: "12px 18px",
  borderRadius: 10,
  minWidth: 130,
  textAlign: "center",
};

const th = {
  padding: 12,
  background: "#222",
  textAlign: "left",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #333",
};