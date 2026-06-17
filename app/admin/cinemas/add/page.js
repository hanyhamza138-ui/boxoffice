import { addCinema } from "../../../actions";

export default function AddCinemaPage() {
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
        🎥 Add Cinema
      </h1>

      <form
        action={addCinema}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 600,
        }}
      >
        <input
          name="name"
          placeholder="Cinema Name"
          required
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <input
          name="city"
          placeholder="City"
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
          Save Cinema
        </button>
      </form>
    </main>
  );
}