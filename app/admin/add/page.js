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
➕ Add Movie </h1>

```
  <form
    action={addMovie}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 15,
      maxWidth: 700,
    }}
  >
    <input
      name="title"
      placeholder="Movie Title"
      required
      style={inputStyle}
    />

    <input
      name="revenue"
      type="number"
      placeholder="Revenue"
      required
      style={inputStyle}
    />

    <input
      name="audience"
      type="number"
      placeholder="Audience"
      required
      style={inputStyle}
    />

    <input
      name="cinemas"
      type="number"
      placeholder="Number of Cinemas"
      required
      style={inputStyle}
    />

    <input
      name="poster"
      placeholder="Poster URL"
      required
      style={inputStyle}
    />

    <input
      name="language"
      placeholder="Language"
      required
      style={inputStyle}
    />

    <input
      name="trailer"
      placeholder="Trailer URL"
      required
      style={inputStyle}
    />

    <button
      type="submit"
      style={{
        padding: 14,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        background: "#16a34a",
        color: "white",
      }}
    >
      Add Movie
    </button>
  </form>
</main>

);
}

const inputStyle = {
padding: 12,
borderRadius: 8,
border: "none",
};