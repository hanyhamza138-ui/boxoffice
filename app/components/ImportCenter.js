"use client";

import { useState, useEffect, useCallback } from "react";

import ImportUploader from "./ImportUploader";
import ImportPreview from "./ImportPreview";

import { importEngine } from "../../lib/import/engine";
import { saveReports } from "../../lib/import/saveReports";
import { supabase } from "../../lib/supabase";

export default function ImportCenter({ dayId }) {
  const [rows, setRows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);

  const [lastFile, setLastFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const [fileType, setFileType] = useState("");

  // التاريخ الذى يختاره المستخدم
  const [reportDate, setReportDate] = useState("");

  /* ===========================
     Load Cinemas & Movies
  =========================== */

  useEffect(() => {
    async function loadLists() {
      const [{ data: cinemaData }, { data: movieData }] =
        await Promise.all([
          supabase
            .from("cinemas")
            .select("id,name")
            .order("name"),

          supabase
            .from("movies")
            .select("id,title")
            .order("title"),
        ]);

      setCinemas(cinemaData || []);
      setMovies(movieData || []);
    }

    loadLists();
  }, []);

  /* ===========================
     Detect File Type
  =========================== */

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

    if (["png", "jpg", "jpeg"].includes(ext))
      return "Image";

    if (ext === "txt")
      return "Text";

    return "Unknown";
  }

  /* ===========================
     Reload Preview
  =========================== */

  const reloadPreview = useCallback(async () => {
    if (!lastFile) return;

    try {
      const parsed = await importEngine(lastFile);

      setRows(parsed.rows || []);

      setDebug(
        `Rows Parsed : ${parsed.rows?.length || 0}`
      );
    } catch (err) {
      console.error(err);
    }
  }, [lastFile]);

  useEffect(() => {
    window.addEventListener(
      "alias-created",
      reloadPreview
    );

    return () =>
      window.removeEventListener(
        "alias-created",
        reloadPreview
      );
  }, [reloadPreview]);

  /* ===========================
     Parse File
  =========================== */

  async function handleFile(file) {
    try {
      if (!reportDate) {
        alert("Please select report date first.");
        return;
      }

      setLoading(true);

      setRows([]);
      setError("");
      setDebug("");

      setLastFile(file);

      setFileType(detectType(file));

      const parsed = await importEngine(file);

      if (
        !parsed.rows ||
        parsed.rows.length === 0
      ) {
        setError(
          "No records found inside this file."
        );
        return;
      }

      setRows(parsed.rows);

      setDebug(
        `Rows Parsed : ${parsed.rows.length}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Import failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===========================
     Import
  =========================== */

  async function handleImport() {
    try {
      if (!reportDate) {
        alert("Please select report date.");
        return;
      }

      setLoading(true);

      const result = await saveReports({
        reportDate,
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
      setDebug("");
      setError("");
      setFileType("");
    } catch (err) {
      console.error(err);

      alert("Import failed.");
    } finally {
      setLoading(false);
    }
  }
  "use client";

import { useState, useEffect, useCallback } from "react";

import ImportUploader from "./ImportUploader";
import ImportPreview from "./ImportPreview";

import { importEngine } from "../../lib/import/engine";
import { saveReports } from "../../lib/import/saveReports";
import { supabase } from "../../lib/supabase";

export default function ImportCenter({ dayId }) {
  const [rows, setRows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);

  const [lastFile, setLastFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const [fileType, setFileType] = useState("");

  // التاريخ الذى يختاره المستخدم
  const [reportDate, setReportDate] = useState("");

  /* ===========================
     Load Cinemas & Movies
  =========================== */

  useEffect(() => {
    async function loadLists() {
      const [{ data: cinemaData }, { data: movieData }] =
        await Promise.all([
          supabase
            .from("cinemas")
            .select("id,name")
            .order("name"),

          supabase
            .from("movies")
            .select("id,title")
            .order("title"),
        ]);

      setCinemas(cinemaData || []);
      setMovies(movieData || []);
    }

    loadLists();
  }, []);

  /* ===========================
     Detect File Type
  =========================== */

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

    if (["png", "jpg", "jpeg"].includes(ext))
      return "Image";

    if (ext === "txt")
      return "Text";

    return "Unknown";
  }

  /* ===========================
     Reload Preview
  =========================== */

  const reloadPreview = useCallback(async () => {
    if (!lastFile) return;

    try {
      const parsed = await importEngine(lastFile);

      setRows(parsed.rows || []);

      setDebug(
        `Rows Parsed : ${parsed.rows?.length || 0}`
      );
    } catch (err) {
      console.error(err);
    }
  }, [lastFile]);

  useEffect(() => {
    window.addEventListener(
      "alias-created",
      reloadPreview
    );

    return () =>
      window.removeEventListener(
        "alias-created",
        reloadPreview
      );
  }, [reloadPreview]);

  /* ===========================
     Parse File
  =========================== */

  async function handleFile(file) {
    try {
      if (!reportDate) {
        alert("Please select report date first.");
        return;
      }

      setLoading(true);

      setRows([]);
      setError("");
      setDebug("");

      setLastFile(file);

      setFileType(detectType(file));

      const parsed = await importEngine(file);

      if (
        !parsed.rows ||
        parsed.rows.length === 0
      ) {
        setError(
          "No records found inside this file."
        );
        return;
      }

      setRows(parsed.rows);

      setDebug(
        `Rows Parsed : ${parsed.rows.length}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Import failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===========================
     Import
  =========================== */

  async function handleImport() {
    try {
      if (!reportDate) {
        alert("Please select report date.");
        return;
      }

      setLoading(true);

      const result = await saveReports({
        reportDate,
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
      setDebug("");
      setError("");
      setFileType("");
    } catch (err) {
      console.error(err);

      alert("Import failed.");
    } finally {
      setLoading(false);
    }
  }