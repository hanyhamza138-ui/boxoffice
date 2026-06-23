import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { deleteMovie } from "../../actions";

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page || 1);
  const search = searchParams?.search || "";

  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: moviesData, count } = await supabase
    .from("movies")
    .select("*", { count: "exact" })
    .range(from, to);

  const movies = moviesData || [];

  const filteredMovies = search
    ? movies.filter((m) =>
        (m.title || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : movies;

  const totalPages = Math.max(
    1,
    Math.ceil((count || 0) / limit)
  );

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h1>🎬 Movies Management</h1>

        <Link href="/admin/add">
          <button
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ➕ Add Movie
          </button>
        </Link>
      </div>

      <form
        method="GET"
        style={{
          marginBottom: "20px",
        }}
      >
        <input
          name="search"
          placeholder="Search movies..."
          defaultValue={search}
          style={{
            padding: "10px",
            width: "300px",
            marginRight: "10px",
            borderRadius: "8px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1c1c1c",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Revenue</th>
            <th style={thStyle}>Audience</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredMovies.map((movie) => (
            <tr
              key={movie.id}
              style={{
                borderTop: "1px solid #333",
              }}
            >
              <td style={tdStyle}>{movie.id}</td>

              <td style={tdStyle}>{movie.title}</td>

              <td style={tdStyle}>
                {(movie.revenue || 0).toLocaleString()}
              </td>

              <td style={tdStyle}>
                {(movie.audience || 0).toLocaleString()}
              </td>

              <td style={tdStyle}>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <Link
                    href={`/admin/movie/edit/${movie.id}`}
                  >
                    <button
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </Link>

                  <form action={deleteMovie}>
                    <input
                      type="hidden"
                      name="id"
                      value={movie.id}
                    />

                    <button
                      type="submit"
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
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

      <div
        style={{
          marginTop: "25px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <a
          href={`?page=${page - 1}&search=${search}`}
          style={{
            pointerEvents: page <= 1 ? "none" : "auto",
            opacity: page <= 1 ? 0.5 : 1,
            color: "white",
          }}
        >
          ⬅ Prev
        </a>

        <span>
          Page {page} of {totalPages}
        </span>

        <a
          href={`?page=${page + 1}&search=${search}`}
          style={{
            pointerEvents:
              page >= totalPages ? "none" : "auto",
            opacity:
              page >= totalPages ? 0.5 : 1,
            color: "white",
          }}
        >
          Next ➡
        </a>
      </div>
    </main>
  );
}

const thStyle = {
  padding: "12px",
  textAlign: "left",
  background: "#222",
};

const tdStyle = {
  padding: "12px",
};