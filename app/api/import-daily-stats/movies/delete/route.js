import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");

    if (!id) {
      return Response.json(
        { error: "Movie id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("movies")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}