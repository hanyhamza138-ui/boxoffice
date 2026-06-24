import { supabase } from "../../../lib/supabase";
import RevenueForm from "./RevenueForm";


export default async function DailyRevenuePage() {


  const { data: movies } = await supabase
    .from("movies")
    .select("id,title,code")
    .order("title");


  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("id,name,code")
    .order("name");



  return (

    <main
      style={{
        background:"#111",
        color:"white",
        minHeight:"100vh",
        padding:"30px",
      }}
    >

      <h1>
        🎬 الإيرادات اليومية
      </h1>


      <RevenueForm
        movies={movies || []}
        cinemas={cinemas || []}
      />


    </main>

  );

}