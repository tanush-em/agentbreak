import { z } from "zod";
import { prisma } from "@/lib/db";
import { chatCompletion, isDemoMode } from "@/lib/openai/client";
import { countBySeverity } from "@/lib/security/scoring";

const ExecutiveSummarySchema = z.object({
  summary: z.string().min(20).max(2000),
});

export async function generateReport(assessmentId: string): Promise<void> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      agent: true,
      findings: true,
      executions: true,
    },
  });

  if (!assessment) throw new Error("Assessment not found");

  const severityCounts = countBySeverity(assessment.findings);
  const vulnerable = assessment.executions.filter(
    (e) => e.status === "VULNERABLE"
  ).length;
  const resisted = assessment.executions.filter(
    (e) => e.status === "RESISTED"
  ).length;

  const successByCategory = assessment.executions.map((e) => ({
    category: e.attackName,
    success: e.attackSuccess ?? 0,
    status: e.status,
    mode: e.mode,
  }));

  const templatedSummary = buildTemplatedSummary({
    agentName: assessment.agent.name,
    score: assessment.securityScore ?? 0,
    riskLevel: assessment.riskLevel ?? "MEDIUM",
    critical: severityCounts.CRITICAL,
    high: severityCounts.HIGH,
    medium: severityCounts.MEDIUM,
    low: severityCounts.LOW,
    vulnerable,
    resisted,
    total: assessment.executions.length,
  });

  let executiveSummary = templatedSummary;

  if (!isDemoMode()) {
    try {
      const { content, demo } = await chatCompletion({
        systemPrompt:
          "You are a concise AI security analyst. Write a short executive summary (3-5 sentences) for an agent security assessment. Be professional and specific. Return ONLY the summary text.",
        userPrompt: `Agent: ${assessment.agent.name}\nScore: ${assessment.securityScore}/100\nRisk: ${assessment.riskLevel}\nFindings: ${JSON.stringify(severityCounts)}\nAttack outcomes: ${vulnerable} vulnerable, ${resisted} resisted\nKey findings: ${assessment.findings
          .slice(0, 5)
          .map((f) => `${f.severity}: ${f.title}`)
          .join("; ")}`,
        temperature: 0.4,
      });

      if (!demo && content) {
        const parsed = ExecutiveSummarySchema.safeParse({ summary: content.trim() });
        if (parsed.success) {
          executiveSummary = parsed.data.summary;
        }
      }
    } catch {
      // Keep templated summary
    }
  }

  const reportJson = {
    securityScore: assessment.securityScore,
    riskLevel: assessment.riskLevel,
    severityCounts,
    successByCategory,
    outcomes: { vulnerable, resisted, total: assessment.executions.length },
    findings: assessment.findings.map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      description: f.description,
      impact: f.impact,
      recommendation: f.recommendation,
    })),
    generatedAt: new Date().toISOString(),
  };

  await prisma.report.upsert({
    where: { assessmentId },
    create: {
      assessmentId,
      executiveSummary,
      reportJson: JSON.stringify(reportJson),
    },
    update: {
      executiveSummary,
      reportJson: JSON.stringify(reportJson),
    },
  });
}

function buildTemplatedSummary(p: {
  agentName: string;
  score: number;
  riskLevel: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  vulnerable: number;
  resisted: number;
  total: number;
}): string {
  return (
    `Security assessment of ${p.agentName} completed with a score of ${p.score}/100 (${p.riskLevel} risk). ` +
    `Of ${p.total} attack modules executed, ${p.vulnerable} indicated vulnerabilities and ${p.resisted} were resisted. ` +
    `Finding severity breakdown: ${p.critical} critical, ${p.high} high, ${p.medium} medium, and ${p.low} low. ` +
    `Priority remediations should focus on the highest-severity findings, tightening tool scopes, and hardening prompt/instruction boundaries before redeployment.`
  );
}
