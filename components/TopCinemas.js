"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function TopCinemas({
  cinemas = []
}) {


  const chartData =
    cinemas
    .slice(0,10)
    .map(cinema => ({
      name:
        cinema.name,

      revenue:
        Number(cinema.revenue || 0),
    }));



  return (

    <div
      style={{
        background:"#1c1c1c",
        padding:20,
        borderRadius:12,
        marginTop:30,
      }}
    >


      <h2>
        🏢 Top Cinemas
      </h2>



      {
        chartData.length === 0

        ?

        <div
          style={{
            color:"#888",
            padding:30,
            textAlign:"center",
          }}
        >
          No data
        </div>


        :


        <div
          style={{
            width:"100%",
            height:350,
            marginTop:20,
          }}
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />


              <XAxis
                dataKey="name"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={80}
              />


              <YAxis />


              <Tooltip
                formatter={(value)=>[
                  Number(value)
                  .toLocaleString(),
                  "💰 Revenue"
                ]}
              />


              <Bar
                dataKey="revenue"
                name="Revenue"
              />


            </BarChart>


          </ResponsiveContainer>


        </div>

      }



      <ul
        style={{
          marginTop:30,
          lineHeight:2,
          listStyle:"none",
          padding:0,
        }}
      >

        {
          cinemas
          .slice(0,10)
          .map(
            (cinema,index)=>(

              <li
                key={cinema.cinema_id}
              >

                #{index + 1}{" "}
                {cinema.code}
                {" - "}
                {cinema.name}

                {" | "}

                {
                  Number(
                    cinema.revenue || 0
                  )
                  .toLocaleString()
                }

              </li>

            )
          )
        }

      </ul>


    </div>

  );

}