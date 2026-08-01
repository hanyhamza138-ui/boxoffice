"use server";

import { supabase } from "../supabase";

export async function getOrCreateWorkDay(reportDate) {

  const { data: existing } = await supabase
    .from("boxoffice_days")
    .select("id")
    .eq("work_date", reportDate)
    .single();

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("boxoffice_days")
    .insert({
      work_date: reportDate,
      status: "OPEN",
    })
    .select("id")
    .single();

  if (error) throw error;

  return data.id;
}