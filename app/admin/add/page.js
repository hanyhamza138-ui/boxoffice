import { addMovie } from "../../actions";
import { cookies } from "next/headers";

import ar from "../../../translations/ar";
import en from "../../../translations/en";


export default async function AddMoviePage() {


  const cookieStore = await cookies();


  const language =
    cookieStore.get("language")?.value || "en";


  const t =
    language === "ar"
      ? ar
      : en;




  return (

    <main

      style={{

        background:"#111",

        color:"white",

        minHeight:"100vh",

        padding:40,

      }}

    >



      <h1

        style={{

          fontSize:40,

          marginBottom:30,

        }}

      >

        ➕
        {
          language==="ar"
          ? " إضافة فيلم"
          : " Add Movie"
        }


      </h1>





      <form

        action={addMovie}

        style={{

          display:"flex",

          flexDirection:"column",

          gap:15,

          maxWidth:700,

        }}

      >



        <input

          name="title"

          placeholder={
            language==="ar"
            ? "اسم الفيلم"
            : "Movie Title"
          }

          required

          style={inputStyle}

        />





        <input

          name="revenue"

          type="number"

          placeholder={t.revenue}

          required

          style={inputStyle}

        />





        <input

          name="audience"

          type="number"

          placeholder={t.audience}

          required

          style={inputStyle}

        />





        <input

          name="cinemas"

          type="number"

          placeholder={
            language==="ar"
            ? "عدد دور العرض"
            : "Number of Cinemas"
          }

          required

          style={inputStyle}

        />





        <input

          name="poster"

          placeholder={
            language==="ar"
            ? "رابط البوستر"
            : "Poster URL"
          }

          required

          style={inputStyle}

        />





        <input

          name="language"

          placeholder={t.language}

          required

          style={inputStyle}

        />





        <input

          name="trailer"

          placeholder={
            language==="ar"
            ? "رابط الإعلان"
            : "Trailer URL"
          }

          required

          style={inputStyle}

        />







        <button

          type="submit"

          style={{

            padding:14,

            borderRadius:8,

            border:"none",

            cursor:"pointer",

            fontWeight:"bold",

            background:"#16a34a",

            color:"white",

          }}

        >

          ➕
          {
            language==="ar"
            ? " إضافة الفيلم"
            : " Add Movie"
          }


        </button>





      </form>



    </main>

  );

}





const inputStyle = {

  padding:12,

  borderRadius:8,

  border:"none",

};