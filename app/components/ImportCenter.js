"use client";

import {
  useState,
  useEffect,
  useCallback,
} from "react";

import ImportUploader from "./ImportUploader";
import ImportPreview from "./ImportPreview";

import { importEngine } from "../../lib/import/engine";
import { saveReports } from "../../lib/import/saveReports";
import { supabase } from "../../lib/supabase";

export default function ImportCenter({ dayId }) {
  const [rows, setRows] = useState([]);
  const [lastFile, setLastFile] = useState(null);

  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileType, setFileType] = useState("");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: cinemasData } =
        await supabase
          .from("cinemas")
          .select("id,name")
          .order("name");

      const { data: moviesData } =
        await supabase
          .from("movies")
          .select("id,title")
          .order("title");

      setCinemas(cinemasData || []);
      setMovies(moviesData || []);
    }

    loadData();
  }, []);

  function detectType(file) {
    const ext = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (["xlsx", "xls"].includes(ext))
      return "Excel";

    if (ext === "csv")
      return "CSV";

    if (ext === "pdf")
      return "PDF";

    if (
      ["png", "jpg", "jpeg"].includes(ext)
    )
      return "Image";

    if (ext === "txt")
      return "Text";

    return "Unknown";
  }

  const reloadPreview = useCallback(async () => {
    if (!lastFile) return;

    try {
      const parsed =
        await importEngine(lastFile);

      setRows(parsed);

      setDebug(
        `Rows Parsed : ${parsed.length}`
      );

    } catch (e) {
      console.error(e);
    }
  }, [lastFile]);

  useEffect(() => {
    function refreshPreview() {
      reloadPreview();
    }

    window.addEventListener(
      "alias-created",
      refreshPreview
    );

    return () =>
      window.removeEventListener(
        "alias-created",
        refreshPreview
      );
  }, [reloadPreview]);

  async function handleFile(file) {
    try {
      setLoading(true);

      setRows([]);
      setError("");
      setDebug("");

      setLastFile(file);

      setFileType(detectType(file));

      console.log(
        "Selected File:",
        file.name
      );

      const parsed =
        await importEngine(file);

      console.log(parsed);

      setDebug(
        `Rows Parsed : ${parsed.length}`
      );

      if (!parsed.length) {
        setError(
          "No records found inside this file."
        );
        return;
      }

      setRows(parsed);

    } catch (e) {
      console.error(e);

      setError(
        e.message ||
          "Import failed."
      );

    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    try {
      setLoading(true);

      const result =
        await saveReports({
          dayId,
          rows,
        });

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(
        `✅ Imported ${result.imported} rows successfully`
      );

      setRows([]);
      setFileType("");
      setDebug("");
      setError("");

    } catch (e) {
      console.error(e);
      alert("Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <ImportUploader
        title="📥 Smart Import"
        accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.txt"
        onSelect={handleFile}
      />

      {fileType && (
        <div
          style={{
            background: "#1f2937",
            borderRadius: 10,
            padding: 15,
            color: "#4ade80",
            fontWeight: "bold",
          }}
        >
          ✔ Detected File Type : {fileType}
        </div>
      )}

      {debug && (
        <div
          style={{
            background: "#172554",
            borderRadius: 10,
            padding: 15,
            color: "#93c5fd",
          }}
        >
          {debug}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#7f1d1d",
            borderRadius: 10,
            padding: 15,
            color: "#fff",
          }}
        >
          ❌ {error}
        </div>
      )}

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