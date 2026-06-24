import { supabase } from "../../../../../lib/supabase";
import { updateMovie } from "../../../../actions";
import Link from "next/link";
import { cookies } from "next/headers";

import ar from "../../../../../translations/ar";
import en from "../../../../../translations/en";



export default async function EditMoviePage({ params }) {


  const { id } = await params;



  const cookieStore = await cookies();


  const language =
    cookieStore.get("language")?.value || "en";


  const t =
    language === "ar"
      ? ar
      : en;





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

        <h1>

          {
            language==="ar"
            ? "الفيلم غير موجود"
            : "Movie Not Found"
          }

        </h1>



        <Link href="/admin">

          {
            language==="ar"
            ? "← رجوع"
            : "← Back"
          }

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

          {
            language==="ar"
            ? "→ رجوع"
            : "← Back"
          }


        </button>


      </Link>







      <h1>

        ✏️
        {
          language==="ar"
          ? " تعديل الفيلم"
          : " Edit Movie"
        }

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

          placeholder={
            language==="ar"
            ? "اسم الفيلم"
            : "Movie Title"
          }

          style={inputStyle}

        />








        <input

          name="revenue"

          type="number"

          defaultValue={movie.revenue}

          placeholder={t.revenue}

          style={inputStyle}

        />








        <input

          name="audience"

          type="number"

          defaultValue={movie.audience}

          placeholder={t.audience}

          style={inputStyle}

        />








        <input

          name="cinemas"

          type="number"

          defaultValue={movie.cinemas}

          placeholder={t.cinemas}

          style={inputStyle}

        />








        <input

          name="language"

          defaultValue={movie.language || ""}

          placeholder={t.language}

          style={inputStyle}

        />








        <input

          name="poster"

          defaultValue={movie.poster || ""}

          placeholder={
            language==="ar"
            ? "رابط البوستر"
            : "Poster URL"
          }

          style={inputStyle}

        />








        <input

          name="trailer"

          defaultValue={movie.trailer || ""}

          placeholder={
            language==="ar"
            ? "رابط الإعلان"
            : "Trailer URL"
          }

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

          💾
          {
            language==="ar"
            ? " حفظ التعديلات"
            : " Save Changes"
          }


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