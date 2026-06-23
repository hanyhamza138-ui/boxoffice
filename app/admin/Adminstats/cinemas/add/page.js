import { addCinema } from "../../../../actions";


export default function AddCinema() {

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
        ➕ Add Cinema
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
          Cinema Name
        </label>

        <input
          name="name"
          placeholder="Cinema Name"
          required
          style={input}
        />



        <label>
          City
        </label>

        <input
          name="city"
          placeholder="City"
          required
          style={input}
        />



        <label>
          Owner / Company
        </label>

        <input
          name="owner"
          placeholder="Owner / Company"
          required
          style={input}
        />



        <label>
          Screens Count
        </label>

        <input
          name="screens_count"
          type="number"
          placeholder="Screens Count"
          style={input}
        />



        <label>
          Seats Count
        </label>

        <input
          name="seats_count"
          type="number"
          placeholder="Seats Count"
          style={input}
        />



        <button
          style={saveBtn}
        >
          💾 Save Cinema
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