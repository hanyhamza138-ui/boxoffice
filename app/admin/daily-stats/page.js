import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { cookies } from "next/headers";

import ar from "../../../translations/ar";
import en from "../../../translations/en";


export default async function DailyStatsPage() {


  const cookieStore = await cookies();


  const language =
    cookieStore.get("language")?.value || "en";


  const t =
    language === "ar"
      ? ar
      : en;





  const { data: statsData } = await supabase
    .from("daily_stats")
    .select("*")
    .order("date", { ascending:false });



  const { data: moviesData } = await supabase
    .from("movies")
    .select("id,title");



  const { data: cinemasData } = await supabase
    .from("cinemas")
    .select("id,name,city");




  const stats = statsData || [];

  const movies = moviesData || [];

  const cinemas = cinemasData || [];





  const movieMap = {};

  movies.forEach((movie)=>{

    movieMap[movie.id] = movie.title;

  });





  const cinemaMap = {};

  cinemas.forEach((cinema)=>{

    cinemaMap[cinema.id] = cinema;

  });








return (


<main

dir={language==="ar" ? "rtl" : "ltr"}

style={{

background:"#111",

color:"white",

minHeight:"100vh",

padding:40,

}}

>





<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

marginBottom:30,

flexWrap:"wrap",

gap:20

}}

>



<h1>

📅 {t.dailyStats}

</h1>





<Link href="/admin/daily-stats/add">


<button style={addBtn}>


➕

{

language==="ar"

?

"إضافة إحصائية"

:

"Add Daily Stat"

}


</button>


</Link>



</div>









{
stats.length === 0 ?


<div

style={emptyBox}

>

{

language==="ar"

?

"لا توجد إحصائيات يومية"

:

"No daily stats found"

}


</div>



:



<div

style={{

overflowX:"auto",

background:"#1c1c1c",

borderRadius:15

}}

>



<table

style={{

width:"100%",

borderCollapse:"collapse"

}}

>



<thead>


<tr>


<th style={thStyle}>
ID
</th>



<th style={thStyle}>
{t.movies}
</th>



<th style={thStyle}>
{t.cinemas}
</th>



<th style={thStyle}>
City
</th>



<th style={thStyle}>
{t.revenue}
</th>



<th style={thStyle}>
{t.audience}
</th>



<th style={thStyle}>
{t.date}
</th>



<th style={thStyle}>

{

language==="ar"

?

"الإجراء"

:

"Action"

}

</th>


</tr>


</thead>





<tbody>


{

stats.map((item)=>(


<tr

key={item.id}

style={{

borderTop:"1px solid #333"

}}

>



<td style={tdStyle}>
{item.id}
</td>





<td style={tdStyle}>

{
movieMap[item.movie_id] || "-"
}

</td>





<td style={tdStyle}>

{
cinemaMap[item.cinema_id]?.name || "-"
}

</td>





<td style={tdStyle}>

{
cinemaMap[item.cinema_id]?.city || "-"
}

</td>





<td style={tdStyle}>

{
(item.revenue || 0)
.toLocaleString()

}

</td>





<td style={tdStyle}>

{
(item.audience || 0)
.toLocaleString()

}

</td>





<td style={tdStyle}>

{item.date}

</td>






<td style={tdStyle}>


<Link href={`/admin/daily-stats/edit/${item.id}`}>

<button style={editBtn}>


✏️

{

language==="ar"

?

"تعديل"

:

"Edit"

}


</button>


</Link>


</td>




</tr>



))

}



</tbody>



</table>



</div>


}



</main>


);


}







const thStyle={

padding:15,

textAlign:"start",

background:"#222"

};




const tdStyle={

padding:15

};





const addBtn={

background:"#2563eb",

color:"white",

border:"none",

padding:"12px 20px",

borderRadius:8,

cursor:"pointer",

fontWeight:"bold"

};





const editBtn={

background:"#2563eb",

color:"white",

border:"none",

padding:"8px 14px",

borderRadius:6,

cursor:"pointer"

};





const emptyBox={

background:"#1c1c1c",

padding:30,

borderRadius:10,

textAlign:"center"

};