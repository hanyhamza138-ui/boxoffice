import { addMovie } from "../../actions";

export default function AddMoviePage() {
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
        ➕ Add Movie
      </h1>

      <form
        action={addMovie}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 600,
        }}
      >
        <input
          name="title"
          placeholder="Movie Title"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="revenue"
          type="number"
          placeholder="Revenue"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="poster"
          placeholder="Poster URL"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="language"
          placeholder="Language"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="trailer"
          placeholder="Trailer URL"
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
          Add Movie
        </button>
      </form>
    </main>
  );
}