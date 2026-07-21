"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCinemaAlias } from "../actions/aliases";

export default function CreateCinemaAliasButton({
  alias,
  cinemas,
}) {
  const router = useRouter();

  const [cinemaId, setCinemaId] = useState("");

  const [pending, startTransition] =
    useTransition();

  function save() {
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

      alert("✅ Alias Created");

      router.refresh();
    });
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 8,
      }}
    >
      <select
        value={cinemaId}
        onChange={(e) =>
          setCinemaId(e.target.value)
        }
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
        onClick={save}
        disabled={pending}
      >
        ➕ Create Alias
      </button>
    </div>
  );
}