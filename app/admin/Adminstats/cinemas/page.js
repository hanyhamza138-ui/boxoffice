import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { deleteCinema } from "../../../actions";

export default async function CinemasPage() {
  const { data, error } = await supabase
    .from("cinemas")
    .select("*")
    .order("id", { ascending: true });

  const cinemas = data || [];

  const totalScreens = cinemas.reduce(
    (sum, cinema) => sum + (cinema.screens_count || 0),
    0
  );

  const totalSeats = cinemas.reduce(
    (sum, cinema) => sum + (cinema.seats_count || 0),
    0
  );

  return (
    <main
      style={{
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
            }}
          >
            🎥 Cinemas Management
          </h1>

          <p
            style={{
              color: "#9ca3af",
              marginTop: 8,
            }}
          >
            Manage all cinemas from one place
          </p>
        </div>

        <Link href="/admin/Adminstats/cinemas/add">
          <button style={addBtn}>
            ➕ Add Cinema
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <div style={card}>
          <h3 style={cardTitle}>🏢 Total Cinemas</h3>
          <h2>{cinemas.length}</h2>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>🎬 Total Screens</h3>
          <h2>{totalScreens.toLocaleString()}</h2>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>💺 Total Seats</h3>
          <h2>{totalSeats.toLocaleString()}</h2>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#7f1d1d",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          Error loading cinemas
        </div>
      )}

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          background: "#161616",
          borderRadius: 16,
          border: "1px solid #262626",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Cinema</th>
              <th style={th}>City</th>
              <th style={th}>Screens</th>
              <th style={th}>Seats</th>
              <th style={th}>Owner</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {cinemas.map((cinema, index) => (
              <tr
                key={cinema.id}
                style={{
                  borderTop: "1px solid #262626",
                }}
              >
                <td style={td}>{index + 1}</td>

                <td style={td}>
                  <strong>{cinema.name}</strong>
                </td>

                <td style={td}>{cinema.city}</td>

                <td style={td}>
                  {cinema.screens_count?.toLocaleString() || "-"}
                </td>

                <td style={td}>
                  {cinema.seats_count?.toLocaleString() || "-"}
                </td>

                <td style={td}>
                  {cinema.owner || "-"}
                </td>

                <td style={td}>
                  <Link
                    href={`/admin/Adminstats/cinemas/edit/${cinema.id}`}
                  >
                    <button style={editBtn}>
                      ✏️ Edit
                    </button>
                  </Link>

                  <form
                    action={deleteCinema}
                    style={{
                      display: "inline",
                    }}
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={cinema.id}
                    />

                    <button style={deleteBtn}>
                      🗑 Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const card = {
  background: "#171717",
  border: "1px solid #262626",
  borderRadius: 16,
  padding: 20,
};

const cardTitle = {
  color: "#9ca3af",
  marginBottom: 10,
};

const th = {
  padding: 16,
  textAlign: "left",
  background: "#1f1f1f",
};

const td = {
  padding: 16,
};

const addBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};

const editBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  marginRight: 8,
  cursor: "pointer",
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};