"use server";

import { supabase } from "../../lib/supabase";



export async function addDailyRevenue(formData) {


  const date = formData.get("date");
  const cinemaId = Number(formData.get("cinemaId"));

  const rows = JSON.parse(
    formData.get("rows")
  );



  if (!date || !cinemaId || !rows?.length) {

    throw new Error(
      "Missing required data"
    );

  }



  const reports = rows.map((row)=>({

    report_date: date,

    movie_id: Number(row.movieId),

    cinema_id: cinemaId,

    screens: Number(row.screens || 0),

    tickets: Number(row.tickets || 0),

    revenue: Number(row.revenue || 0),

    source: "manual"

  }));




  const { error } = await supabase
    .from("boxoffice_reports")
    .insert(reports);



  if(error){

    console.log(error);

    throw new Error(
      error.message
    );

  }



  return {
    success:true
  };


}