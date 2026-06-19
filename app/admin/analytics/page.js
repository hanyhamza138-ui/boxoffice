import { supabase } from "../../../lib/supabase";

export default async function AnalyticsPage() {

  const { data: dailyStatsData } = await supabase
    .from("daily_stats")
    .select("*")
    .order("date", { ascending: false });


  const { data: cinemasData } = await supabase
    .from("cinemas")
    .select("*");


  const { data: moviesData } = await supabase
    .from("movies")
    .select("*");


  const dailyStats = dailyStatsData || [];
  const cinemas = cinemasData || [];
  const movies = moviesData || [];


  const totalRevenue = dailyStats.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  );


  const totalAudience = dailyStats.reduce(
    (sum, item) => sum + Number(item.audience || 0),
    0
  );


  const totalRecords = dailyStats.length;
  const totalCinemas = cinemas.length;


  const movieMap = {};

  movies.forEach((movie) => {
    movieMap[String(movie.id)] = movie.title;
  });


  const cinemaMap = {};

  cinemas.forEach((cinema) => {
    cinemaMap[String(cinema.id)] = {
      name: cinema.name,
      city: cinema.city,
    };
  });


  const movieRevenueMap = {};

  dailyStats.forEach((item) => {

    const key = String(item.movie_id);

    movieRevenueMap[key] =
      (movieRevenueMap[key] || 0) +
      Number(item.revenue || 0);

  });


  const rankedMovies = movies
    .map((movie) => ({
      ...movie,
      revenue:
        movieRevenueMap[String(movie.id)] || 0,
    }))
    .sort((a,b)=>b.revenue-a.revenue);



  const cinemaRevenueMap = {};

  dailyStats.forEach((item)=>{

    const key = String(item.cinema_id);

    cinemaRevenueMap[key] =
      (cinemaRevenueMap[key] || 0) +
      Number(item.revenue || 0);

  });



  const rankedCinemas = cinemas
    .map((cinema)=>({
      ...cinema,
      revenue:
        cinemaRevenueMap[String(cinema.id)] || 0,
    }))
    .sort((a,b)=>b.revenue-a.revenue);



  const topMovie = rankedMovies[0];
  const topCinema = rankedCinemas[0];


  return (
    <main
      style={{
        background:"#111",
        color:"white",
        minHeight:"100vh",
        padding:40
      }}
    >

      <h1>📊 Analytics Dashboard</h1>


      <h2>
        💰 Revenue: {totalRevenue.toLocaleString()}
      </h2>

      <h2>
        👥 Audience: {totalAudience.toLocaleString()}
      </h2>

      <h2>
        🎥 Cinemas: {totalCinemas}</h2>


      <h2>
        🏆 Top Movie:
        {" "}
        {topMovie?.title || "-"}
      </h2>


      <h2>
        🎬 Top Cinema:
        {" "}
        {topCinema?.name || "-"}
      </h2>


      <h2 style={{marginTop:40}}>
        Latest Stats
      </h2>


      <table
        style={{
          width:"100%",
          background:"#1c1c1c"
        }}
      >

        <tbody>

        {dailyStats.slice(0,20).map((row)=>(

          <tr key={row.id}>

            <td>
              {movieMap[String(row.movie_id)] || "Unknown"}
            </td>

            <td>
              {cinemaMap[String(row.cinema_id)]?.name || "Unknown"}
            </td>

            <td>
              {(row.revenue || 0).toLocaleString()}
            </td>

            <td>
              {(row.audience || 0).toLocaleString()}
            </td>

          </tr>

        ))}

        </tbody>

      </table>


    </main>
  );
}