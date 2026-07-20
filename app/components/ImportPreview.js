"use client";

export default function ImportPreview({
  rows = [],
  onImport,
  loading = false,
}) {
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

      <p
        style={{
          color: "#9ca3af",
          marginBottom: 20,
        }}
      >
        {rows.length} records found
      </p>

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
              <th style={th}>Version</th>
              <th style={th}>Tickets</th>
              <th style={th}>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td style={td}>{row.cinema}</td>
                <td style={td}>{row.movie}</td>
                <td style={td}>{row.version}</td>
                <td style={td}>
                  {Number(row.tickets).toLocaleString()}
                </td>
                <td style={td}>
                  {Number(row.revenue).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onImport}
        disabled={loading || rows.length === 0}
        style={{
          marginTop: 25,
          background: "#16a34a",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          borderRadius: 10,
          cursor:
            loading || rows.length === 0
              ? "default"
              : "pointer",
          fontWeight: 700,
          opacity:
            loading || rows.length === 0
              ? 0.6
              : 1,
        }}
      >
        {loading
          ? "Importing..."
          : "✅ Import Data"}
      </button>
    </div>
  );
}

const th = {
  padding: 12,
  background: "#222",
  textAlign: "left",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #333",
};