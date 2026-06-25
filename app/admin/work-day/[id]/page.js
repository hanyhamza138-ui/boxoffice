import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

export default async function WorkDayDetailsPage({
  params,
}) {

  const { id } = await params;

  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();



  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("*")
    .order("name");



  const { data: reports } = await supabase
    .from("boxoffice_reports")
    .select("cinema_id")
    .eq("day_id", id);



  const completedCinemaIds =
    [...new Set(
      (reports || []).map(
        r => r.cinema_id
      )
    )];



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
          الحالة:
          {" "}
          {
            day?.status === "open"
            ? "🟢 مفتوح"
            : "🔴 مغلق"
          }
        </p>

      </div>



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
          cinemas?.map(cinema=>{

            const completed =
              completedCinemaIds.includes(
                cinema.id
              );

            return (

              <div
                key={cinema.id}
                style={{
                  background:"#1c1c1c",
                  padding:"15px",
                  borderRadius:"10px",
                  display:"flex",
                  justifyContent:"space-between",
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
                      completed
                      ? "✅ تم الإدخال"
                      : "⏳ لم يتم الإدخال"
                    }

                  </p>

                </div>



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
                      cursor:"pointer",
                    }}
                  >

                    إدارة السينما

                  </button>

                </Link>

              </div>

            );

          })
        }

      </div>

    </main>

  );

}