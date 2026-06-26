export default function StatsCards({
  totals = {}
}) {


  return (

    <div
      style={{
        display:"grid",
        gridTemplateColumns:
        "repeat(auto-fit,minmax(220px,1fr))",
        gap:20,
      }}
    >


      <Card
        title="💰 Revenue"
        value={
          Number(
            totals.revenue || 0
          ).toLocaleString()
        }
      />



      <Card
        title="🎟 Tickets"
        value={
          Number(
            totals.audience || 0
          ).toLocaleString()
        }
      />



      <Card
        title="📝 Records"
        value={
          totals.records || 0
        }
      />


    </div>

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
        padding:20,
        borderRadius:12,
      }}
    >

      <h3>
        {title}
      </h3>


      <p
        style={{
          fontSize:24,
          fontWeight:"bold",
        }}
      >
        {value}
      </p>


    </div>

  );

}