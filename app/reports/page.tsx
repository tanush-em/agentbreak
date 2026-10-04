import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assessment: {
        include: {
          agent: { select: { name: true } },
          _count: { select: { findings: true } },
        },
      },
    },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Reports"
        description="Generated security assessment reports"
      />

      {reports.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No reports yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/assessments/${r.assessmentId}/report`}
              className="rounded-md border border-border bg-card p-4 transition-colors hover:border-muted-foreground/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{r.assessment.agent.name}</h3>
                  <p className="font-mono-tech mt-0.5 text-[11px] text-muted-foreground">
                    AB-{r.assessmentId.slice(-6).toUpperCase()}
                  </p>
                </div>
                {r.assessment.riskLevel && (
                  <SeverityBadge value={r.assessment.riskLevel} />
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {r.executiveSummary}
              </p>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  Score {r.assessment.securityScore ?? "—"}
                </span>
                <span>{r.assessment._count.findings} findings</span>
                <span>{formatDate(r.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
