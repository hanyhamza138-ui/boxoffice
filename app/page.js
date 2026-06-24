import { supabase } from "../lib/supabase";
import HomeContent from "./components/HomeContent";


export default async function HomePage() {


  const { data: movies, error } = await supabase
    .from("movies")
    .select("*")
    .order("revenue", {
      ascending:false
    });



  if(error){

    return (

      <main
      style={{
        background:"#111",
        color:"white",
        minHeight:"100vh",
        padding:40
      }}
      >

        <h1>
          Error Loading Movies
        </h1>

        <p>
          {error.message}
        </p>

      </main>

    );

  }



  return (

    <HomeContent
      movies={movies || []}
    />

  );

}