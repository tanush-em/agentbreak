import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await params;

  const report = await prisma.report.findUnique({
    where: { assessmentId },
    include: {
      assessment: {
        include: {
          agent: true,
          findings: { orderBy: { createdAt: "asc" } },
          executions: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  let reportData = {};
  try {
    reportData = JSON.parse(report.reportJson);
  } catch {
    reportData = {};
  }

  return NextResponse.json({
    id: report.id,
    assessmentId: report.assessmentId,
    executiveSummary: report.executiveSummary,
    report: reportData,
    createdAt: report.createdAt,
    assessment: {
      id: report.assessment.id,
      status: report.assessment.status,
      securityScore: report.assessment.securityScore,
      riskLevel: report.assessment.riskLevel,
      startedAt: report.assessment.startedAt,
      completedAt: report.assessment.completedAt,
      agent: {
        id: report.assessment.agent.id,
        name: report.assessment.agent.name,
        model: report.assessment.agent.model,
      },
      findings: report.assessment.findings,
      executions: report.assessment.executions,
    },
  });
}
