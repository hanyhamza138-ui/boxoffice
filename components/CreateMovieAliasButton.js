"use client";

import { useState } from "react";
import { createMovieAlias } from "../actions/aliases";

export default function CreateMovieAliasButton({
  alias,
  movies = [],
}) {
  const [movieId, setMovieId] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function handleSave() {
    if (!movieId) {
      alert("Select movie first");
      return;
    }

    try {
      setSaving(true);

      const result =
        await createMovieAlias({
          alias,
          movieId,
        });

      if (!result.success) {
        alert(result.message);
        return;
      }

      window.dispatchEvent(
        new Event("alias-created")
      );

      alert("✅ Movie Alias Created");

    } catch (e) {
      console.error(e);

      alert("Failed to create alias");

    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <select
        value={movieId}
        onChange={(e) =>
          setMovieId(e.target.value)
        }
        style={{
          padding: 8,
          borderRadius: 8,
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          minWidth: 240,
        }}
      >
        <option value="">
          Select Movie
        </option>

        {movies.map((m) => (
          <option
            key={m.id}
            value={m.id}
          >
            {m.title}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "8px 14px",
          border: "none",
          borderRadius: 8,
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {saving
          ? "Saving..."
          : "💾 Save Alias"}
      </button>
    </div>
  );
}