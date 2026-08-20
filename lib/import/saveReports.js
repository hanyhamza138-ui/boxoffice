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
  reportDate,
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

      report_date:
        reportDate || day.work_date,

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
  // REMOVE DUPLICATES INSIDE SAME IMPORT
  //--------------------------------------------------

  const uniqueMap = new Map();

  for (const row of payload) {
    const key =
      row.version_id === null
        ? `${row.day_id}|${row.movie_id}|${row.cinema_id}|NULL`
        : `${row.day_id}|${row.movie_id}|${row.cinema_id}|${row.version_id}`;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        ...row,
      });
    } else {
      const existing =
        uniqueMap.get(key);

      existing.tickets +=
        row.tickets;

      existing.revenue +=
        row.revenue;
    }
  }

  const uniquePayload =
    Array.from(uniqueMap.values());

  //--------------------------------------------------
  // SAVE ONE BY ONE
  //
  // مهم:
  // لا نعتمد على UPSERT عندما version_id = NULL
  //--------------------------------------------------

  let imported = 0;

  for (const row of uniquePayload) {
    //------------------------------------------------
    // CASE 1:
    // No version
    //------------------------------------------------

    if (row.version_id === null) {
      const {
        data: existing,
        error: findError,
      } = await supabase
        .from("boxoffice_reports")
        .select("id")
        .eq("day_id", row.day_id)
        .eq("movie_id", row.movie_id)
        .eq("cinema_id", row.cinema_id)
        .is("version_id", null)
        .limit(1)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      //------------------------------------------------
      // Existing row -> UPDATE
      //------------------------------------------------

      if (existing?.id) {
        const {
          error: updateError,
        } = await supabase
          .from("boxoffice_reports")
          .update({
            report_date:
              row.report_date,

            tickets:
              row.tickets,

            revenue:
              row.revenue,
          })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        imported++;
        continue;
      }

      //------------------------------------------------
      // No existing row -> INSERT
      //------------------------------------------------

      const {
        error: insertError,
      } = await supabase
        .from("boxoffice_reports")
        .insert(row);

      if (insertError) {
        throw insertError;
      }

      imported++;
      continue;
    }

    //------------------------------------------------
    // CASE 2:
    // Version exists
    //------------------------------------------------

    const {
      error: upsertError,
    } = await supabase
      .from("boxoffice_reports")
      .upsert(row, {
        onConflict:
          "day_id,movie_id,cinema_id,version_id",
      });

    if (upsertError) {
      throw upsertError;
    }

    imported++;
  }

  //--------------------------------------------------
  // RESULT
  //--------------------------------------------------

  return {
    success: true,
    imported,
  };
}