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
  daily
}) {


  return (

    <div
      style={{
        background:"#1c1c1c",
        padding:"20px",
        borderRadius:"10px",
        marginTop:"30px",
      }}
    >

      <h2>
        📈 الإيراد والجمهور اليومي
      </h2>


      <div
        style={{
          width:"100%",
          height:"350px",
        }}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={daily}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />


            <XAxis
              dataKey="date"
            />


            <YAxis />


            <Tooltip />


            <Legend />



            <Line
              type="monotone"
              dataKey="revenue"
              name="الإيراد"
              strokeWidth={3}
            />



            <Line
              type="monotone"
              dataKey="audience"
              name="الجمهور"
              strokeWidth={3}
            />


          </LineChart>

        </ResponsiveContainer>


      </div>


    </div>

  );

}