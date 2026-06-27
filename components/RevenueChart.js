"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


export default function RevenueChart({
  daily = []
}) {


  const data =
    daily.map((item) => ({
      name: item.date,
      revenue: Number(item.revenue || 0),
    }));



  return (

    <div
      style={{
        background:"#1c1c1c",
        padding:24,
        borderRadius:16,
        width:"100%",
        marginTop:30,
      }}
    >


      <h2
        style={{
          fontSize:24,
          fontWeight:900,
          marginBottom:25,
        }}
      >
        📈 Revenue Trend
      </h2>



      {
        data.length === 0

        ?

        (
          <div
            style={{
              textAlign:"center",
              color:"#888",
              padding:40,
            }}
          >
            No revenue data
          </div>
        )

        :

        (

          <div
            style={{
              width:"100%",
              height:350,
              minWidth:0,
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={data}
              >


                <CartesianGrid
                  strokeDasharray="3 3"
                />


                <XAxis
                  dataKey="name"
                />


                <YAxis />


                <Tooltip
                  formatter={(value)=>(
                    Number(value)
                    .toLocaleString()
                  )}
                />


                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00ff99"
                  strokeWidth={3}
                  dot={{
                    r:5
                  }}
                />


              </LineChart>

            </ResponsiveContainer>

          </div>

        )

      }


    </div>

  );

}