import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TrendingToken } from "../../types/market"

interface TrendingVolumeChartProps {
  data: TrendingToken[]
}

export function TrendingVolumeChart({ data }: TrendingVolumeChartProps) {
  const chartData = data.slice(0, 8).map((t) => ({
    name: t.pairName.length > 14 ? `${t.pairName.slice(0, 14)}…` : t.pairName,
    volume: t.volume24hUsd,
  }))

  if (chartData.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
      >
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={11}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={50}
        />

        <YAxis
          stroke="#64748b"
          fontSize={11}
          tickFormatter={(value) =>
            `$${Intl.NumberFormat("en", {
              notation: "compact",
            }).format(Number(value))}`
          }
        />

        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#e2e8f0" }}
        />

        <Bar
          dataKey="volume"
          fill="#22d3ee"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
