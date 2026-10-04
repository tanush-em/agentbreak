import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const findings = await prisma.finding.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assessment: {
        include: {
          agent: { select: { id: true, name: true } },
        },
      },
      attackExecution: true,
    },
  });

  return NextResponse.json(
    findings.map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      description: f.description,
      impact: f.impact,
      recommendation: f.recommendation,
      createdAt: f.createdAt,
      agent: f.assessment.agent,
      assessmentId: f.assessmentId,
      attackType: f.attackExecution?.attackType ?? null,
      attackName: f.attackExecution?.attackName ?? null,
      mode: f.attackExecution?.mode ?? null,
      attackSuccess: f.attackExecution?.attackSuccess ?? null,
      confidence: f.attackExecution?.confidence ?? null,
      payload: f.attackExecution?.payload ?? null,
      evidence: f.attackExecution?.evidence ?? f.description,
    }))
  );
}
