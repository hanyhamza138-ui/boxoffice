"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {

  const [title, setTitle] = useState("");
  const [revenue, setRevenue] = useState("");

  async function addMovie() {

    await supabase
      .from("movies")
      .insert([
        {
          title,
          revenue,
        },
      ]);

    alert("Movie Added");
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#111]
        text-white
        p-8
      "
    >

      <h1 className="text-4xl mb-6">
        Add Movie
      </h1>

      <input
        placeholder="Movie Title"
        className="
          block
          p-3
          mb-4
          text-black
          rounded-lg
        "
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        placeholder="Revenue"
        className="
          block
          p-3
          mb-4
          text-black
          rounded-lg
        "
        onChange={(e) =>
          setRevenue(e.target.value)
        }
      />

      <button
        onClick={addMovie}
        className="
          bg-green-500
          px-6
          py-3
          rounded-lg
        "
      >
        Add
      </button>

    </main>
  );
}