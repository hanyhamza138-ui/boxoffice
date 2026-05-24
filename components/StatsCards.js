export default function StatsCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 20,
      }}
    >
      <div
        style={{
          background: "#1c1c1c",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h3>💰 Revenue</h3>

        <p>$120,000</p>
      </div>

      <div
        style={{
          background: "#1c1c1c",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h3>🎟 Tickets</h3>

        <p>32,000</p>
      </div>

      <div
        style={{
          background: "#1c1c1c",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h3>🍿 Visitors</h3>

        <p>14,500</p>
      </div>
    </div>
  );
}