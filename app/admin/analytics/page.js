import { supabase } from "../../../lib/supabase";
import AnalyticsFilter from "./AnalyticsFilter";
import AnalyticsCharts from "./AnalyticsCharts";
import StatsCards from "../../../components/StatsCards";
import TopMovies from "../../../components/TopMovies";
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



  const topMovie =
    movies[0];


  const topCinema =
    cinemas[0];



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

       <Card
        title="🎬 أعلى سينما"
        value={topCinema?.name || "لا توجد"}
/>
     </div>

      <AnalyticsCharts
        daily={daily}
      />
      <TopMovies
        movies={movies}
       />
      <Section title="🏢 ترتيب السينمات">

        {
          cinemas.map(
            (cinema,index)=>(

              <Row
                key={cinema.cinema_id}
                left={
                  <>
                  #{index+1}{" "}
                  {cinema.code}
                  {" - "}
                  {cinema.name}
                  </>
                }
                right={
                  Number(
                    cinema.revenue || 0
                  ).toLocaleString()
                }
              />

            )
          )
        }

      </Section>





      <Section title="📅 الإيراد اليومي">

        {
          daily.map(
            (item,index)=>(

              <Row
                key={index}
                left={item.date}
                right={
                  Number(
                    item.revenue || 0
                  ).toLocaleString()
                }
              />

            )
          )
        }

      </Section>


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





function Section({
title,
children
}){

return (

<div
style={{
background:"#1c1c1c",
padding:"20px",
borderRadius:"10px",
marginTop:"30px",
}}
>

<h2>
{title}
</h2>

{children}

</div>

);

}





function Row({
left,
right
}){

return (

<div
style={{
display:"flex",
justifyContent:"space-between",
padding:"10px 0",
borderBottom:"1px solid #333",
}}
>

<div>
{left}
</div>

<div>
{right}
</div>

</div>

);

}