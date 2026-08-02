import { supabase } from "../../supabase";

/* =====================================
   Load Alias
===================================== */

export async function findAlias(
  type,
  sourceName
) {

  if (!sourceName)
    return null;

  const { data } =
    await supabase
      .from("import_aliases")
      .select("*")
      .eq("type", type)
      .eq("source_name", sourceName.trim())
      .maybeSingle();

  return data;

}

/* =====================================
   Save Alias
===================================== */

export async function saveAlias({

  type,

  sourceName,

  targetId,

  targetName,

}) {

  if (
    !sourceName ||
    !targetId
  ) {

    return;

  }

  await supabase

    .from("import_aliases")

    .upsert({

      type,

      source_name:
        sourceName.trim(),

      target_id:
        targetId,

      target_name:
        targetName,

    });

}