import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatsChartProps {
  data: Array<{
    name: string;
    wins: number;
    draws: number;
    losses: number;
  }>;
}

export default function StatsChart({ data }: StatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="wins" fill="hsl(var(--primary))" name="Victorias" />
        <Bar dataKey="draws" fill="hsl(var(--chart-3))" name="Empates" />
        <Bar dataKey="losses" fill="hsl(var(--destructive))" name="Derrotas" />
      </BarChart>
    </ResponsiveContainer>
  );
}
