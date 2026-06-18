import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { deleteCinema } from "../../../actions";

export default async function CinemasPage() {
  const { data: cinemas = [] } = await supabase
    .from("cinemas")
    .select("*")
    .order("name");

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1>🎥 Cinemas</h1>
          <p style={{ color: "#999" }}>
            Total Cinemas: {cinemas.length}
          </p>
        </div>

        <Link href="/admin/cinemas/add">
          <button
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Add Cinema
          </button>
        </Link>
      </div>

      {cinemas.length === 0 ? (
        <div
          style={{
            background: "#1c1c1c",
            padding: 30,
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          No cinemas found.
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#1c1c1c",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: 15 }}>ID</th>
              <th style={{ padding: 15 }}>Cinema</th>
              <th style={{ padding: 15 }}>City</th>
              <th style={{ padding: 15 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {cinemas.map((cinema) => (
              <tr
                key={cinema.id}
                style={{
                  borderTop: "1px solid #333",
                }}
              >
                <td style={{ padding: 15 }}>
                  {cinema.id}
                </td>

                <td style={{ padding: 15 }}>
                  {cinema.name}
                </td>

                <td style={{ padding: 15 }}>
                  {cinema.city}
                </td>

                <td style={{ padding: 15 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <Link
                      href={`/admin/cinemas/edit/${cinema.id}`}
                    >
                      <button
                        style={{
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </Link>

                    <form action={deleteCinema}>
                      <input
                        type="hidden"
                        name="id"
                        value={cinema.id}
                      />

                      <button
                        type="submit"
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        🗑 Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}