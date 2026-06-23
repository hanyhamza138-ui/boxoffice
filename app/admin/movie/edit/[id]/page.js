import { supabase } from "../../../../../lib/supabase";
import { updateMovie } from "../../../../actions";
import Link from "next/link";

export default async function EditMoviePage({ params }) {

  const { id } = await params;


  const { data: movie, error } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();


  if (error || !movie) {
    return (
      <main
        style={{
          background:"#111",
          color:"white",
          minHeight:"100vh",
          padding:40,
        }}
      >
        <h1>Movie Not Found</h1>

        <Link href="/admin">
          ← Back
        </Link>

      </main>
    );
  }



  return (
    <main
      style={{
        background:"#111",
        color:"white",
        minHeight:"100vh",
        padding:40,
      }}
    >

      <Link href={`/admin/movie/${movie.id}`}>
        <button
          style={{
            padding:"10px 18px",
            borderRadius:8,
            border:"none",
            background:"#444",
            color:"white",
            cursor:"pointer",
            marginBottom:30,
          }}
        >
          ← Back
        </button>
      </Link>


      <h1>
        ✏️ Edit Movie
      </h1>



      <form
        action={updateMovie}
        style={{
          maxWidth:600,
          display:"grid",
          gap:15,
          marginTop:30,
        }}
      >

        <input
          type="hidden"
          name="id"
          value={movie.id}
        />


        <input
          name="title"
          defaultValue={movie.title}
          placeholder="Movie Title"
          style={inputStyle}
        />


        <input
          name="revenue"
          type="number"
          defaultValue={movie.revenue}
          placeholder="Revenue"
          style={inputStyle}
        />


        <input
          name="audience"
          type="number"
          defaultValue={movie.audience}
          placeholder="Audience"
          style={inputStyle}
        />


        <input
          name="cinemas"
          type="number"
          defaultValue={movie.cinemas}
          placeholder="Cinemas"
          style={inputStyle}
        />


        <input
          name="language"
          defaultValue={movie.language || ""}
          placeholder="Language"
          style={inputStyle}
        />


        <input
          name="poster"
          defaultValue={movie.poster || ""}
          placeholder="Poster URL"
          style={inputStyle}
        />


        <input
          name="trailer"
          defaultValue={movie.trailer || ""}
          placeholder="Trailer URL"
          style={inputStyle}
        />



        <button
          type="submit"
          style={{
            background:"#2563eb",
            color:"white",
            padding:14,
            border:"none",
            borderRadius:8,
            cursor:"pointer",
            fontSize:18,
          }}
        >
          💾 Save Changes
        </button>


      </form>


    </main>
  );
}



const inputStyle = {
  padding:12,
  borderRadius:8,
  border:"1px solid #444",
  background:"#222",
  color:"white",
};