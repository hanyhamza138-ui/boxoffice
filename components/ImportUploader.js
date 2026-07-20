"use client";

import { useRef, useState } from "react";

export default function ImportUploader({
  title,
  accept,
  onSelect,
}) {
  const inputRef = useRef(null);

  const [fileName, setFileName] =
    useState("");

  function chooseFile() {
    inputRef.current?.click();
  }

  function handleChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    onSelect?.(file);
  }

  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: 16,
        padding: 30,
        textAlign: "center",
      }}
    >
      <h2>{title}</h2>

      <p
        style={{
          color: "#9ca3af",
        }}
      >
        اختر ملفاً للاستيراد
      </p>

      <button
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

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
      />

      {fileName && (
        <div
          style={{
            marginTop: 20,
            color: "#22c55e",
            fontWeight: 700,
          }}
        >
          ✅ {fileName}
        </div>
      )}
    </div>
  );
}