"use client";

import { useState } from "react";
import { createCinemaAlias } from "../actions/aliases";

export default function CreateCinemaAliasButton({
  alias,
  cinemas = [],
}) {
  const [cinemaId, setCinemaId] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function handleSave() {
    if (!cinemaId) {
      alert("Select cinema first");
      return;
    }

    try {
      setSaving(true);

      const result =
        await createCinemaAlias({
          alias,
          cinemaId,
        });

      if (!result.success) {
        alert(result.message);
        return;
      }

      window.dispatchEvent(
        new Event("alias-created")
      );

      alert("✅ Alias created");

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
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <select
        value={cinemaId}
        onChange={(e) =>
          setCinemaId(e.target.value)
        }
        style={{
          padding: 8,
          borderRadius: 8,
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          minWidth: 220,
        }}
      >
        <option value="">
          Select Cinema
        </option>

        {cinemas.map((c) => (
          <option
            key={c.id}
            value={c.id}
          >
            {c.name}
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
          background: "#16a34a",
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