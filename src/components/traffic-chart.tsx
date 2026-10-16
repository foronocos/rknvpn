import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export interface TrafficPoint {
  t: number;
  mbps: number;
}

export function TrafficChart({ data }: { data: TrafficPoint[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-muted">Канал молчит. Включите его — здесь пойдёт скорость.</p>;
  }
  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={["auto", "auto"]} />
          <Line
            type="monotone"
            dataKey="mbps"
            stroke="var(--color-cyan)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
