"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

export async function saveWorkDayRevenue(data) {
  try {
    const rows = JSON.parse(data);

    if (!rows.length) {
      throw new Error("No data provided");
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const payload = rows
      .filter(
        (row) =>
          row.movie_id &&
          row.cinema_id
      )
      .map((row) => ({
        day_id: Number(row.day_id),

        cinema_id: Number(row.cinema_id),

        movie_id: Number(row.movie_id),

        version_id:
          row.version_id
            ? Number(row.version_id)
            : null,

        tickets:
          Number(row.tickets || 0),

        revenue:
          Number(row.revenue || 0),

        report_date: today,

        source: "manual",
      }));

    if (!payload.length) {
      throw new Error(
        "No valid rows"
      );
    }

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
            ignoreDuplicates: false,
          }
        );

    if (error) {
      console.log(error);
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/admin/work-day"
    );

    return {
      success: true,
    };

  } catch (error) {

    console.log(error);

    return {
      success: false,
      message: error.message,
    };

  }
}

export async function closeWorkDay(dayId) {

  try {

    const { error } =
      await supabase
        .from("boxoffice_days")
        .update({
          status: "closed",
        })
        .eq(
          "id",
          Number(dayId)
        );

    if (error) {
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
      success: true,
    };

  } catch (error) {

    console.log(error);

    return {
      success: false,
      message: error.message,
    };

  }

}

export async function reopenWorkDay(dayId) {

  try {

    const { error } =
      await supabase
        .from("boxoffice_days")
        .update({
          status: "open",
        })
        .eq(
          "id",
          Number(dayId)
        );

    if (error) {
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
      success: true,
    };

  } catch (error) {

    console.log(error);

    return {
      success: false,
      message: error.message,
    };

  }

}
export async function deleteWorkDayReport(reportId) {
  try {
    const { error } = await supabase
      .from("boxoffice_reports")
      .delete()
      .eq("id", Number(reportId));

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/work-day");

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: error.message,
    };
  }
}