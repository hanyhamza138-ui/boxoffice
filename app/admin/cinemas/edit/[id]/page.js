import { supabase } from "../../../../../lib/supabase";
import { updateCinema } from "../../../../actions";

export default async function EditCinemaPage({
  params,
}) {
  const { id } = await params;

  const { data: cinema, error } = await supabase
    .from("cinemas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cinema) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>Cinema Not Found</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >
      <h1
        style={{
          fontSize: 40,
          marginBottom: 30,
        }}
      >
        ✏️ Edit Cinema
      </h1>

      <form
        action={updateCinema}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 600,
        }}
      >
        <input
          type="hidden"
          name="id"
          defaultValue={cinema.id}
        />

        <input
          name="name"
          defaultValue={cinema.name}
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="city"
          defaultValue={cinema.city}
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <button
          type="submit"
          style={{
            padding: 14,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}