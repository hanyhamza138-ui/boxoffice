"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ImportUploader from "./ImportUploader";
import ImportPreview from "./ImportPreview";

import { importEngine } from "../../lib/import/engine";
import { saveReports } from "../../lib/import/saveReports";
import { supabase } from "../../lib/supabase";

export default function ImportCenter({
  dayId,
  title = "Smart Import",
  description = "Upload a file, review matches, then save the rows to this work day.",
  accept = ".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp,.txt",
}) {
  const [rows, setRows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);

  const [lastFile, setLastFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const [fileType, setFileType] = useState("");

  const [reportDate, setReportDate] = useState("");

  /* =====================================================
     LOAD CINEMAS + MOVIES
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadLists() {
      try {
        const [
          cinemaResult,
          movieResult,
        ] = await Promise.all([
          supabase
            .from("cinemas")
            .select("id,name")
            .order("name"),

          supabase
            .from("movies")
            .select("id,title")
            .order("title"),
        ]);

        if (cancelled) {
          return;
        }

        if (cinemaResult.error) {
          console.error(
            "Cinema Load Error:",
            cinemaResult.error
          );
        }

        if (movieResult.error) {
          console.error(
            "Movie Load Error:",
            movieResult.error
          );
        }

        setCinemas(
          cinemaResult.data || []
        );

        setMovies(
          movieResult.data || []
        );
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Load Lists Error:",
            err
          );
        }
      }
    }

    loadLists();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     DETECT FILE TYPE
  ===================================================== */

  function detectType(file) {
    if (!file || !file.name) {
      return "Unknown";
    }

    const ext = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (
      ext === "xlsx" ||
      ext === "xls"
    ) {
      return "Excel";
    }

    if (ext === "csv") {
      return "CSV";
    }

    if (ext === "pdf") {
      return "PDF";
    }

    if (
      ext === "png" ||
      ext === "jpg" ||
      ext === "jpeg" ||
      ext === "webp"
    ) {
      return "Image";
    }

    if (ext === "txt") {
      return "Text";
    }

    return "Unknown";
  }

  /* =====================================================
     RELOAD PREVIEW
  ===================================================== */

  const reloadPreview = useCallback(
    async () => {
      if (!lastFile) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const parsed =
          await importEngine(lastFile);

        const parsedRows =
          parsed?.rows || [];

        setRows(parsedRows);

        setDebug(
          "Rows Parsed : " +
            parsedRows.length
        );

        console.log(
          "Reloaded Import:",
          parsed
        );
      } catch (err) {
        console.error(
          "Reload Preview Error:",
          err
        );

        setError(
          err?.message ||
            "Unable to reload preview."
        );
      } finally {
        setLoading(false);
      }
    },
    [lastFile]
  );

  /* =====================================================
     ALIAS CREATED EVENT
  ===================================================== */

  useEffect(() => {
    window.addEventListener(
      "alias-created",
      reloadPreview
    );

    return () => {
      window.removeEventListener(
        "alias-created",
        reloadPreview
      );
    };
  }, [reloadPreview]);

  /* =====================================================
     HANDLE FILE
  ===================================================== */

  async function handleFile(file) {
    if (!file) {
      return;
    }

    try {
      /* -----------------------------------------------
         Validate Day
      ----------------------------------------------- */

      if (!dayId) {
        setError(
          "Day ID is missing."
        );

        return;
      }

      /* -----------------------------------------------
         Validate Date
      ----------------------------------------------- */

      if (!reportDate) {
        alert(
          "Please select report date first."
        );

        return;
      }

      /* -----------------------------------------------
         Reset
      ----------------------------------------------- */

      setLoading(true);
      setRows([]);
      setError("");
      setDebug("");

      setLastFile(file);

      const detectedType =
        detectType(file);

      setFileType(detectedType);

      /* -----------------------------------------------
         Import
      ----------------------------------------------- */

      const parsed =
        await importEngine(file);

      const parsedRows =
        parsed?.rows || [];

      /* -----------------------------------------------
         Empty Result
      ----------------------------------------------- */

      if (!parsedRows.length) {
        setError(
          "No records found inside this file."
        );

        setDebug(
          "Rows Parsed : 0"
        );

        return;
      }

      /* -----------------------------------------------
         Set Preview
      ----------------------------------------------- */

      setRows(parsedRows);

      setDebug(
        "Rows Parsed : " +
          parsedRows.length
      );

      /* -----------------------------------------------
         Debug
      ----------------------------------------------- */

      console.log(
        "FILE:",
        file.name
      );

      console.log(
        "FILE TYPE:",
        detectedType
      );

      console.log(
        "CLASSIFICATION:",
        parsed?.classification
      );

      console.log(
        "AI:",
        parsed?.ai
      );

      console.log(
        "ROWS:",
        parsedRows
      );
    } catch (err) {
      console.error(
        "Import File Error:",
        err
      );

      setRows([]);

      setError(
        err?.message ||
          "Import failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     HANDLE IMPORT / SAVE
  ===================================================== */

  async function handleImport() {
    try {
      /* -----------------------------------------------
         Validate Day
      ----------------------------------------------- */

      if (!dayId) {
        alert(
          "Day ID is missing."
        );

        return;
      }

      /* -----------------------------------------------
         Validate Date
      ----------------------------------------------- */

      if (!reportDate) {
        alert(
          "Please select report date."
        );

        return;
      }

      /* -----------------------------------------------
         Validate Rows
      ----------------------------------------------- */

      if (!rows || rows.length === 0) {
        alert(
          "No rows available to import."
        );

        return;
      }

      /* -----------------------------------------------
         Start
      ----------------------------------------------- */

      setLoading(true);
      setError("");

      console.log(
        "SAVE IMPORT:",
        {
          dayId,
          reportDate,
          rowsCount: rows.length,
        }
      );

      /* -----------------------------------------------
         Save
      ----------------------------------------------- */

      const result =
        await saveReports({
          dayId,
          reportDate,
          rows,
        });

      console.log(
        "SAVE RESULT:",
        result
      );

      /* -----------------------------------------------
         Failed
      ----------------------------------------------- */

      if (!result?.success) {
        const message =
          result?.message ||
          "Import could not be saved.";

        setError(message);

        alert(message);

        return;
      }

      /* -----------------------------------------------
         Success
      ----------------------------------------------- */

      const imported =
        result?.imported || 0;

      alert(
        "Imported " +
          imported +
          " rows successfully."
      );

      /* -----------------------------------------------
         Reset
      ----------------------------------------------- */

      setRows([]);
      setDebug("");
      setError("");
      setFileType("");
      setLastFile(null);
    } catch (err) {
      console.error(
        "Save Import Error:",
        err
      );

      const message =
        err?.message ||
        "Import failed while saving.";

      setError(message);

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      {/* =================================================
          REPORT DATE
      ================================================= */}

      <div
        style={{
          background: "#1b1b1b",
          padding: 20,
          borderRadius: 14,
          border: "1px solid #333",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          📅 Report Date
        </label>

        <input
          type="date"
          value={reportDate}
          onChange={(e) =>
            setReportDate(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
            fontSize: 15,
          }}
        />
      </div>

      {/* =================================================
          UPLOADER
      ================================================= */}

      <ImportUploader
        title={`📥 ${title}`}
        description={description}
        accept={accept}
        onSelect={handleFile}
      />

      {/* =================================================
          FILE TYPE
      ================================================= */}

      {!!fileType && (
        <div
          style={{
            background: "#1f2937",
            padding: 15,
            borderRadius: 10,
            color: "#4ade80",
            fontWeight: 700,
          }}
        >
          ✔ Detected File Type:{" "}
          {fileType}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div
          style={{
            background: "#172554",
            padding: 15,
            borderRadius: 10,
            color: "#93c5fd",
            fontWeight: 700,
          }}
        >
          ⏳ Processing file...
        </div>
      )}

      {/* =================================================
          DEBUG
      ================================================= */}

      {!!debug && !loading && (
        <div
          style={{
            background: "#172554",
            padding: 15,
            borderRadius: 10,
            color: "#93c5fd",
          }}
        >
          {debug}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!!error && (
        <div
          style={{
            background: "#7f1d1d",
            padding: 15,
            borderRadius: 10,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* =================================================
          PREVIEW
      ================================================= */}

      {rows.length > 0 && (
        <ImportPreview
          rows={rows}
          cinemas={cinemas}
          movies={movies}
          loading={loading}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
