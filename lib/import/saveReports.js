"use server";

import { supabase } from "../supabase";

function toNumber(value) {
  if (value === null || value === undefined) return 0;

  return (
    Number(
      String(value)
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "")
    ) || 0
  );
}

export async function saveReports({
  dayId,
  rows,
}) {
  if (!dayId) {
    throw new Error("dayId is required");
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: true,
      imported: 0,
    };
  }

  //----------------------------------
  // حذف بيانات اليوم القديمة
  //----------------------------------

  const { error: deleteError } = await supabase
    .from("boxoffice_reports")
    .delete()
    .eq("day_id", dayId);

  if (deleteError) {
    console.error(deleteError);

    return {
      success: false,
      message: deleteError.message,
    };
  }

  //----------------------------------
  // تجهيز البيانات الجديدة
  //----------------------------------

  const payload = rows
    .filter(
      (row) =>
        row.cinemaId &&
        row.movieId
    )
    .map((row) => ({

  day_id: dayId,

  report_date: row.reportDate ?? new Date(),

  cinema_id: row.cinemaId,

  movie_id: row.movieId,

  tickets: toNumber(
    row.tickets ??
    row.audience
  ),

  revenue: toNumber(
    row.revenue
  ),

}))

  if (!payload.length) {
    return {
      success: false,
      message: "No matched rows to save.",
    };
  }

  //----------------------------------
  // إدخال البيانات
  //----------------------------------

  const { error } = await supabase
    .from("boxoffice_reports")
    .insert(payload);

  if (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    imported: payload.length,
  };
}