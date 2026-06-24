"use client";

import { useState } from "react";
import { addDailyRevenue } from "../../actions/boxoffice";


export default function RevenueForm({
  movies,
  cinemas
}) {


  const [rows,setRows] = useState([
    {
      movieId:"",
      screens:0,
      tickets:0,
      revenue:0
    }
  ]);



  function addRow(){

    setRows([
      ...rows,
      {
        movieId:"",
        screens:0,
        tickets:0,
        revenue:0
      }
    ]);

  }



  function updateRow(index,field,value){

    const copy=[...rows];

    copy[index][field]=value;

    setRows(copy);

  }



  function removeRow(index){

    setRows(
      rows.filter((_,i)=>i!==index)
    );

  }



  async function submit(formData){

    formData.set(
      "rows",
      JSON.stringify(rows)
    );

    await addDailyRevenue(formData);

    alert("تم حفظ الإيرادات بنجاح");

  }



  const totalTickets =
    rows.reduce(
      (sum,row)=>sum + Number(row.tickets || 0),
      0
    );


  const totalRevenue =
    rows.reduce(
      (sum,row)=>sum + Number(row.revenue || 0),
      0
    );



  return (

    <form
      action={submit}
      style={{
        marginTop:"30px"
      }}
    >


      <div>

        <label>
          التاريخ
        </label>

        <input
          type="date"
          name="date"
          required
          style={inputStyle}
        />

      </div>




      <div>

        <label>
          السينما
        </label>


        <select
          name="cinemaId"
          required
          style={inputStyle}
        >

          <option value="">
            اختر السينما
          </option>


          {
            cinemas.map(cinema=>(

              <option
                key={cinema.id}
                value={cinema.id}
              >

                {cinema.code} - {cinema.name}

              </option>

            ))
          }


        </select>


      </div>





      <hr />



      {
        rows.map((row,index)=>(


          <div
            key={index}
            style={{
              display:"flex",
              gap:"10px",
              marginBottom:"10px"
            }}
          >


            <select
              value={row.movieId}
              onChange={(e)=>
                updateRow(
                  index,
                  "movieId",
                  e.target.value
                )
              }
              style={inputStyle}
            >

              <option value="">
                الفيلم
              </option>


              {
                movies.map(movie=>(

                  <option
                    key={movie.id}
                    value={movie.id}
                  >

                    {movie.code} - {movie.title}

                  </option>

                ))
              }


            </select>



            <input
              placeholder="الشاشات"
              type="number"
              onChange={(e)=>
                updateRow(
                  index,
                  "screens",
                  e.target.value
                )
              }
              style={smallInput}
            />


            <input
              placeholder="التذاكر"
              type="number"
              onChange={(e)=>
                updateRow(
                  index,
                  "tickets",
                  e.target.value
                )
              }
              style={smallInput}
            />



            <input
              placeholder="الإيراد"
              type="number"
              onChange={(e)=>
                updateRow(
                  index,
                  "revenue",
                  e.target.value
                )
              }
              style={smallInput}
            />



            <button
              type="button"
              onClick={()=>
                removeRow(index)
              }
            >
              ❌
            </button>


          </div>


        ))
      }




      <button
        type="button"
        onClick={addRow}
      >
        ➕ إضافة فيلم
      </button>




      <h3>
        إجمالي التذاكر:
        {totalTickets}
      </h3>


      <h3>
        إجمالي الإيراد:
        {totalRevenue.toLocaleString()}
        {" "}EGP
      </h3>




      <button
        type="submit"
        style={{
          background:"#16a34a",
          color:"white",
          padding:"12px 25px",
          border:"none",
          borderRadius:"8px",
          cursor:"pointer"
        }}
      >

        💾 حفظ تقرير اليوم

      </button>



    </form>

  );

}




const inputStyle={
  padding:"10px",
  margin:"10px",
  borderRadius:"6px",
};



const smallInput={
  width:"100px",
  padding:"10px"
};