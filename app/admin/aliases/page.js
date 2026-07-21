import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import AdminNav from "../../components/AdminNav";
import AddCinemaAlias from "./AddCinemaAlias";

export const dynamic = "force-dynamic";

export default async function AliasesPage() {
  // Cinema Aliases
  const { data: cinemaAliases = [] } = await supabase
    .from("cinema_aliases")
    .select(`
      id,
      alias,
      cinema:cinema_id (
        id,
        name
      )
    `)
    .order("alias");

  // Cinemas List
  const { data: cinemaList = [] } = await supabase
    .from("cinemas")
    .select("id,name")
    .order("name");

  // Movie Aliases
  const { data: movieAliases = [] } = await supabase
    .from("movie_aliases")
    .select(`
      id,
      alias,
      movie:movie_id (
        id,
        title
      )
    `)
    .order("alias");

  return (
    <main
      style={{
        padding: 30,
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <AdminNav />

      <h1
        style={{
          fontSize: 36,
          marginBottom: 20,
        }}
      >
        🎯 Alias Manager
      </h1>

      <Link
        href="/admin"
        style={{
          color: "#60a5fa",
          textDecoration: "none",
        }}
      >
        ← Back
      </Link>

      {/* Add Cinema Alias */}

      <div
        style={{
          marginTop: 35,
          marginBottom: 35,
        }}
      >
        <AddCinemaAlias
          cinemas={cinemaList}
        />
      </div>

      {/* Cinema Aliases */}

      <h2
        style={{
          marginBottom: 15,
        }}
      >
        🎬 Cinema Aliases
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 45,
        }}
      >
        <thead>
          <tr>
            <th style={th}>Alias</th>
            <th style={th}>Cinema</th>
          </tr>
        </thead>

        <tbody>
          {cinemaAliases.length === 0 ? (
            <tr>
              <td
                style={td}
                colSpan={2}
              >
                No Cinema Aliases
              </td>
            </tr>
          ) : (
            cinemaAliases.map((row) => (
              <tr key={row.id}>
                <td style={td}>
                  {row.alias}
                </td>

                <td style={td}>
                  {row.cinema?.name}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Movie Aliases */}

      <h2
        style={{
          marginBottom: 15,
        }}
      >
        🎥 Movie Aliases
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Alias</th>
            <th style={th}>Movie</th>
          </tr>
        </thead>

        <tbody>
          {movieAliases.length === 0 ? (
            <tr>
              <td
                style={td}
                colSpan={2}
              >
                No Movie Aliases
              </td>
            </tr>
          ) : (
            movieAliases.map((row) => (
              <tr key={row.id}>
                <td style={td}>
                  {row.alias}
                </td>

                <td style={td}>
                  {row.movie?.title}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}

const th = {
  padding: 12,
  background: "#222",
  textAlign: "left",
  borderBottom: "1px solid #333",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #333",
};