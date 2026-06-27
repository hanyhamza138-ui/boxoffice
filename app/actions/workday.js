"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";


export async function saveWorkDayRevenue(data) {

  try {

    const parsed = JSON.parse(data);

    const { rows, deletedIds } = JSON.parse(data);


    if (!rows.length && !deletedIds.length) {
      throw new Error("No data provided");
    }



    // حذف السجلات التي تم حذفها من الفورم
    if (deletedIds.length) {

      const { error: deleteError } =
        await supabase
          .from("boxoffice_reports")
          .delete()
          .in("id", deletedIds);


      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

    }



    const today = new Date()
      .toISOString()
      .split("T")[0];



    const payload = rows
      .filter(
        (row) =>
          row.movie_id &&
          row.cinema_id
      )
      .map((row) => ({

        day_id:
          Number(row.day_id),

        cinema_id:
          Number(row.cinema_id),

        movie_id:
          Number(row.movie_id),

        version_id:
          row.version_id
            ? Number(row.version_id)
            : null,

        tickets:
          Number(row.tickets || 0),

        revenue:
          Number(row.revenue || 0),

        report_date:
          today,

        source:
          "manual",

      }));

if (deletedIds && deletedIds.length) {

  const { error: deleteError } =
    await supabase
      .from("boxoffice_reports")
      .delete()
      .in(
        "id",
        deletedIds
      );

  if (deleteError) {
    console.log(deleteError);

    throw new Error(
      deleteError.message
    );
  }

}

    if (payload.length) {


      console.log(
        "UPSERT PAYLOAD",
        payload
      );


      const { error } =
        await supabase
          .from("boxoffice_reports")
          .upsert(
            payload,
            {
              onConflict:
                "day_id,movie_id,cinema_id,version_id",
            }
          );


      if (error) {

        console.log(error);

        throw new Error(
          error.message
        );

      }

    }



    revalidatePath(
      "/admin/work-day"
    );


    return {

      success:true,

    };


  } catch(error) {


    console.log(error);


    return {

      success:false,

      message:
        error.message,

    };

  }

}





export async function deleteWorkDayReport(reportId) {

  try {


    const { error } =
      await supabase
        .from("boxoffice_reports")
        .delete()
        .eq(
          "id",
          Number(reportId)
        );


    if(error){

      throw new Error(
        error.message
      );

    }



    revalidatePath(
      "/admin/work-day"
    );



    return {

      success:true,

    };


  } catch(error){


    console.log(error);


    return {

      success:false,

      message:
        error.message,

    };

  }

}





export async function closeWorkDay(dayId) {

  try {


    const { error } =
      await supabase
        .from("boxoffice_days")
        .update({

          status:"closed",

        })
        .eq(
          "id",
          Number(dayId)
        );



    if(error){

      throw new Error(
        error.message
      );

    }



    revalidatePath(
      `/admin/work-day/${dayId}`
    );


    revalidatePath(
      "/admin/work-day"
    );



    return {

      success:true,

    };


  } catch(error){


    return {

      success:false,

      message:
        error.message,

    };

  }

}





export async function reopenWorkDay(dayId) {

  try {


    const { error } =
      await supabase
        .from("boxoffice_days")
        .update({

          status:"open",

        })
        .eq(
          "id",
          Number(dayId)
        );



    if(error){

      throw new Error(
        error.message
      );

    }



    revalidatePath(
      `/admin/work-day/${dayId}`
    );


    revalidatePath(
      "/admin/work-day"
    );



    return {

      success:true,

    };


  } catch(error){


    return {

      success:false,

      message:
        error.message,

    };

  }

}