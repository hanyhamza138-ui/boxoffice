"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCinemaAlias } from "../../actions/aliases";

export default function AddCinemaAlias({
  cinemas = [],
}) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  const [alias, setAlias] =
    useState("");

  const [cinemaId, setCinemaId] =
    useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!alias.trim()) {
      alert("Enter alias");
      return;
    }

    if (!cinemaId) {
      alert("Choose cinema");
      return;
    }

    startTransition(async () => {
      const result =
        await createCinemaAlias({
          alias,
          cinemaId,
        });

      if (!result.success) {
        alert(result.message);
        return;
      }

      setAlias("");
      setCinemaId("");

      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#1c1c1c",
        padding: 20,
        borderRadius: 12,
        display: "grid",
        gap: 15,
      }}
    >
      <h3>➕ Add Cinema Alias</h3>

      <input
        value={alias}
        onChange={(e) =>
          setAlias(e.target.value)
        }
        placeholder="Example: سان ستيفانو"
        style={input}
      />

      <select
        value={cinemaId}
        onChange={(e) =>
          setCinemaId(e.target.value)
        }
        style={input}
      >
        <option value="">
          Select Cinema
        </option>

        {cinemas.map((cinema) => (
          <option
            key={cinema.id}
            value={cinema.id}
          >
            {cinema.name}
          </option>
        ))}
      </select>

      <button
        disabled={pending}
        style={button}
      >
        {pending
          ? "Saving..."
          : "💾 Save Alias"}
      </button>
    </form>
  );
}

const input = {
  padding: 12,
  borderRadius: 8,
  background: "#222",
  border: "1px solid #444",
  color: "#fff",
};

const button = {
  padding: 14,
  borderRadius: 8,
  border: "none",
  background: "#16a34a",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};