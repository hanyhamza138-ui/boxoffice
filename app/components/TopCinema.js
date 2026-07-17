export default function TopMovies() {
  return (
    <div
      style={{
        background: "#1c1c1c",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h2>🎬 Top Movies</h2>

      <ul
        style={{
          marginTop: 20,
          lineHeight: 2,
        }}
      >
        <li>Mission Impossible</li>
        <li>Avengers Endgame</li>
        <li>Oppenheimer</li>
      </ul>
    </div>
  );
}