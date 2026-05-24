import RevenueChart from "../../components/RevenueChart";
import TopMovies from "../../components/TopMovies";
import StatsCards from "../../components/StatsCards";

export default function DashboardPage() {
  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: 30,
      }}
    >
      <h1
        style={{
          fontSize: 40,
          marginBottom: 30,
        }}
      >
        📊 Dashboard
      </h1>

      <div style={{ marginBottom: 30 }}>
        <StatsCards />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
        }}
      >
        <RevenueChart />

        <TopMovies />
      </div>
    </div>
  );
}