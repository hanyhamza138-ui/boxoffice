"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";


export default function HomeContent({ movies }) {

  const {
    language,
    isArabic
  } = useLanguage();


  const font =
    isArabic
    ? "Cairo, Arial, sans-serif"
    : "Poppins, Arial, sans-serif";


  return (

    <main
  dir={isArabic ? "rtl" : "ltr"}
  style={{
    background:"#0b0b0b",
    color:"white",
    minHeight:"100vh",
    padding:40,
    fontFamily: font
  }}
>


<header
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:50,
flexWrap:"wrap",
gap:20
}}
>

<h1
style={{
fontSize:44,
fontWeight:900,
letterSpacing:1
}}
>
🎬 {
language==="ar"
?"شباك التذاكر المصري"
:"Box Office Egypt"
}
</h1>


<div
style={{
display:"flex",
gap:15,
alignItems:"center"
}}
>

<LanguageSwitcher />


<Link href="/admin">

<button
style={{
padding:"12px 22px",
borderRadius:10,
border:"none",
cursor:"pointer",
fontWeight:900
}}
>
⚙️ {
language==="ar"
?"لوحة التحكم"
:"Admin Panel"
}
</button>

</Link>

</div>


</header>



<h2
style={{
fontSize:32,
fontWeight:900,
marginBottom:40
}}
>
🏆 {
language==="ar"
?"الأفلام الأعلى إيراداً"
:"Top Movies By Revenue"
}
</h2>



<div
style={{
display:"grid",
gridTemplateColumns:
"repeat(auto-fill,minmax(280px,1fr))",
gap:35
}}
>


{movies.map((movie,index)=>{


let badge="#333";
let medal="";

if(index===0){
badge="gold";
medal="🥇";
}

if(index===1){
badge="silver";
medal="🥈";
}

if(index===2){
badge="#cd7f32";
medal="🥉";
}


return (


<div
key={movie.id}
style={{
background:"#151515",
borderRadius:20,
padding:25,
boxShadow:
"0 15px 40px rgba(0,0,0,.6)",
border:
index<3
?`2px solid ${badge}`
:"1px solid #333"
}}
>



{/* Rank */}

<div
style={{
display:"flex",
alignItems:"center",
gap:20,
marginBottom:25
}}
>


<div
style={{
width:70,
height:70,
borderRadius:"50%",
background:badge,
color:index<3?"black":"white",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:34,
fontWeight:1000,
fontFamily:"Arial"
}}
>
{index+1}
</div>


<div
style={{
fontSize:45
}}
>
{medal}
</div>


</div>




{/* Poster */}

<div
style={{
borderRadius:18,
overflow:"hidden",
height:400
}}
>

<img
src={
movie.poster ||
"https://placehold.co/300x450"
}
alt={movie.title}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>

</div>





{/* Title */}

<h3
style={{
fontSize:30,
fontWeight:1000,
marginTop:30,
marginBottom:20,
lineHeight:1.2
}}
>

{movie.title}

</h3>





<div
style={{
background:"#222",
borderRadius:15,
padding:18,
fontSize:18,
fontWeight:700,
lineHeight:2
}}
>

<div>
💰 {
movie.revenue?.toLocaleString() || 0
}
</div>


<div>
👥 {
movie.audience?.toLocaleString() || 0
}
</div>


<div>
🎬 {
movie.cinemas || 0
}
</div>


<div>
🌍 {
movie.language || "-"
}
</div>


</div>




<Link href={`/movie/${movie.id}`}>

<button
style={{
marginTop:20,
width:"100%",
padding:14,
borderRadius:12,
border:"none",
background:"#2563eb",
color:"white",
fontSize:18,
fontWeight:900,
cursor:"pointer"
}}
>

🎬 {
language==="ar"
?"التفاصيل"
:"Details"
}

</button>

</Link>



{movie.trailer && (

<a
href={movie.trailer}
target="_blank"
style={{
display:"block",
marginTop:10,
textAlign:"center",
background:"#dc2626",
padding:12,
borderRadius:12,
fontWeight:900,
textDecoration:"none",
color:"white"
}}
>

▶ {
language==="ar"
?"مشاهدة الإعلان"
:"Trailer"
}

</a>

)}



</div>


);


})}


</div>


</main>

);

}