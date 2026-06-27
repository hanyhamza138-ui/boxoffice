import { supabase } from "../../../lib/supabase";
import AnalyticsFilter from "./AnalyticsFilter";
import AnalyticsCharts from "./AnalyticsCharts";
import StatsCards from "../../../components/StatsCards";
import TopMovies from "../../../components/TopMovies";
import TopCinemas from "../../../components/TopCinemas";
import DailyRevenue from "../../../components/DailyRevenue";
import ExportButtons from "./ExportButtons";
export default async function AnalyticsPage({
  searchParams,
}) {


  const params = await searchParams;


  const today =
    new Date()
    .toISOString()
    .split("T")[0];



  const defaultFrom =
    new Date(
      Date.now() -
      30 * 24 * 60 * 60 * 1000
    )
    .toISOString()
    .split("T")[0];



  const fromDate =
    params?.from || defaultFrom;


  const toDate =
    params?.to || today;



  const { data, error } =
    await supabase.rpc(
      "get_analytics_summary",
      {
        p_from_date: fromDate,
        p_to_date: toDate,
      }
    );



  if (error) {

    console.log(
      "ANALYTICS ERROR",
      error
    );

  }



  const totals =
    data?.totals || {};


  const movies =
    data?.movies || [];
console.log("MOVIES DATA", movies);

  const cinemas =
    data?.cinemas || [];


  const daily =
    data?.daily || [];



  return (

    <main
      style={{
        background:"#111",
        color:"white",
        minHeight:"100vh",
        padding:"40px",
      }}
    >


      <h1>
        📊 Analytics Dashboard
      </h1>
            <AnalyticsFilter />
            <ExportButtons
  fromDate={fromDate}
  toDate={toDate}
  totals={totals}
  movies={movies}
  cinemas={cinemas}
  daily={daily}
/>
<StatsCards
  totals={totals}
  movies={movies}
  cinemas={cinemas}
/>
      <div
        style={{
          background:"#1c1c1c",
          padding:"15px",
          borderRadius:"10px",
          marginTop:"20px",
        }}
      >

        الفترة:

        <br/>

        من:
        {" "}
        {fromDate}

        <br/>

        إلى:
        {" "}
        {toDate}

     </div>

      <AnalyticsCharts
        daily={daily}
      />
      <TopMovies
        movies={movies}
       />
      <TopCinemas
  cinemas={cinemas}
/>
      <DailyRevenue
  daily={daily}
/>

    </main>

  );

}



function Card({
  title,
  value
}){

return (

<div
style={{
background:"#1c1c1c",
padding:"20px",
borderRadius:"10px",
}}
>

<h3>
{title}
</h3>

<h2>
{value}
</h2>

</div>

);

}
