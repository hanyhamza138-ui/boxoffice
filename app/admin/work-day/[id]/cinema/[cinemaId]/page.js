import { supabase } from "../../../../../../lib/supabase";

export default async function CinemaPage({
  params,
}) {

  const { id, cinemaId } = await params;


  const { data: day } = await supabase
    .from("boxoffice_days")
    .select("*")
    .eq("id", id)
    .single();



  const { data: cinema } = await supabase
    .from("cinemas")
    .select("*")
    .eq("id", cinemaId)
    .single();



  const { data: movies } = await supabase
    .from("movies")
    .select("id,title,code")
    .order("title");



  const { data: versions } = await supabase
    .from("movie_versions")
    .select("*")
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
        🎬 إدارة السينما
      </h1>


      <div
        style={{
          background:"#1c1c1c",
          padding:"20px",
          borderRadius:"10px",
          marginBottom:"20px",
        }}
      >

        <h2>
          📅 {day?.work_date}
        </h2>

        <h3>
          {cinema?.code}
          {" - "}
          {cinema?.name}
        </h3>

      </div>



      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:"20px",
        }}
      >

        <div
          style={{
            background:"#1c1c1c",
            padding:"20px",
            borderRadius:"10px",
          }}
        >

          <h3>
            🎞 الأفلام
          </h3>

          <ul>

            {
              movies?.map(movie=>(
                <li key={movie.id}>
                  {movie.code}
                  {" - "}
                  {movie.title}
                </li>
              ))
            }

          </ul>

        </div>




        <div
          style={{
            background:"#1c1c1c",
            padding:"20px",
            borderRadius:"10px",
          }}
        >

          <h3>
            🎭 النسخ
          </h3>

          <ul>

            {
              versions?.map(version=>(
                <li key={version.id}>
                  {version.name}
                </li>
              ))
            }

          </ul>

        </div>

      </div>


      <div
        style={{
          marginTop:"30px",
          background:"#1c1c1c",
          padding:"20px",
          borderRadius:"10px",
        }}
      >

        <h2>
          🚧 نموذج الإدخال
        </h2>

        <p>
          الخطوة القادمة:
          إضافة الأفلام +
          النسخ +
          الرواد +
          الإيراد +
          الحفظ
        </p>

      </div>

    </main>

  );

}