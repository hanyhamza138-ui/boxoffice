import { supabase } from "../../../../../lib/supabase";
import { updateCinema } from "../../../../actions";
import { cookies } from "next/headers";
import Link from "next/link";

import ar from "@/translations/ar";
import en from "@/translations/en";


export default async function EditCinemaPage({
  params,
}) {


  const { id } = await params;



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
    .eq("id", id)
    .single();




  if (error || !cinema) {

    return (

      <main style={page}>

        <h1>
          ❌ {
            language === "ar"
            ? "السينما غير موجودة"
            : "Cinema Not Found"
          }
        </h1>


        <Link href="/admin/Adminstats/cinemas">

          ← {
            language === "ar"
            ? "رجوع"
            : "Back"
          }

        </Link>


      </main>

    );

  }





  return (

    <main style={page}>


      <Link href="/admin/Adminstats/cinemas">

        <button style={backBtn}>

          ← {
            language === "ar"
            ? "رجوع للسينمات"
            : "Back To Cinemas"
          }

        </button>


      </Link>





      <h1 style={{
        fontSize:40,
        marginBottom:30
      }}>

        ✏️ {
          language === "ar"
          ? "تعديل السينما"
          : "Edit Cinema"
        }

      </h1>





      <form

        action={updateCinema}

        style={form}

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

          required

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

          required

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

          💾 {
            language==="ar"
            ? "حفظ التعديلات"
            : "Save Changes"
          }

        </button>



      </form>


    </main>

  );

}





const page = {

  background:"#111",

  color:"white",

  minHeight:"100vh",

  padding:40,

};



const form = {

  display:"flex",

  flexDirection:"column",

  gap:15,

  maxWidth:600,

  background:"#171717",

  padding:30,

  borderRadius:15,

};



const input = {

  padding:12,

  borderRadius:8,

  border:"1px solid #444",

  background:"#222",

  color:"white",

};




const saveBtn = {

  padding:14,

  borderRadius:8,

  border:"none",

  cursor:"pointer",

  fontWeight:"bold",

  background:"#2563eb",

  color:"white",

};




const backBtn = {

  padding:"10px 18px",

  marginBottom:25,

  borderRadius:8,

  border:"none",

  background:"#444",

  color:"white",

  cursor:"pointer",

};