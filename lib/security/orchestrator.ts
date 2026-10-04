import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/openai/client";
import { getAttackModules } from "@/lib/security/attacks";
import { generateReport } from "@/lib/reports/generator";
import { calculateSecurityScore } from "@/lib/security/scoring";
import {
  AgentProfile,
  AgentTool,
  AttackCategory,
  Severity,
} from "@/lib/security/types";

function toAgentProfile(agent: {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  memoryEnabled: boolean;
  toolsJson: string;
  knowledgeSourcesJson: string;
}): AgentProfile {
  let tools: AgentTool[] = [];
  let knowledgeSources: string[] = [];
  try {
    tools = JSON.parse(agent.toolsJson);
  } catch {
    tools = [];
  }
  try {
    knowledgeSources = JSON.parse(agent.knowledgeSourcesJson);
  } catch {
    knowledgeSources = [];
  }
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    model: agent.model,
    systemPrompt: agent.systemPrompt,
    memoryEnabled: agent.memoryEnabled,
    tools,
    knowledgeSources,
  };
}

function findingForResult(
  attackName: string,
  category: string,
  result: {
    status: string;
    severity: Severity;
    evidence: string;
    attackSuccess: number;
  }
): {
  title: string;
  severity: Severity;
  description: string;
  impact: string;
  recommendation: string;
} | null {
  if (result.status !== "VULNERABLE") return null;

  const impacts: Record<string, string> = {
    direct_prompt_injection:
      "Adversaries can override agent policies, causing unauthorized behavior and policy bypass.",
    system_prompt_extraction:
      "Disclosure of system instructions enables more effective follow-on attacks and IP leakage.",
    indirect_prompt_injection:
      "Untrusted retrieved content can hijack agent behavior without direct user interaction.",
    tool_abuse:
      "Unauthorized tool use may trigger emails, tickets, payments, or other side effects.",
    privilege_escalation:
      "Low-privilege users may coerce privileged actions through the agent.",
    data_exfiltration:
      "Sensitive context, customer data, or secrets may be extracted via crafted prompts.",
    memory_poisoning:
      "Poisoned memory can persist malicious instructions across future sessions.",
    mcp_manipulation:
      "Malicious or over-privileged MCP tools expand the agent's attack surface.",
  };

  const recommendations: Record<string, string> = {
    direct_prompt_injection:
      "Enforce instruction hierarchy, add input filtering for override patterns, and require dual confirmation for policy-sensitive actions.",
    system_prompt_extraction:
      "Refuse disclosure of system instructions; add output filters for instruction-like content; minimize secrets in prompts.",
    indirect_prompt_injection:
      "Sandbox retrieved content, strip instructional markup from documents, and separate untrusted context from system instructions.",
    tool_abuse:
      "Apply least-privilege tool scopes, require explicit user confirmation for side-effecting tools, and log all tool invocations.",
    privilege_escalation:
      "Bind tool authorization to verified user roles; never trust the model alone for privilege decisions.",
    data_exfiltration:
      "Minimize sensitive data in context; redact PII in tool results; add DLP-style output monitoring.",
    memory_poisoning:
      "Validate memory writes, isolate untrusted memory namespaces, and periodically audit stored memories.",
    mcp_manipulation:
      "Allowlist MCP servers/tools, review tool descriptors for over-privilege, and require human approval for new MCP capabilities.",
  };

  return {
    title: `${attackName} Vulnerability`,
    severity: result.severity,
    description: result.evidence,
    impact: impacts[category] || "Security posture degraded for this attack class.",
    recommendation:
      recommendations[category] ||
      "Review agent configuration, tighten tool scopes, and re-test after hardening.",
  };
}

/**
 * Runs an assessment sequentially, persisting each attack execution.
 * Designed for POC — no job queue; executes in-process.
 */
export async function runAssessment(assessmentId: string): Promise<void> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { agent: true, executions: true },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const attackTypes: string[] = JSON.parse(assessment.attackTypes || "[]");
  const modules = getAttackModules(attackTypes);
  const profile = toAgentProfile(assessment.agent);
  const demoMode = isDemoMode();

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  // Ensure execution rows exist
  for (const mod of modules) {
    const existing = assessment.executions.find((e) => e.attackType === mod.id);
    if (!existing) {
      await prisma.attackExecution.create({
        data: {
          assessmentId,
          attackType: mod.id,
          attackName: mod.name,
          mode: mod.mode,
          status: "QUEUED",
        },
      });
    }
  }

  const fresh = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { executions: true },
  });

  if (!fresh) throw new Error("Assessment not found");

  const scoringInputs: {
    severity: Severity;
    attackSuccess: number;
    status: "VULNERABLE" | "RESISTED" | "ERROR";
  }[] = [];

  try {
    for (const mod of modules) {
      const execution = fresh.executions.find((e) => e.attackType === mod.id);
      if (!execution) continue;

      await prisma.attackExecution.update({
        where: { id: execution.id },
        data: { status: "RUNNING" },
      });

      try {
        const result = await mod.execute(profile, {
          assessmentId,
          demoMode,
        });

        await prisma.attackExecution.update({
          where: { id: execution.id },
          data: {
            status: result.status,
            severity: result.severity,
            attackSuccess: result.attackSuccess,
            confidence: result.confidence,
            evidence: result.evidence,
            payload: result.payload,
            durationMs: result.durationMs,
            mode: result.mode,
          },
        });

        scoringInputs.push({
          severity: result.severity,
          attackSuccess: result.attackSuccess,
          status: result.status,
        });

        const finding = findingForResult(
          mod.name,
          mod.id,
          result
        );
        if (finding) {
          await prisma.finding.create({
            data: {
              assessmentId,
              attackExecutionId: execution.id,
              ...finding,
            },
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown attack error";
        await prisma.attackExecution.update({
          where: { id: execution.id },
          data: {
            status: "ERROR",
            evidence: message,
            severity: "INFO",
            attackSuccess: 0,
            confidence: 0,
          },
        });
        scoringInputs.push({
          severity: "INFO",
          attackSuccess: 0,
          status: "ERROR",
        });
      }
    }

    const { score, riskLevel } = calculateSecurityScore(scoringInputs);

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        securityScore: score,
        riskLevel,
        completedAt: new Date(),
      },
    });

    await generateReport(assessmentId);
  } catch (err) {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "FAILED", completedAt: new Date() },
    });
    throw err;
  }
}

export async function createAndQueueAssessment(params: {
  agentId: string;
  attackTypes: AttackCategory[];
}): Promise<string> {
  const assessment = await prisma.assessment.create({
    data: {
      agentId: params.agentId,
      status: "QUEUED",
      attackTypes: JSON.stringify(params.attackTypes),
      executions: {
        create: getAttackModules(params.attackTypes).map((m) => ({
          attackType: m.id,
          attackName: m.name,
          mode: m.mode,
          status: "QUEUED",
        })),
      },
    },
  });
  return assessment.id;
}
