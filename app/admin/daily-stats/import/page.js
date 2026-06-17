"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function ImportDailyStatsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results) => {
        try {
          const response = await fetch(
            "/api/import-daily-stats",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                results.data
              ),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Import Failed"
            );
          }

          setMessage(
            `✅ Imported ${results.data.length} rows successfully`
          );
        } catch (error) {
          setMessage(
            `❌ ${error.message}`
          );
        }

        setLoading(false);
      },

      error: (error) => {
        setMessage(
          `❌ CSV Error: ${error.message}`
        );

        setLoading(false);
      },
    });
  }

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontSize: "40px",
          marginBottom: "30px",
        }}
      >
        📥 Import Daily Stats
      </h1>

      <div
        style={{
          background: "#1c1c1c",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "700px",
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
          }}
        />

        {loading && (
          <p
            style={{
              marginTop: "20px",
            }}
          >
            ⏳ Uploading CSV...
          </p>
        )}

        {message && (
          <p
            style={{
              marginTop: "20px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: "40px",
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "700px",
        }}
      >
        <h2>
          📄 CSV Format
        </h2>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            color: "#22c55e",
          }}
        >
{`movie_id,cinema_id,revenue,audience,date
1,1,25000,1200,2026-06-12
2,1,18000,900,2026-06-12
3,2,12000,650,2026-06-12`}
        </pre>
      </div>
    </main>
  );
}