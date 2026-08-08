"use client";

import { useRef, useState } from "react";

export default function ImportUploader({
  title = "📥 Smart Import",
  accept = "",
  onSelect,
}) {
  const inputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     OPEN FILE SELECTOR
  ===================================================== */

  function chooseFile() {
    inputRef.current?.click();
  }

  /* =====================================================
     HANDLE FILE
  ===================================================== */

  function handleChange(event) {
    try {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setError("");
      setFileName(file.name);

      console.log(
        "📂 Selected File:",
        file.name
      );

      /* -----------------------------------------------
         IMPORTANT:
         Make sure onSelect is actually a function
      ----------------------------------------------- */

      if (typeof onSelect !== "function") {
        console.error(
          "ImportUploader Error: onSelect is not a function.",
          {
            onSelect,
            file,
          }
        );

        setError(
          "Import handler is not available."
        );

        return;
      }

      onSelect(file);

      /* -----------------------------------------------
         Allow selecting the same file again
      ----------------------------------------------- */

      event.target.value = "";
    } catch (err) {
      console.error(
        "ImportUploader handleChange Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to select file."
      );
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: 16,
        padding: 30,
        textAlign: "center",
        border: "1px solid #333",
      }}
    >
      {/* TITLE */}

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      {/* DESCRIPTION */}

      <p
        style={{
          color: "#9ca3af",
          marginBottom: 20,
        }}
      >
        اختر ملفاً للاستيراد
      </p>

      {/* FILE BUTTON */}

      <button
        type="button"
        onClick={chooseFile}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        📂 Choose File
      </button>

      {/* HIDDEN INPUT */}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
      />

      {/* FILE NAME */}

      {fileName && (
        <div
          style={{
            marginTop: 20,
            color: "#22c55e",
            fontWeight: 700,
            wordBreak: "break-word",
          }}
        >
          ✅ {fileName}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginTop: 15,
            background: "#7f1d1d",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          ❌ {error}
        </div>
      )}
    </div>
  );
}