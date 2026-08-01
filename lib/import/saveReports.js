"use server";

import { supabase } from "../supabase";

function toNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }

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
    return {
      success: false,
      message: "Day ID is missing.",
    };
  }

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: "No rows to import.",
    };
  }

  //--------------------------------------------------
  // Get Work Day
  //--------------------------------------------------

  const { data: day, error: dayError } =
    await supabase
      .from("boxoffice_days")
      .select("work_date")
      .eq("id", Number(dayId))
      .single();

  if (dayError || !day) {
    return {
      success: false,
      message: "Work Day not found.",
    };
  }

  //--------------------------------------------------
  // Build Payload
  //--------------------------------------------------

  const payload = rows
    .filter(
      (r) =>
        r.matchedMovie &&
        r.matchedCinema &&
        r.matchedVersion
    )
    .map((r) => ({
      day_id: Number(dayId),

      report_date: day.work_date,

      cinema_id: Number(r.cinemaId),

      movie_id: Number(r.movieId),

      version_id:
        r.versionId
          ? Number(r.versionId)
          : null,

      tickets: toNumber(
        r.tickets ?? r.audience
      ),

      revenue: toNumber(
        r.revenue
      ),
    }));

  if (!payload.length) {
    return {
      success: false,
      message: "No matched rows.",
    };
  }

  //--------------------------------------------------
  // UPSERT
  //--------------------------------------------------

  const { error } =
    await supabase
      .from("boxoffice_reports")
      .upsert(payload, {
        onConflict:
          "day_id,movie_id,cinema_id,version_id",
      });

  if (error) {
    throw error;
  }

  return {
    success: true,
    imported: payload.length,
  };
}