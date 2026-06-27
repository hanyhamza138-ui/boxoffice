"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


export default function AnalyticsCharts({
  daily = []
}) {


  const chartData =
    daily.map(item => ({
      ...item,
      date:
        new Date(item.date)
        .toLocaleDateString("en-US",{
          month:"short",
          day:"numeric",
        }),

      revenue:
        Number(item.revenue || 0),

      audience:
        Number(item.audience || 0),
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


      <h2
        style={{
          fontSize:24,
          fontWeight:900,
          marginBottom:25,
        }}
      >
        📈 Daily Revenue & Audience
      </h2>



      {
        chartData.length === 0

        ?

        <div
          style={{
            textAlign:"center",
            color:"#888",
            padding:40,
          }}
        >
          No data
        </div>


        :


        <div
          style={{
            width:"100%",
            height:350,
          }}
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={chartData}
              margin={{
                top:10,
                right:20,
                left:10,
                bottom:10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />


              <XAxis
                dataKey="date"
              />


              <YAxis
                allowDecimals={false}
              />


              <Tooltip
                formatter={(value,name)=>[
                  Number(value)
                  .toLocaleString(),
                  name
                ]}
              />


              <Legend />



              <Line
                type="monotone"
                dataKey="revenue"
                name="💰 Revenue"
                strokeWidth={3}
                dot={{r:4}}
                connectNulls
              />



              <Line
                type="monotone"
                dataKey="audience"
                name="👥 Audience"
                strokeWidth={3}
                dot={{r:4}}
                connectNulls
              />


            </LineChart>


          </ResponsiveContainer>


        </div>

      }


    </div>

  );

}