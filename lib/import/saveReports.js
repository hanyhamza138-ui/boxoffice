"use server";

import { supabase } from "../supabase";
import { revalidatePath } from "next/cache";

export async function saveReports({
  dayId,
  rows,
}) {
  if (!rows?.length) {
    return {
      success: false,
      message: "No rows to import.",
    };
  }

  const reports = rows
    .filter(
      (row) =>
        row.movieId &&
        row.cinemaId
    )
    .map((row) => ({
      day_id: Number(dayId),

      movie_id: row.movieId,

      version_id:
        row.versionId || null,

      cinema_id: row.cinemaId,

      tickets: Number(
        row.audience || 0
      ),

      revenue: Number(
        row.revenue || 0
      ),

      report_date:
        new Date()
          .toISOString()
          .split("T")[0],
    }));

  if (!reports.length) {
    return {
      success: false,
      message:
        "No valid rows after matching.",
    };
  }

  const { error } =
    await supabase
      .from("boxoffice_reports")
      .insert(reports);

  if (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath(
    `/admin/work-day/${dayId}`
  );

  return {
    success: true,
    imported: reports.length,
  };
}