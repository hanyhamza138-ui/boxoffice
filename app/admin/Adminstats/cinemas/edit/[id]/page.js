import { supabase } from "../../../../../../lib/supabase";
import { updateCinema } from "../../../../../actions";
import Link from "next/link";
import { cookies } from "next/headers";

import ar from "../../../../../../translations/ar";
import en from "../../../../../../translations/en";



export default async function EditCinema({ params }) {


  const { id } = await params;


  const cinemaId = Number(id);



  const cookieStore = await cookies();


  const language =
    cookieStore.get("language")?.value || "en";


  const t =
    language === "ar"
      ? ar
      : en;





  const { data: cinema, error } = await supabase
    .from("cinemas")
    .select("*")
    .eq("id", cinemaId)
    .single();





  if (error || !cinema) {


    return (

      <main
        style={{
          background:"#0b0b0b",
          color:"white",
          minHeight:"100vh",
          padding:40
        }}
      >

        <h1>

          {
            language==="ar"
            ? "السينما غير موجودة"
            : "Cinema Not Found"
          }

        </h1>



        <Link href="/admin/Adminstats/cinemas">

          {
            language==="ar"
            ? "رجوع"
            : "Back"
          }

        </Link>


      </main>

    );

  }







  return (

    <main
      style={{
        background:"#0b0b0b",
        color:"white",
        minHeight:"100vh",
        padding:40
      }}
    >




      <h1
        style={{
          fontSize:36,
          marginBottom:30
        }}
      >

        ✏️

        {
          language==="ar"
          ? "تعديل السينما"
          : "Edit Cinema"
        }


      </h1>






      <form

        action={updateCinema}

        style={{
          background:"#171717",
          padding:30,
          borderRadius:15,
          maxWidth:500
        }}

      >




        <input
          type="hidden"
          name="id"
          value={cinema.id}
        />





        <label>

          {
            language==="ar"
            ? "اسم السينما"
            : "Cinema Name"
          }

        </label>


        <input

          name="name"

          defaultValue={cinema.name || ""}

          style={input}

        />






        <label>

          {
            language==="ar"
            ? "المدينة"
            : "City"
          }

        </label>


        <input

          name="city"

          defaultValue={cinema.city || ""}

          style={input}

        />







        <label>

          {
            language==="ar"
            ? "المالك / الشركة"
            : "Owner / Company"
          }

        </label>



        <input

          name="owner"

          defaultValue={cinema.owner || ""}

          style={input}

        />








        <label>

          {
            language==="ar"
            ? "عدد الشاشات"
            : "Screens Count"
          }

        </label>



        <input

          type="number"

          name="screens_count"

          defaultValue={cinema.screens_count || 0}

          style={input}

        />








        <label>

          {
            language==="ar"
            ? "عدد المقاعد"
            : "Seats Count"
          }

        </label>



        <input

          type="number"

          name="seats_count"

          defaultValue={cinema.seats_count || 0}

          style={input}

        />








        <button style={saveBtn}>

          💾

          {
            language==="ar"
            ? "حفظ التعديلات"
            : "Save Changes"
          }


        </button>




      </form>






      <Link href="/admin/Adminstats/cinemas">


        <button style={backBtn}>

          ←

          {
            language==="ar"
            ? "العودة للسينمات"
            : "Back To Cinemas"
          }


        </button>


      </Link>





    </main>

  );

}






const input = {

  display:"block",

  width:"100%",

  padding:12,

  marginTop:8,

  marginBottom:20,

  background:"#222",

  color:"white",

  border:"1px solid #444",

  borderRadius:8,

  fontSize:16

};





const saveBtn = {

  width:"100%",

  padding:14,

  background:"#2563eb",

  color:"white",

  border:"none",

  borderRadius:10,

  cursor:"pointer",

  fontWeight:"bold",

  fontSize:16

};





const backBtn = {

  marginTop:20,

  padding:"12px 20px",

  background:"#444",

  color:"white",

  border:"none",

  borderRadius:8,

  cursor:"pointer"

};