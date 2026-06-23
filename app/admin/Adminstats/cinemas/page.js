import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { deleteCinema } from "../../../actions";


export default async function CinemasPage() {

  const { data, error } = await supabase
    .from("cinemas")
    .select("*")
    .order("id", { ascending:true });


  const cinemas = data || [];


  return (

    <main
      style={{
        background:"#0b0b0b",
        color:"white",
        minHeight:"100vh",
        padding:40
      }}
    >


      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          marginBottom:30
        }}
      >

        <div>

          <h1>
            🎥 Cinemas Management
          </h1>

          <p style={{color:"#999"}}>
            Total Cinemas: {cinemas.length}
          </p>

        </div>



        <Link href="/admin/Adminstats/cinemas/add">

          <button style={addBtn}>
            ➕ Add Cinema
          </button>

        </Link>


      </div>



      {error && <p>Error loading cinemas</p>}



      <table
        style={{
          width:"100%",
          background:"#171717",
          borderCollapse:"collapse"
        }}
      >

        <thead>

          <tr>

            <th style={th}>ID</th>
            <th style={th}>Cinema</th>
            <th style={th}>City</th>
            <th style={th}>Screens</th>
            <th style={th}>Seats</th>
            <th style={th}>Owner</th>
            <th style={th}>Actions</th>

          </tr>

        </thead>


        <tbody>


        {cinemas.map((cinema)=>(

          <tr key={cinema.id}>


            <td style={td}>
              {cinema.id}
            </td>


            <td style={td}>
              {cinema.name}
            </td>


            <td style={td}>
              {cinema.city}
            </td>


            <td style={td}>
              {cinema.screens_count || "-"}
            </td>


            <td style={td}>
              {cinema.seats_count || "-"}
            </td>


            <td style={td}>
              {cinema.owner || "-"}
            </td>


            <td style={td}>


              <Link href={`/admin/Adminstats/cinemas/edit/${cinema.id}`}>

                <button style={editBtn}>
                  ✏️ Edit
                </button>

              </Link>



              <form action={deleteCinema}
                style={{display:"inline"}}
              >

                <input
                  type="hidden"
                  name="id"
                  value={cinema.id}
                />

                <button style={deleteBtn}>
                  🗑 Delete
                </button>


              </form>


            </td>


          </tr>


        ))}


        </tbody>


      </table>


    </main>

  );
}




const th={
padding:15,
textAlign:"left",
background:"#222"
};


const td={
padding:15,
borderTop:"1px solid #333"
};



const addBtn={
background:"#2563eb",
color:"white",
padding:"12px 20px",
border:"none",
borderRadius:8,
cursor:"pointer"
};



const editBtn={
background:"#2563eb",
color:"white",
border:"none",
padding:"8px 12px",
borderRadius:6,
marginRight:10
};



const deleteBtn={
background:"#dc2626",
color:"white",
border:"none",
padding:"8px 12px",
borderRadius:6
};