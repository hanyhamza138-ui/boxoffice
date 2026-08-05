import { supabase } from "../../supabase";

/* ==========================================================
   CREATE REPORT SIGNATURE
========================================================== */

export function createSignature(header = []) {

  return header
    .map(v => String(v).trim().toLowerCase())
    .join("|");

}

/* ==========================================================
   LOAD LEARNING
========================================================== */

export async function loadLearning(signature) {

  const { data } =
    await supabase

      .from("import_learning")

      .select("*")

      .eq("report_signature", signature)

      .maybeSingle();

  return data;

}

/* ==========================================================
   SAVE LEARNING
========================================================== */

export async function saveLearning(data) {

  await supabase

    .from("import_learning")

    .upsert({

      ...data,

      updated_at:
        new Date()

          .toISOString(),

    });

}