import { supabase } from "../../../lib/supabase";

export default async function CinemasPage() {
  const { data } = await supabase
    .from("cinemas")
    .select("*");

  const cinemas = data || [];

  return (
    <main>
      <h1>Cinemas Test</h1>
      <p>Total: {cinemas.length}</p>
    </main>
  );
}