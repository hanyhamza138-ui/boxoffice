import { addCinema } from "../../../../actions";
import { cookies } from "next/headers";

import ar from "../../../../../translations/ar";
import en from "../../../../../translations/en";


export default async function AddCinema() {


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

        ➕
        {
          language==="ar"
          ? "إضافة سينما"
          : "Add Cinema"
        }


      </h1>







      <form

        action={addCinema}

        style={{

          background:"#171717",

          padding:30,

          borderRadius:15,

          width:450

        }}

      >





        <label>

          {
            language==="ar"
            ? "اسم السينما"
            : "Cinema Name"
          }

        </label>



        <input

          name="name"

          placeholder={
            language==="ar"
            ? "اسم السينما"
            : "Cinema Name"
          }

          required

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

          placeholder={
            language==="ar"
            ? "المدينة"
            : "City"
          }

          required

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

          placeholder={
            language==="ar"
            ? "المالك / الشركة"
            : "Owner / Company"
          }

          required

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

          name="screens_count"

          type="number"

          placeholder={
            language==="ar"
            ? "عدد الشاشات"
            : "Screens Count"
          }

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

          name="seats_count"

          type="number"

          placeholder={
            language==="ar"
            ? "عدد المقاعد"
            : "Seats Count"
          }

          style={input}

        />








        <button

          style={saveBtn}

        >

          💾
          {
            language==="ar"
            ? "حفظ السينما"
            : "Save Cinema"
          }


        </button>





      </form>





    </main>

  );

}






const input = {

  display:"block",

  width:"100%",

  padding:12,

  marginTop:8,

  marginBottom:20,

  borderRadius:8,

  border:"1px solid #444",

  background:"#222",

  color:"white",

  fontSize:16

};





const saveBtn = {

  width:"100%",

  padding:"14px",

  background:"#2563eb",

  color:"white",

  border:"none",

  borderRadius:10,

  cursor:"pointer",

  fontWeight:"bold",

  fontSize:16

};