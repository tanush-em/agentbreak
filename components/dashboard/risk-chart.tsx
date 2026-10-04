"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
};

export function RiskChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No findings yet
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            {filtered.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || "#71717a"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: 4,
              fontSize: 12,
              color: "#18181b",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span className="text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
