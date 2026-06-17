import { supabase } from "../../lib/supabase";
import { deleteMovie } from "../actions/movies";

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page || 1);
  const search = searchParams?.search || "";

  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: movies, count } = await supabase
    .from("movies")
    .select("*", { count: "exact" })
    .range(from, to);

  const filteredMovies = search
    ? (movies || []).filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase())
      )
    : movies || [];

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔍 Search */}
      <form method="GET" style={{ marginBottom: "20px" }}>
        <input
          name="search"
          placeholder="Search movies..."
          defaultValue={search}
          style={{
            padding: "8px",
            width: "300px",
            marginRight: "10px",
          }}
        />
        <button type="submit">Search</button>
      </form>

      {/* 📊 Table */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredMovies.map((movie) => (
            <tr key={movie.id}>
              <td>{movie.title}</td>

              <td>
                {/* 🗑️ Delete Form (Production Safe) */}
                <form
                  action={deleteMovie}
                  onSubmit={(e) => {
                    const confirmDelete = confirm(
                      "Are you sure you want to delete this movie?"
                    );

                    if (!confirmDelete) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={movie.id} />

                  <button
                    type="submit"
                    style={{
                      color: "red",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 Pagination */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <a
          href={`?page=${page - 1}&search=${search}`}
          style={{
            pointerEvents: page <= 1 ? "none" : "auto",
            opacity: page <= 1 ? 0.5 : 1,
          }}
        >
          Prev
        </a>

        <span>
          Page {page} of {totalPages}
        </span>

        <a
          href={`?page=${page + 1}&search=${search}`}
          style={{
            pointerEvents: page >= totalPages ? "none" : "auto",
            opacity: page >= totalPages ? 0.5 : 1,
          }}
        >
          Next
        </a>
      </div>
    </div>
  );
}