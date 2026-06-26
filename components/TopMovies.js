export default function TopMovies({
  movies = []
}) {
  return (
    <div
      style={{
        background:"#1c1c1c",
        padding:20,
        borderRadius:12,
      }}
    >

      <h2>
        🎬 Top Movies
      </h2>

      <ul
        style={{
          marginTop:20,
          lineHeight:2,
          listStyle:"none",
          padding:0,
        }}
      >

        {
          movies
          .slice(0,10)
          .map(
            (movie,index)=>(

              <li
                key={movie.movie_id}
              >

                #{index + 1}{" "}
                {movie.code}
                {" - "}
                {movie.title}

                {" | "}

                {
                  Number(
                    movie.revenue || 0
                  ).toLocaleString()
                }

              </li>

            )
          )
        }


      </ul>


    </div>

  );

}