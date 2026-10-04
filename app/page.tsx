import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RiskChart } from "@/components/dashboard/risk-chart";
import { attackCatalog } from "@/lib/security/attacks";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [agents, assessments, findings, recent] = await Promise.all([
    prisma.agent.count(),
    prisma.assessment.count(),
    prisma.finding.findMany({ select: { severity: true } }),
    prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        agent: { select: { name: true } },
        _count: { select: { findings: true } },
      },
    }),
  ]);

  const criticalFindings = findings.filter((f) => f.severity === "CRITICAL").length;
  const completed = await prisma.assessment.findMany({
    where: { status: "COMPLETED", securityScore: { not: null } },
    select: { securityScore: true },
  });
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, a) => s + (a.securityScore || 0), 0) /
            completed.length
        )
      : 0;

  const severityData = [
    { name: "Critical", value: findings.filter((f) => f.severity === "CRITICAL").length },
    { name: "High", value: findings.filter((f) => f.severity === "HIGH").length },
    { name: "Medium", value: findings.filter((f) => f.severity === "MEDIUM").length },
    { name: "Low", value: findings.filter((f) => f.severity === "LOW").length },
  ];

  const coverage = {
    REAL: attackCatalog.filter((a) => a.status === "REAL").length,
    SIMULATED: attackCatalog.filter((a) => a.status === "SIMULATED").length,
    COMING_SOON: attackCatalog.filter((a) => a.status === "COMING_SOON").length,
  };

  return (
    <div className="p-6">
      <PageHeader
        title="AGENTBREAK"
        description="AI Agent Security / Red Teaming"
      />

      <KpiCards
        agents={agents}
        assessments={assessments}
        criticalFindings={criticalFindings}
        avgScore={avgScore}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4 lg:col-span-1">
          <h2 className="mb-2 text-sm font-medium">Risk Overview</h2>
          <RiskChart data={severityData} />
        </div>

        <div className="rounded-md border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent Assessments</h2>
            <Link
              href="/assessments"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Agent</th>
                  <th className="pb-2 pr-3 font-medium">Score</th>
                  <th className="pb-2 pr-3 font-medium">Risk</th>
                  <th className="pb-2 pr-3 font-medium">Findings</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      <Link
                        href={`/assessments/${a.id}/report`}
                        className="hover:underline"
                      >
                        {a.agent.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {a.securityScore ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      {a.riskLevel ? (
                        <SeverityBadge value={a.riskLevel} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {a._count.findings}
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {formatDate(a.completedAt || a.createdAt)}
                    </td>
                    <td className="py-2.5">
                      <SeverityBadge value={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Attack Coverage</h2>
          <Link
            href="/attacks"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Attack Library
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["REAL", coverage.REAL, "Live OpenAI tests"],
              ["SIMULATED", coverage.SIMULATED, "Deterministic modules"],
              ["COMING SOON", coverage.COMING_SOON, "Roadmap categories"],
            ] as const
          ).map(([label, count, hint]) => (
            <div
              key={label}
              className="rounded border border-border bg-background/50 px-3 py-2.5"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{count}</div>
              <div className="text-xs text-muted-foreground">{hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
