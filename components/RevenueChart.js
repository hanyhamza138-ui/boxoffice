"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 5000 },
  { name: "Thu", revenue: 2780 },
  { name: "Fri", revenue: 6890 },
  { name: "Sat", revenue: 8390 },
  { name: "Sun", revenue: 9490 },
];

export default function RevenueChart() {
  return (
    <div
      className="
        bg-[#1c1c1c]
        p-6
        rounded-2xl
        w-full
      "
    >
      <h2 className="text-2xl font-bold mb-6">
        📈 Weekly Revenue
      </h2>

      <div
        style={{
          width: "100%",
          height: "300px",
          minWidth: 0,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#00ff99"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}