import { Bot, Shield, AlertTriangle, Gauge } from "lucide-react";

export function KpiCards({
  agents,
  assessments,
  criticalFindings,
  avgScore,
}: {
  agents: number;
  assessments: number;
  criticalFindings: number;
  avgScore: number;
}) {
  const cards = [
    { label: "Agents Assessed", value: agents, icon: Bot },
    { label: "Security Assessments", value: assessments, icon: Shield },
    { label: "Critical Findings", value: criticalFindings, icon: AlertTriangle, accent: "text-critical" },
    { label: "Average Security Score", value: avgScore, icon: Gauge },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-md border border-border bg-card px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <Icon className={`h-3.5 w-3.5 ${c.accent || "text-muted-foreground"}`} />
            </div>
            <div className={`mt-2 text-2xl font-semibold tabular-nums ${c.accent || ""}`}>
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
