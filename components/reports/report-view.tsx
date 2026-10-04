"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScoreRing } from "@/components/shared/score-ring";
import { SeverityBadge } from "@/components/shared/severity-badge";
import {
  FindingDrawer,
  FindingDetail,
} from "@/components/findings/finding-drawer";

const SEV_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
};

type Props = {
  agentName: string;
  assessmentRef: string;
  score: number;
  riskLevel: string;
  summary: string;
  severityCounts: Record<string, number>;
  successByCategory: {
    category: string;
    success: number;
    status: string;
    mode: string;
  }[];
  findings: FindingDetail[];
  outcomes: { vulnerable: number; resisted: number; total: number };
};

export function ReportView(props: Props) {
  const [selected, setSelected] = useState<FindingDetail | null>(null);

  const severityChart = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    .map((name) => ({
      name,
      value: props.severityCounts[name] || 0,
    }))
    .filter((d) => d.value > 0);

  const outcomeChart = [
    { name: "Vulnerable", value: props.outcomes.vulnerable },
    { name: "Resisted", value: props.outcomes.resisted },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-card p-6">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Agent Security Report
        </div>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">{props.agentName}</h2>
            <p className="mt-1 font-mono-tech text-xs text-muted-foreground">
              Assessment {props.assessmentRef}
            </p>
            <div className="mt-3">
              <SeverityBadge value={props.riskLevel} className="text-xs" />
              <span className="ml-2 text-xs text-muted-foreground">RISK</span>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xs text-muted-foreground">
              Security Score
            </div>
            <ScoreRing score={props.score} size={110} />
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
          {props.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((s) => (
            <div key={s}>
              <span className="tabular-nums font-medium">
                {props.severityCounts[s] || 0}
              </span>{" "}
              <span className="text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Severity Distribution">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  stroke="none"
                >
                  {severityChart.map((e) => (
                    <Cell key={e.name} fill={SEV_COLORS[e.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e4e4e7",
                    fontSize: 12,
                    color: "#18181b",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Attack Success by Category">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={props.successByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="category"
                  tick={false}
                  axisLine={{ stroke: "#e4e4e7" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={{ stroke: "#e4e4e7" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e4e4e7",
                    fontSize: 12,
                    color: "#18181b",
                  }}
                />
                <Bar dataKey="success" fill="#ea580c" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Execution Outcomes">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  stroke="none"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#dc2626" />
                  <Cell fill="#16a34a" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e4e4e7",
                    fontSize: 12,
                    color: "#18181b",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium">Findings</h3>
        <div className="space-y-2">
          {props.findings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No vulnerabilities recorded.
            </p>
          )}
          {props.findings.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelected(f)}
              className="w-full rounded border border-border bg-background/50 px-4 py-3 text-left transition-colors hover:border-muted-foreground/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge value={f.severity} />
                <span className="text-sm font-medium">{f.title}</span>
                {f.mode && <SeverityBadge value={f.mode} />}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {f.attackSuccess != null && (
                  <span>Attack Success Rate {f.attackSuccess}%</span>
                )}
                {f.attackName && <span>{f.attackName}</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {f.impact}
              </p>
            </button>
          ))}
        </div>
      </div>

      <FindingDrawer
        finding={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {children}
    </div>
  );
}
