import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import {
  closeWorkDay,
  reopenWorkDay,
} from "../../../actions/workday";


export default async function WorkDayDetailsPage({
  params,
}) {

  const { id } = await params;


  const { data: day } =
    await supabase
      .from("boxoffice_days")
      .select("*")
      .eq("id", id)
      .single();


  const { data: cinemas } =
    await supabase
      .from("cinemas")
      .select("*")
      .order("name");


  const { data: summary } =
    await supabase.rpc(
      "get_workday_summary",
      {
        p_day_id: Number(id),
      }
    );


  const totals =
    summary?.totals || {};

  const rankedMovies =
    summary?.movies || [];

  const rankedCinemas =
    summary?.cinemas || [];


  const completedCinemaIds =
  new Set(
    rankedCinemas.map(
      (c) => c.cinema_id
    )
  );

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
        📅 يوم العمل
      </h1>


      <div
        style={{
          background:"#1c1c1c",
          padding:"20px",
          borderRadius:"10px",
          marginBottom:"25px",
        }}
      >

        <h2>
          {day?.work_date}
        </h2>


        <p>
          الحالة{" "}
          {
            day?.status === "open"
            ? "🟢 مفتوح"
            : "🔴 مغلق"
          }
        </p>


        {
          day?.status === "open"
          ? (
            <form
              action={async()=>{
                "use server";
                await closeWorkDay(id);
              }}
            >

              <button
                style={{
                  background:"#dc2626",
                  color:"white",
                  border:"none",
                  padding:"12px 20px",
                  borderRadius:"8px",
                }}
              >
                🔒 إغلاق يوم العمل
              </button>

            </form>
          )
          :
          (
            <form
              action={async()=>{
                "use server";
                await reopenWorkDay(id);
              }}
            >

              <button
                style={{
                  background:"#16a34a",
                  color:"white",
                  border:"none",
                  padding:"12px 20px",
                  borderRadius:"8px",
                }}
              >
                🔓 إعادة فتح اليوم
              </button>

            </form>
          )
        }

      </div>



      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
          gap:"15px",
          marginBottom:"30px",
        }}
      >

        <Box
          title="💰 إجمالي الإيراد"
          value={
            Number(
              totals.revenue || 0
            ).toLocaleString()
          }
        />


        <Box
          title="🎟️ إجمالي الرواد"
          value={
            Number(
              totals.tickets || 0
            ).toLocaleString()
          }
        />


        <Box
          title="🏢 السينمات"
          value={
            totals.cinemas || 0
          }
        />

      </div>




      <Section title="🏆 ترتيب الأفلام">

        {
          rankedMovies.map(
            (movie,index)=>(

              <Row
                key={movie.movie_id}
                left={
                  <>
                  #{index+1}{" "}
                  {movie.code}
                  {" - "}
                  {movie.title}
                  </>
                }
                right={
                  Number(
                    movie.revenue || 0
                  ).toLocaleString()
                }
              />

            )
          )
        }

      </Section>





      <Section title="🏢 ترتيب السينمات">

        {
          rankedCinemas.map(
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






      <h2>
        🎬 السينمات
      </h2>


      <div
        style={{
          display:"grid",
          gap:"15px",
        }}
      >

      {
        cinemas?.map(
          (cinema)=>(

            <div
              key={cinema.id}
              style={{
                background:"#1c1c1c",
                padding:"15px",
                borderRadius:"10px",
                display:"flex",
                justifyContent:
                "space-between",
                alignItems:"center",
              }}
            >

              <div>

                <h3>
                  {cinema.code}
                  {" - "}
                  {cinema.name}
                </h3>


                <p>
                {
                  completedCinemaIds.has(
                    cinema.id
                  )
                  
                  ?
                  "✅ تم الإدخال"
                  :
                  "⏳ لم يتم الإدخال"
                }
                </p>

              </div>


              {
                day?.status === "open"
                ?
                <Link
                href={`/admin/work-day/${id}/cinema/${cinema.id}`}
                >

                  <button
                    style={{
                      background:"#2563eb",
                      color:"white",
                      border:"none",
                      padding:"10px 16px",
                      borderRadius:"8px",
                    }}
                  >
                    إدارة السينما
                  </button>

                </Link>

                :

                <button
                  disabled
                >
                  🔒 مغلق
                </button>
              }


            </div>

          )
        )
      }


      </div>


    </main>
  );
}




function Box({
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

<h3>{title}</h3>

<h2>{value}</h2>

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
marginBottom:"30px",
}}
>

<h2>{title}</h2>

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