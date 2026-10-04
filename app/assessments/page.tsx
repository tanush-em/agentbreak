import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { id: true, name: true } },
      _count: { select: { findings: true } },
    },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Assessments"
        description="Security assessment history across all agents"
        actions={
          <Link
            href="/assessments/new"
            className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
          >
            <Plus className="h-3.5 w-3.5" />
            New Assessment
          </Link>
        }
      />

      {assessments.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No assessments yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run your first security assessment.
          </p>
          <Link
            href="/assessments/new"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}
          >
            Launch Assessment
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Agent</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
                <th className="px-3 py-2.5 font-medium">Risk</th>
                <th className="px-3 py-2.5 font-medium">Findings</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const href =
                  a.status === "COMPLETED"
                    ? `/assessments/${a.id}/report`
                    : a.status === "RUNNING" || a.status === "QUEUED"
                      ? `/assessments/${a.id}/run`
                      : `/assessments/${a.id}/report`;
                return (
                  <tr
                    key={a.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5">
                      <Link href={href} className="hover:underline">
                        {a.agent.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {a.securityScore ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {a.riskLevel ? (
                        <SeverityBadge value={a.riskLevel} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {a._count.findings}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {formatDate(a.completedAt || a.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <SeverityBadge value={a.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
