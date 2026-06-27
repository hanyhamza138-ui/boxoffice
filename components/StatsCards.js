export default function StatsCards({
  totals = {},
  movies = [],
  cinemas = [],
}) {


  const totalRevenue =
    Number(totals.revenue || 0)
    .toLocaleString();


  const totalAudience =
    Number(totals.audience || 0)
    .toLocaleString();



  const activeMovies =
    movies.filter(
      (movie) =>
        Number(movie.revenue || 0) > 0
    ).length;



  const activeCinemas =
    cinemas.filter(
      (cinema) =>
        Number(cinema.revenue || 0) > 0
    ).length;



  const topMovie =
    [...movies]
    .sort(
      (a,b)=>
      Number(b.revenue || 0) -
      Number(a.revenue || 0)
    )[0];



  const topCinema =
    [...cinemas]
    .sort(
      (a,b)=>
      Number(b.revenue || 0) -
      Number(a.revenue || 0)
    )[0];



  const cards = [

    {
      title:"💰 Total Revenue",
      value:totalRevenue,
    },


    {
      title:"👥 Total Audience",
      value:totalAudience,
    },


    {
      title:"🎬 Active Movies",
      value:activeMovies,
    },


    {
      title:"🏢 Active Cinemas",
      value:activeCinemas,
    },


    {
      title:"🥇 Top Movie",
      value:
      topMovie
      ? topMovie.title
      : "No Data",
    },


    {
      title:"🏆 Top Cinema",
      value:
      topCinema
      ? topCinema.name
      : "No Data",
    },

  ];



  return (

    <div
      style={{
        display:"grid",
        gridTemplateColumns:
        "repeat(auto-fit,minmax(220px,1fr))",
        gap:20,
        marginTop:30,
        marginBottom:30,
      }}
    >

      {cards.map((card)=>(

        <div
          key={card.title}
          style={{
            background:"#1c1c1c",
            padding:24,
            borderRadius:14,
            border:"1px solid #333",
          }}
        >

          <h3
            style={{
              margin:0,
              color:"#9ca3af",
              fontSize:15,
              fontWeight:700,
            }}
          >
            {card.title}
          </h3>


          <div
            style={{
              marginTop:16,
              fontSize:28,
              fontWeight:900,
              lineHeight:1.3,
              wordBreak:"break-word",
            }}
          >
            {card.value}
          </div>


        </div>

      ))}

    </div>

  );

}