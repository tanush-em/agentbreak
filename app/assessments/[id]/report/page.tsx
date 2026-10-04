import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { ReportView } from "@/components/reports/report-view";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      agent: true,
      findings: {
        orderBy: { createdAt: "asc" },
        include: { attackExecution: true },
      },
      executions: { orderBy: { createdAt: "asc" } },
      report: true,
    },
  });

  if (!assessment) notFound();

  if (assessment.status !== "COMPLETED" || !assessment.report) {
    return (
      <div className="p-6">
        <PageHeader title="Security Report" />
        <div className="rounded-md border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Report not ready yet. Assessment status: {assessment.status}
          </p>
          <Link
            href={`/assessments/${id}/run`}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}
          >
            View live assessment
          </Link>
        </div>
      </div>
    );
  }

  let reportData: {
    severityCounts?: Record<string, number>;
    successByCategory?: {
      category: string;
      success: number;
      status: string;
      mode: string;
    }[];
    outcomes?: { vulnerable: number; resisted: number; total: number };
    assessmentRef?: string;
  } = {};
  try {
    reportData = JSON.parse(assessment.report.reportJson);
  } catch {
    reportData = {};
  }

  const severityCounts = reportData.severityCounts || {
    CRITICAL: assessment.findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH: assessment.findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: assessment.findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: assessment.findings.filter((f) => f.severity === "LOW").length,
  };

  const successByCategory =
    reportData.successByCategory ||
    assessment.executions.map((e) => ({
      category: e.attackName,
      success: e.attackSuccess ?? 0,
      status: e.status,
      mode: e.mode,
    }));

  const outcomes = reportData.outcomes || {
    vulnerable: assessment.executions.filter((e) => e.status === "VULNERABLE")
      .length,
    resisted: assessment.executions.filter((e) => e.status === "RESISTED")
      .length,
    total: assessment.executions.length,
  };

  const shortId = `AB-${assessment.id.slice(-6).toUpperCase()}`;

  return (
    <div className="p-6">
      <PageHeader
        title="Security Report"
        description="Risk summary, findings, and remediation guidance"
        actions={
          <Link
            href={`/agents/${assessment.agentId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View Agent
          </Link>
        }
      />
      <ReportView
        agentName={assessment.agent.name}
        assessmentRef={reportData.assessmentRef || shortId}
        score={assessment.securityScore ?? 0}
        riskLevel={assessment.riskLevel ?? "MEDIUM"}
        summary={assessment.report.executiveSummary}
        severityCounts={severityCounts}
        successByCategory={successByCategory}
        outcomes={outcomes}
        findings={assessment.findings.map((f) => ({
          id: f.id,
          title: f.title,
          severity: f.severity,
          description: f.description,
          impact: f.impact,
          recommendation: f.recommendation,
          attackName: f.attackExecution?.attackName,
          attackType: f.attackExecution?.attackType,
          mode: f.attackExecution?.mode,
          attackSuccess: f.attackExecution?.attackSuccess,
          confidence: f.attackExecution?.confidence,
          payload: f.attackExecution?.payload,
          evidence: f.attackExecution?.evidence || f.description,
          agentName: assessment.agent.name,
        }))}
      />
    </div>
  );
}
