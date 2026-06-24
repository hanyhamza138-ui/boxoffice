import { addCinema } from "../../../actions";
import { cookies } from "next/headers";

import ar from "../../../../translations/ar";
import en from "../../../../translations/en";


export default async function AddCinemaPage() {


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
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: 40,
      }}
    >


      <h1
        style={{
          fontSize: 40,
          marginBottom: 30,
        }}
      >

        🎥 {t.addCinema}

      </h1>




      <form
        action={addCinema}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 600,
        }}
      >



        <input
          name="name"
          placeholder={t.cinemaName}
          required
          style={inputStyle}
        />



        <input
          name="city"
          placeholder={t.city}
          required
          style={inputStyle}
        />



        <input
          name="owner"
          placeholder={t.owner}
          style={inputStyle}
        />



        <input
          name="screens_count"
          type="number"
          placeholder={t.screens}
          style={inputStyle}
        />



        <input
          name="seats_count"
          type="number"
          placeholder={t.seats}
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
            background:"#2563eb",
            color:"white",
          }}
        >

          💾 {t.saveChanges}

        </button>



      </form>


    </main>

  );
}



const inputStyle = {

  padding:12,
  borderRadius:8,
  background:"#222",
  color:"white",
  border:"1px solid #444",

};