import { supabase } from "../../../../lib/supabase";
import { cookies } from "next/headers";
import ar from "../../../../translations/ar";
import en from "../../../../translations/en";

export default async function TodayMoviesPage({
  searchParams,
}) {
  const cookieStore = await cookies();

  const language =
    cookieStore.get("language")?.value || "en";

  const t =
    language === "ar"
      ? ar
      : en;

  const params = await searchParams;

  const filter =
    params?.lang || "all";


  const {
    data: openDay,
  } = await supabase
    .from("boxoffice_days")
    .select("id")
    .eq("status", "open")
    .maybeSingle();


  const {
  data,
  error,
} = await supabase.rpc(
  "get_today_movies",
  {
    p_day_id: openDay?.id ?? null,
    p_language: filter,
  }
);

if (error) {
  console.error(error);
}

const totals =
  data?.totals || {
    revenue: 0,
    tickets: 0,
    cinemas: 0,
    movies: 0,
  };

const movies =
  data?.movies || [];

const cinemas =
  data?.cinemas || [];


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
        🎬
        {
          language === "ar"
          ? " أفلام اليوم"
          : " Today's Movies"
        }
      </h1>


      <div
        style={{
          display:"flex",
          gap:"10px",
          margin:"20px 0",
        }}
      >

        <a href="/admin/movies/today">
          <button>
            🌍 الكل
          </button>
        </a>


        <a href="/admin/movies/today?lang=ar">
          <button>
            🇪🇬 عربي
          </button>
        </a>


        <a href="/admin/movies/today?lang=en">
          <button>
            🌎 English
          </button>
        </a>

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

        <div className="card">
          💰 الإيراد
          <h2>
            {Number(totals.revenue).toLocaleString()}
          </h2>
        </div>


        <div className="card">
          🎟️ التذاكر
          <h2>
            {Number(totals.tickets).toLocaleString()}
          </h2>
        </div>


        <div className="card">
          🏢 السينمات
          <h2>
            {Number(totals.cinemas).toLocaleString()}
          </h2>
        </div>


        <div className="card">
          🎬 الأفلام
          <h2>
            {Number(totals.movies)}
          </h2>
        </div>


      </div>



      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(auto-fill,minmax(180px,1fr))",
          gap:"18px",
        }}
      >

      {(movies || []).map(
        (movie)=>(

          <div
            key={movie.movie_id}
            style={{
              background:"#181818",
              borderRadius:"12px",
              overflow:"hidden",
              border:"1px solid #333",
            }}
          >

            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width:"100%",
                height:"220px",
                objectFit:"cover",
              }}
            />


            <div
              style={{
                padding:"12px",
              }}
            >

              <h3>
  #{movie.movie_rank}
  {" "}
  {movie.code}
</h3>

<p
  style={{
    fontWeight: "bold",
    marginTop: "8px",
  }}
>
  {movie.title}
</p>


              <p>
                💰 الإيراد:
                {" "}
                {Number(movie.revenue).toLocaleString()}
              </p>


              <p>
                🎟️ التذاكر:
                {" "}
                {Number(movie.tickets).toLocaleString()}
              </p>


              <p>
                🏢 السينمات:
                {" "}
                {movie.cinemas_count}
              </p>


            </div>

          </div>

        )
      )}

      </div>
<hr
  style={{
    margin: "40px 0",
    borderColor: "#333",
  }}
/>

<h2>
  🏢 ترتيب السينمات
</h2>

<div
  style={{
    display: "grid",
    gap: "12px",
    marginTop: "20px",
  }}
>
  {cinemas.map((cinema, index) => (
    <div
      key={cinema.cinema_id}
      style={{
        background: "#1c1c1c",
        padding: "15px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <strong>
          #{index + 1} {cinema.code}
        </strong>

        <div>{cinema.name}</div>
      </div>

      <div
        style={{
          textAlign: "right",
        }}
      >
        <div>
          💰{" "}
          {Number(
            cinema.revenue
          ).toLocaleString()}
        </div>

        <div>
          🎟️{" "}
          {Number(
            cinema.tickets
          ).toLocaleString()}
        </div>
      </div>
    </div>
  ))}
</div>
    </main>
  );
}